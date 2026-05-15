const openaiService = require('../services/openaiService');
const cacheService = require('../services/cacheService');
const promptBuilder = require('../services/promptBuilder');
const { parseJSONResponse, validateResponse } = require('../utils/jsonValidator');
const chunkManager = require('../utils/chunking');
const History = require('../models/historyModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const processAIRequest = async (mode, input, options = {}, userId) => {
  const cacheKey = cacheService.generateCacheKey(input, mode, options);
  const cached = await cacheService.get(cacheKey);
  
  if (cached) {
    logger.info(`Cache hit for ${mode} request`);
    return { ...cached, cacheHit: true };
  }

  const shouldChunk = chunkManager.shouldChunk(input.code || input.diff || input.error || '');
  let result;

  if (shouldChunk) {
    logger.info(`Chunking input for ${mode}`);
    const chunks = chunkManager.chunkText(input.code || input.diff || input.error || '');
    const results = [];

    for (const chunk of chunks) {
      const chunkInput = { ...input };
      if (input.code) chunkInput.code = chunk.text;
      if (input.diff) chunkInput.diff = chunk.text;
      if (input.error) chunkInput.error = chunk.text;
      
      const prompt = promptBuilder.buildPrompt(mode, chunkInput, options);
      const systemPrompt = promptBuilder.getSystemPrompt(mode);
      
      const response = await openaiService.createCompletion(prompt, { systemPrompt });
      const parsed = parseJSONResponse(response.content);
      results.push(parsed);
    }

    result = chunkManager.mergeChunks(results);
    result.cacheHit = false;
  } else {
    const prompt = promptBuilder.buildPrompt(mode, input, options);
    const systemPrompt = promptBuilder.getSystemPrompt(mode);
    
    const response = await openaiService.createCompletion(prompt, { systemPrompt });
    const parsed = parseJSONResponse(response.content);
    
    if (!parsed) {
      throw new AppError('Failed to parse AI response as JSON', 500, 'INVALID_AI_RESPONSE');
    }
    
    result = {
      ...parsed,
      tokensUsed: response.tokensUsed,
      processingTime: response.processingTime,
      model: response.model,
      cacheHit: false
    };
  }

  const validation = validateResponse(mode, result);
  if (!validation.valid) {
    logger.warn('Response validation failed, returning raw response', validation.error);
  }

  await cacheService.set(cacheKey, validation.valid ? validation.data : result);

  return validation.valid ? validation.data : result;
};

const codeReview = asyncHandler(async (req, res) => {
  const { code, language, options, diff, prInfo } = req.validatedBody;
  const userId = req.currentUser?._id?.toString() || null;
  
  const inputCode = code || diff;
  const isPRReview = !!diff;
  
  logger.info('Code review request received', { language, codeLength: inputCode.length, isPRReview });

  // Check limit BEFORE processing
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      if (user.usage.reviewsUsed >= user.usage.reviewsLimit) {
        return res.status(429).json({
          success: false,
          error: 'Review limit exceeded. Upgrade to Pro for unlimited reviews.',
          code: 'LIMIT_EXCEEDED'
        });
      }
    }
  }

  try {
    const result = await processAIRequest('code-review', { 
      code: inputCode, 
      language, 
      isPRReview,
      prInfo 
    }, options, userId);

    // Only count as used on SUCCESS
    if (userId) {
      await User.findByIdAndUpdate(userId, { $inc: { 'usage.reviewsUsed': 1 } });
      
      await History.create({
        userId,
        mode: 'code-review',
        input: { code: inputCode, language, options, isPRReview, prInfo },
        output: result,
        status: 'success',
        metadata: { cacheHit: result.cacheHit, isPRReview }
      });
    }

    res.json({
      success: true,
      mode: 'code-review',
      isPRReview,
      prInfo,
      data: result
    });
  } catch (error) {
    // Log failed attempt but don't count it
    if (userId) {
      await History.create({
        userId,
        mode: 'code-review',
        input: { code: inputCode, language, options, isPRReview, prInfo },
        output: { error: error.message },
        status: 'failed',
        metadata: { cacheHit: false }
      });
    }
    throw error;
  }
});

const debug = asyncHandler(async (req, res) => {
  const { code, error, language, includeCodeReview } = req.validatedBody;
  const userId = req.currentUser?._id?.toString() || null;
  
  logger.info('Debug request received', { language, errorLength: error.length, includeCodeReview });

  try {
    const result = await processAIRequest('debug', { 
      code, 
      error, 
      language,
      includeCodeReview: includeCodeReview !== false
    }, {}, userId);

    if (userId) {
      await History.create({
        userId,
        mode: 'debug',
        input: { code, error, language, includeCodeReview },
        output: result,
        status: 'success'
      });
    }

    res.json({
      success: true,
      mode: 'debug',
      data: result
    });
  } catch (error) {
    if (userId) {
      await History.create({
        userId,
        mode: 'debug',
        input: { code, error, language, includeCodeReview },
        output: { error: error.message },
        status: 'failed'
      });
    }
    throw error;
  }
});

