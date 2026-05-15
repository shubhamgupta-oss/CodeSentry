const { z } = require('zod');
const { AppError } = require('./errorHandler');

const schemas = {
  codeReview: z.object({
    code: z.string().max(50000).optional(),
    diff: z.string().max(100000).optional(),
    language: z.string().optional(),
    prInfo: z.object({
      number: z.number(),
      title: z.string(),
      url: z.string().url(),
      additions: z.number().optional(),
      deletions: z.number().optional(),
      changedFiles: z.number().optional()
    }).optional(),
    options: z.object({
      includeComplexity: z.boolean().optional().default(true),
      includeSuggestions: z.boolean().optional().default(true),
      verbosity: z.enum(['low', 'medium', 'high']).optional().default('medium')
    }).optional()
  }).refine(data => data.code || data.diff, {
    message: 'Either code or diff must be provided'
  }),

  debug: z.object({
    code: z.string().min(1).max(50000),
    error: z.string().min(1).max(5000),
    language: z.string().optional()
  }),

  generateTests: z.object({
    code: z.string().min(1).max(50000),
    language: z.string().optional(),
    framework: z.enum(['jest', 'mocha', 'jasmine', 'pytest', 'unittest', 'python-selenium', 'java-selenium', 'cypress', 'playwright', 'go-testing']).optional().default('jest'),
    testType: z.enum(['unit', 'integration', 'e2e', 'all']).optional().default('all'),
    includeEdgeCases: z.boolean().optional().default(true),
    includeNegativeCases: z.boolean().optional().default(true),
    coverageTarget: z.number().min(0).max(100).optional().default(80)
  }),

  analyzePR: z.object({
    diff: z.string().min(1).max(100000),
    repo: z.string().optional(),
    prNumber: z.number().optional(),
    context: z.string().max(5000).optional()
  }),

  reviewRepo: z.object({
    repositoryPath: z.string().min(1).max(2000),
    language: z.string().optional().default('javascript'),
    analysisTypes: z.array(
      z.enum(['security', 'code-quality', 'best-practices', 'performance'])
    ).optional().default([])
  })
};

const validateRequest = (schemaName) => {
  return (req, res, next) => {
    try {
      const schema = schemas[schemaName];
      if (!schema) {
        throw new AppError('Invalid validation schema', 500, 'INVALID_SCHEMA');
      }

      const validated = schema.parse(req.body);
      req.validatedBody = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = { validateRequest, schemas };