const generateTests = asyncHandler(async (req, res) => {
  const { code, language, framework, testType, includeEdgeCases, includeNegativeCases, coverageTarget } = req.validatedBody;
  const userId = req.currentUser?._id?.toString() || null;
  
  // Supported frameworks with their details
  const supportedFrameworks = {
    'jest': { language: 'javascript', description: 'Jest testing framework', docs: 'https://jestjs.io/' },
    'mocha': { language: 'javascript', description: 'Mocha testing framework', docs: 'https://mochajs.org/' },
    'jasmine': { language: 'javascript', description: 'Jasmine testing framework', docs: 'https://jasmine.github.io/' },
    'pytest': { language: 'python', description: 'Python pytest framework', docs: 'https://docs.pytest.org/' },
    'unittest': { language: 'python', description: 'Python unittest framework', docs: 'https://docs.python.org/3/library/unittest.html' },
    'python-selenium': { language: 'python', description: 'Python Selenium web automation', docs: 'https://www.selenium.dev/documentation/' },
    'java-selenium': { language: 'java', description: 'Java Selenium web automation', docs: 'https://www.selenium.dev/documentation/' },
    'cypress': { language: 'javascript', description: 'Cypress E2E testing', docs: 'https://docs.cypress.io/' },
    'playwright': { language: 'javascript', description: 'Playwright testing', docs: 'https://playwright.dev/docs/' },
    'go-testing': { language: 'go', description: 'Go testing framework', docs: 'https://pkg.go.dev/testing' }
  };

  // Validate framework
  if (framework && !supportedFrameworks[framework]) {
    return res.status(400).json({
      success: false,
      error: `Unsupported framework: ${framework}. Supported frameworks: ${Object.keys(supportedFrameworks).join(', ')}`,
      code: 'UNSUPPORTED_FRAMEWORK'
    });
  }

  logger.info('Test generation request received', { 
    framework: framework || 'jest', 
    testType: testType || 'all', 
    codeLength: code.length,
    language
  });

  const testOptions = {
    framework: framework || 'jest',
    testType: testType || 'all',
    includeEdgeCases: includeEdgeCases !== false,
    includeNegativeCases: includeNegativeCases !== false,
    coverageTarget: coverageTarget || 80
  };

  // Don't count failed attempts towards limit
  let result;
  try {
    result = await processAIRequest('generate-tests', {
      code,
      language,
      ...testOptions
    }, testOptions, userId);

    // Only count SUCCESSFUL generations
    if (userId) {
      await User.findByIdAndUpdate(userId, { $inc: { 'usage.testsGenerated': 1 } });
      
      await History.create({
        userId,
        mode: 'generate-tests',
        input: { code, language, ...testOptions },
        output: result,
        status: 'success',
        metadata: { 
          framework: testOptions.framework,
          testType: testOptions.testType,
          testCount: result.tests?.length || 0,
          estimatedCoverage: result.coverage?.estimatedCoverage || 0
        }
      });
    }

    // Enhance result with additional metadata
    const enhancedResult = {
      ...result,
      framework: testOptions.framework,
      frameworkInfo: supportedFrameworks[testOptions.framework],
      language: language || result.language,
      totalTests: result.tests?.length || 0,
      coverage: result.coverage || {
        estimatedCoverage: 0,
        unitTests: 0,
        integrationTests: 0,
        e2eTests: 0,
        edgeCaseTests: 0,
        securityTests: 0
      },
      setupInstructions: result.setupInstructions || getDefaultSetupInstructions(testOptions.framework),
      runInstructions: result.runInstructions || getDefaultRunInstructions(testOptions.framework),
      summary: result.summary || `Generated ${result.tests?.length || 0} comprehensive test cases`
    };

    res.json({
      success: true,
      mode: 'generate-tests',
      framework: testOptions.framework,
      frameworkInfo: supportedFrameworks[testOptions.framework],
      supportedFrameworks: Object.keys(supportedFrameworks),
      data: enhancedResult,
      stats: {
        testsGenerated: result.tests?.length || 0,
        estimatedCoverage: result.coverage?.estimatedCoverage || 0,
        testTypes: {
          unit: result.coverage?.unitTests || 0,
          integration: result.coverage?.integrationTests || 0,
          e2e: result.coverage?.e2eTests || 0,
          edge: result.coverage?.edgeCaseTests || 0,
          security: result.coverage?.securityTests || 0
        }
      }
    });

  } catch (error) {
    // Log failed attempt but don't count it
    if (userId) {
      await History.create({
        userId,
        mode: 'generate-tests',
        input: { code, language, ...testOptions },
        output: { error: error.message },
        status: 'failed',
        metadata: { framework: testOptions.framework }
      });
    }
    throw error;
  }
});

function getDefaultSetupInstructions(framework) {
  const instructions = {
    'jest': `# Jest Setup Instructions

1. Install Jest:
\`\`\`bash
npm install --save-dev jest @types/jest ts-jest
# or for TypeScript
npm install --save-dev jest @types/jest ts-jest typescript
\`\`\`

2. Configure Jest (jest.config.js):
\`\`\`javascript
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\\\.tsx?$': 'ts-jest',
  },
};
\`\`\`

3. Add test script to package.json:
\`\`\`json
{
  "scripts": {
    "test": "jest"
  }
}
\`\`\``,
    'mocha': `# Mocha Setup Instructions

1. Install Mocha:
\`\`\`bash
npm install --save-dev mocha chai sinon
\`\`\`

2. Create test directory and add test files

3. Add test script to package.json:
\`\`\`json
{
  "scripts": {
    "test": "mocha '**/*.test.js'"
  }
}
\`\`\``,
    'pytest': `# Pytest Setup Instructions

1. Install pytest:
\`\`\`bash
pip install pytest pytest-cov
# For mocking
pip install pytest-mock
\`\`\`

2. Run tests:
\`\`\`bash
pytest
# With coverage
pytest --cov=. --cov-report=html
\`\`\``,
    'cypress': `# Cypress Setup Instructions

1. Install Cypress:
\`\`\`bash
npm install --save-dev cypress
npx cypress open
\`\`\`

2. Write tests in cypress/integration/

3. Run tests:
\`\`\`bash
npx cypress run    # Headless
npx cypress open    # Interactive
\`\`\``,
    'playwright': `# Playwright Setup Instructions

1. Install Playwright:
\`\`\`bash
npm install --save-dev @playwright/test
npx playwright install
\`\`\`

2. Run tests:
\`\`\`bash
npx playwright test
\`\`\``
  };
  
  return instructions[framework] || `# Setup Instructions

Please refer to the official documentation for your testing framework.`;
}

function getDefaultRunInstructions(framework) {
  const instructions = {
    'jest': 'npm test',
    'mocha': 'npm test',
    'pytest': 'pytest',
    'cypress': 'npx cypress run',
    'playwright': 'npx playwright test'
  };
  
  return instructions[framework] || 'Follow your framework\'s documentation';
}

const analyzePR = asyncHandler(async (req, res) => {
  const { diff, repo, prNumber, context } = req.validatedBody;
  const userId = req.currentUser?._id?.toString() || null;
  
  logger.info('PR analysis request received', { diffLength: diff.length });

  const result = await processAIRequest('analyze-pr', { diff, context }, {}, userId);

  if (userId) {
    await History.create({
      userId,
      mode: 'analyze-pr',
      input: { diff, repo, prNumber, context },
      output: result
    });
  }

  res.json({
    success: true,
    mode: 'analyze-pr',
    data: result
  });
});

const reviewRepository = asyncHandler(async (req, res) => {
  const { repositoryPath, language = 'javascript', analysisTypes = [] } = req.validatedBody;
  const userId = req.currentUser?._id?.toString() || null;
  
  if (!repositoryPath) {
    return res.status(400).json({
      success: false,
      error: 'Repository path is required'
    });
  }

  const defaultAnalysisTypes = ['security', 'code-quality', 'best-practices', 'performance'];
  const typesToAnalyze = analysisTypes.length > 0 ? analysisTypes : defaultAnalysisTypes;

  logger.info('Repository review request received', { 
    repositoryPath, 
    language,
    analysisTypes: typesToAnalyze 
  });

  // Check limit BEFORE processing
  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      if (user.usage.reviewsUsed >= user.usage.reviewsLimit) {
        return res.status(429).json({
          success: false,
          error: 'Review limit exceeded. Upgrade to Pro for unlimited reviews.',
          code: 'LIMIT_EXCEEDED'
        });
      }
    }
  }

  try {
    const result = await processAIRequest('repo-review', 
      { repositoryPath, language, analysisTypes: typesToAnalyze }, 
      { maxTokens: 8000 }, 
      userId
    );

    // Only count as used on SUCCESS
    if (userId) {
      await User.findByIdAndUpdate(userId, { $inc: { 'usage.reviewsUsed': 1 } });
      
      await History.create({
        userId,
        mode: 'repo-review',
        input: { repositoryPath, language, analysisTypes: typesToAnalyze },
        output: result,
        status: 'success',
        metadata: { analysisTypes: typesToAnalyze }
      });
    }

    res.json({
      success: true,
      mode: 'repo-review',
      data: result,
      analysisTypes: typesToAnalyze
    });
  } catch (error) {
    // Log failed attempt but don't count it
    if (userId) {
      await History.create({
        userId,
        mode: 'repo-review',
        input: { repositoryPath, language, analysisTypes: typesToAnalyze },
        output: { error: error.message },
        status: 'failed',
        metadata: { analysisTypes: typesToAnalyze }
      });
    }
    throw error;
  }
});

module.exports = {
  codeReview,
  debug,
  generateTests,
  analyzePR,
  reviewRepository
};
