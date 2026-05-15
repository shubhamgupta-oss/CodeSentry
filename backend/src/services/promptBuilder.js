const systemPrompts = {
  'code-review': `You are an expert code reviewer specializing in identifying bugs, security vulnerabilities, and performance issues. 
Analyze code thoroughly and provide structured feedback in JSON format.
Be critical but constructive. Focus on:
- Bugs and logical errors
- Security vulnerabilities
- Performance issues
- Code quality improvements
- Best practices violations
Always respond with valid JSON in the exact format specified.`,

  'debug': `You are an expert debugging assistant with deep knowledge of multiple programming languages and frameworks.
Analyze error messages and code to identify root causes and provide fixes.
Always respond with valid JSON in the exact format specified.`,

  'generate-tests': `You are an expert test engineer specializing in writing comprehensive test suites.
Generate unit, integration, and end-to-end tests for various frameworks including Jest, Mocha, Cypress, Selenium, and Playwright.
Always respond with valid JSON in the exact format specified.`,

  'analyze-pr': `You are an expert code reviewer analyzing pull request changes.
Review diffs for potential issues, risks, and improvement suggestions.
Always respond with valid JSON in the exact format specified.`,

  'repo-review': `You are an expert security auditor and code quality specialist performing comprehensive repository analysis.
Analyze entire repositories for security vulnerabilities, code quality issues, best practices, and performance problems.
Always respond with valid JSON in the exact format specified.`
};

const promptTemplates = {
  'code-review': (input, options = {}) => {
    const verbosity = options?.verbosity || 'medium';
    const includeComplexity = options?.includeComplexity !== false;
    const isPRReview = input.isPRReview;
    
    let prompt;
    
    if (isPRReview) {
      prompt = `# Pull Request Code Review Request

## PR Information
${input.prInfo ? `- PR Number: #${input.prInfo.number}
- Title: ${input.prInfo.title}
- Author: ${input.prInfo.user?.login || 'Unknown'}
- State: ${input.prInfo.state || 'unknown'}` : 'Analyzing PR diff changes'}

## Language
${input.language || 'Auto-detect'}

## Git Diff Changes
\`\`\`diff
${input.code}
\`\`\`

## Review Requirements
1. **Security Analysis**: Check for SQL injection, XSS, command injection, authentication issues
2. **Bug Detection**: Identify potential bugs, logical errors, edge cases
3. **Code Quality**: Check for code smells, complexity, maintainability
4. **Best Practices**: Verify adherence to language conventions and patterns
5. **Performance**: Identify potential bottlenecks and inefficiencies
6. **Risk Assessment**: Evaluate the overall risk of these changes

## Severity Guidelines
- **Critical**: Security vulnerabilities, potential data loss, authentication bypass
- **High**: Bugs that could cause runtime errors or unexpected behavior
- **Medium**: Code quality issues, minor bugs
- **Low**: Style improvements, minor optimizations

## Response Format
Respond ONLY with valid JSON in this exact format:
{
  "summary": "<overall assessment of the PR changes>",
  "riskLevel": "low|medium|high|critical",
  "bugs": [
    {
      "severity": "critical|high|medium|low",
      "description": "<bug description>",
      "file": "<file path if available>",
      "line": <line number if available>,
      "suggestion": "<how to fix>"
    }
  ],
  "securityIssues": [
    {
      "severity": "critical|high|medium|low",
      "type": "<security issue type>",
      "description": "<issue description>",
      "file": "<file path>",
      "line": <line number>,
      "cwe": "<CWE ID>",
      "fix": "<how to fix>"
    }
  ],
  "improvements": [
    {
      "type": "<improvement type>",
      "description": "<improvement suggestion>",
      "file": "<file path>",
      "line": <line number>,
      "code": "<suggested code if applicable>"
    }
  ],
  "recommendations": ["<recommendation 1>", "<recommendation 2>"]
}`;
    } else {
      prompt = `# Code Review Request

## Language
${input.language || 'Auto-detect'}

## Code
\`\`\`${input.language || ''}
${input.code}
\`\`\`

## Review Requirements
- Detect bugs and logical errors
- Identify security vulnerabilities (injection, XSS, auth issues)
- Suggest code improvements
- Check for best practices violations
${includeComplexity ? '- Analyze time and space complexity' : ''}
- Provide specific, actionable suggestions

## Verbosity Level
${verbosity}

## Response Format
Respond ONLY with valid JSON in this exact format:
{
  "bugs": [
    {
      "line": <number or null>,
      "severity": "critical|high|medium|low",
      "description": "<detailed bug description>",
      "suggestion": "<how to fix it>"
    }
  ],
  "securityIssues": [
    {
      "severity": "critical|high|medium|low",
      "type": "<security issue type>",
      "description": "<issue description>",
      "suggestion": "<how to fix>"
    }
  ],
  "improvements": [
    {
      "line": <number or null>,
      "type": "<improvement type>",
      "description": "<what can be improved>",
      "code": "<suggested code if applicable>"
    }
  ],
  "complexity": {
    "time": "<time complexity>",
    "space": "<space complexity>"
  },
  "summary": "<overall assessment>"
}`;
    }

    return prompt;
  },

  'debug': (input) => {
    const includeCodeReview = input.includeCodeReview !== false;
    
    let prompt = `# Comprehensive Debug & Code Analysis Request

## Language
${input.language || 'Auto-detect'}

## Code
\`\`\`${input.language || ''}
${input.code}
\`\`\`

## Error Message
\`\`\`
${input.error}
\`\`\`

## Analysis Requirements
1. **Root Cause Analysis**: Identify the primary cause of the error
2. **Security Check**: Scan for security vulnerabilities in the code
3. **Best Practices**: Check for code quality and best practice violations
4. **Bug Detection**: Find any additional bugs or logical errors
5. **Fix Generation**: Provide a complete fix with explanation

## Security Checks to Perform
- SQL/NoSQL Injection vulnerabilities
- XSS (Cross-Site Scripting)
- Command Injection
- Authentication/Authorization issues
- Input validation issues
- Insecure dependencies (if detectable)

## Response Format
Respond ONLY with valid JSON in this exact format:
{
  "rootCause": "<primary root cause of the error>",
  "confidence": <0-100 confidence level>,
  "fix": {
    "description": "<how to fix the issue>",
    "code": "<complete fixed code>"
  },
  "explanation": "<detailed explanation of why this fixes the issue>",
  "additionalBugs": [
    {
      "severity": "high|medium|low",
      "description": "<additional bug description>",
      "line": <line number or null>,
      "suggestion": "<how to fix>"
    }
  ],
  "securityIssues": [
    {
      "severity": "critical|high|medium|low",
      "type": "<security issue type>",
      "description": "<issue description>",
      "fix": "<how to fix>"
    }
  ],
  "improvements": [
    {
      "type": "<improvement type>",
      "description": "<suggestion>",
      "code": "<suggested code if applicable>"
    }
  ]
}`;

    return prompt;
  },

  'generate-tests': (input) => {
    const framework = input.framework || 'jest';
    const testType = input.testType || 'all';
    const includeEdgeCases = input.includeEdgeCases !== false;
    const includeNegativeCases = input.includeNegativeCases !== false;
    const coverageTarget = input.coverageTarget || '80';
    const includeCodeReview = input.includeCodeReview !== false;

    const frameworkConfigs = {
      'jest': {
        language: 'javascript',
        imports: `import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { jest } from '@jest/globals';`,
        setup: 'beforeEach(() => { /* setup */ }); afterEach(() => { /* cleanup */ });',
        syntax: 'jest',
        description: 'JavaScript/TypeScript Jest testing framework'
      },
      'mocha': {
        language: 'javascript',
        imports: `const { describe, it, before, after, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');`,
        setup: 'beforeEach(() => { /* setup */ }); afterEach(() => { /* cleanup */ });',
        syntax: 'mocha',
        description: 'JavaScript Mocha testing framework with Chai assertions'
      },
      'jasmine': {
        language: 'javascript',
        imports: `describe('Test Suite', () => {
  let spy;
  beforeEach(() => { /* setup */ });
  afterEach(() => { /* cleanup */ });`,
        syntax: 'jasmine',
        description: 'JavaScript Jasmine testing framework'
      },
      'pytest': {
        language: 'python',
        imports: `import pytest
from unittest import mock
from parameterized import parameterized`,
        setup: '@pytest.fixture\ndef setup(): yield; cleanup',
        syntax: 'pytest',
        description: 'Python pytest framework with fixtures and mocking'
      },
      'unittest': {
        language: 'python',
        imports: `import unittest
from unittest import mock
from unittest.mock import patch, MagicMock`,
        setup: 'def setUp(self): pass\ndef tearDown(self): pass',
        syntax: 'unittest',
        description: 'Python unittest framework'
      },
      'python-selenium': {
        language: 'python',
        imports: `from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import unittest
import time`,
        setup: 'def setUp(self):\n    self.driver = webdriver.Chrome()\n\ndef tearDown(self):\n    self.driver.quit()',
        syntax: 'python-selenium',
        description: 'Python Selenium web automation testing'
      },
      'java-selenium': {
        language: 'java',
        imports: `import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.By;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.interactions.Actions;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.*;`,
        setup: '@Before\npublic void setUp() { driver = new ChromeDriver(); }\n@After\npublic void tearDown() { driver.quit(); }',
        syntax: 'java-selenium',
        description: 'Java Selenium web automation testing with JUnit'
      },
      'cypress': {
        language: 'javascript',
        imports: `/// <reference types="cypress" />
describe('E2E Tests', () => {
  beforeEach(() => { cy.visit('/'); });`,
        syntax: 'cypress',
        description: 'JavaScript Cypress E2E testing framework'
      },
      'playwright': {
        language: 'javascript',
        imports: `import { test, expect, Page } from '@playwright/test';`,
        setup: 'let page: Page;',
        syntax: 'playwright',
        description: 'JavaScript Playwright testing framework'
      },
      'go-testing': {
        language: 'go',
        imports: `import (
  "testing"
  "github.com/stretchr/testify/assert"
)`,
        syntax: 'go-testing',
        description: 'Go native testing with testify assertions'
      }
    };

    const config = frameworkConfigs[framework] || frameworkConfigs.jest;

    const testScenarios = [
      { type: 'happy-path', desc: 'Normal operation with valid inputs' },
      { type: 'boundary', desc: 'Test boundary conditions and limits' },
      { type: 'null-undefined', desc: 'Test null, undefined, and empty values' },
      { type: 'type-validation', desc: 'Test type validation and type coercion' },
      { type: 'error-handling', desc: 'Test error conditions and exceptions' },
      { type: 'concurrency', desc: 'Test concurrent/async scenarios' },
      { type: 'state', desc: 'Test state management and side effects' },
      { type: 'performance', desc: 'Test performance with large datasets' },
      { type: 'integration', desc: 'Test integration with dependencies' },
      { type: 'api-mocking', desc: 'Test with mocked API responses' },
      { type: 'security', desc: 'Test input validation and injection prevention' },
      { type: 'accessibility', desc: 'Test UI accessibility (for E2E)' }
    ];

    let scenariosList = testScenarios.map(s => `- ${s.type}: ${s.desc}`).join('\n');
    if (testType !== 'all') {
      scenariosList = testScenarios.slice(0, 6).map(s => `- ${s.type}: ${s.desc}`).join('\n');
    }

    let prompt = `# Comprehensive Test Generation Request

## Test Framework
${framework} (${config.description})

## Programming Language
${config.language || 'Auto-detect'}

## Target Code to Test
\`\`\`${config.language || ''}
${input.code}
\`\`\`

## Test Configuration
- Test Types: ${testType === 'all' ? 'Unit, Integration, E2E' : testType}
- Coverage Target: ${coverageTarget}%
- Include Edge Cases: ${includeEdgeCases}
- Include Negative Test Cases: ${includeNegativeCases}
- Framework Setup: ${config.setup}

## Required Imports/Setup
\`\`\`
${config.imports}
\`\`\`

## Comprehensive Test Scenarios to Cover
${scenariosList}

## Test Generation Guidelines

### For All Test Types:
1. **Happy Path Testing**: Test normal successful execution paths
2. **Boundary Testing**: Test edge values (min, max, zero, empty arrays, etc.)
3. **Null/Undefined Handling**: Test handling of null, undefined, and empty inputs
4. **Type Validation**: Test type checking and invalid type scenarios
5. **Error Handling**: Test exception handling and error conditions
${testType === 'all' || testType === 'integration' ? '\n6. **Integration Testing**: Test component interactions and dependencies' : ''}
${testType === 'all' || testType === 'e2e' ? '\n7. **E2E Testing**: Test complete user workflows' : ''}

### For Selenium Tests (Java/Python):
- Use explicit waits (WebDriverWait) instead of implicit waits
- Implement Page Object Model pattern for maintainability
- Handle StaleElementReferenceException
- Test form submissions, navigation, clicks
- Verify element visibility and clickability before interaction
- Test accessibility of UI elements
- Handle multiple windows/tabs
- Test with different screen sizes

### Best Practices:
- Use descriptive test names that explain what is being tested
- Keep tests focused and independent
- Use mocking/stubbing for external dependencies
- Include setup and teardown/cleanup code
- Add meaningful assertions with clear messages
- Test one behavior per test when possible
- Include comments explaining complex test logic
- Use parameterized tests for similar scenarios
- Measure and ensure good code coverage

## Response Format
Respond ONLY with valid JSON in this exact format:
{
  "codeReview": {
    "bugs": [
      {
        "severity": "critical|high|medium|low",
        "description": "<bug description>",
        "line": <line number or null>,
        "suggestion": "<how to fix>"
      }
    ],
    "securityIssues": [
      {
        "severity": "critical|high|medium|low",
        "type": "<issue type>",
        "description": "<security issue description>",
        "fix": "<how to fix>"
      }
    ],
    "improvements": [
      {
        "type": "<improvement type>",
        "description": "<improvement suggestion>",
        "code": "<suggested code if applicable>"
      }
    ]
  },
  "tests": [
    {
      "name": "<descriptive test name>",
      "type": "unit|integration|e2e|boundary|security|performance|accessibility",
      "scenario": "happy-path|boundary|null-undefined|type-validation|error-handling|concurrency|state|performance|integration|api-mocking|security|accessibility",
      "description": "<detailed description of what this test validates and why>",
      "importance": "critical|high|medium|low",
      "relatedBug": <index of related bug in codeReview.bugs array, or null>,
      "code": "<complete, production-ready test code with all necessary setup and assertions>"
    }
  ],
  "framework": "${framework}",
  "language": "${config.language}",
  "totalTests": <number>,
  "coverage": {
    "unitTests": <number>,
    "integrationTests": <number>,
    "e2eTests": <number>,
    "edgeCaseTests": <number>,
    "securityTests": <number>,
    "estimatedCoverage": <0-100>
  },
  "setupInstructions": "<any special setup or installation instructions needed>",
  "runInstructions": "<how to run these tests>",
  "summary": "<summary highlighting test quality, coverage, code issues found, and key scenarios>"
}`;

    return prompt;
  },

  'analyze-pr': (input) => {
    let prompt = `# PR Analysis Request

## Git Diff
\`\`\`diff
${input.diff}
\`\`\`

## Additional Context
${input.context || 'No additional context provided.'}

## Response Format
Respond ONLY with valid JSON in this exact format:
{
  "summary": "<overall summary of changes>",
  "riskAreas": [
    {
      "severity": "critical|high|medium|low",
      "description": "<risk description>",
      "file": "<affected file>",
      "line": <line number or null>
    }
  ],
  "suggestions": [
    "<improvement suggestion>"
  ],
  "testRecommendations": [
    "<recommended test to add>"
  ]
}`;

    return prompt;
  },

  'repo-review': (input) => {
    const analysisTypes = input.analysisTypes || ['security', 'code-quality', 'best-practices', 'performance'];
    
    const analysisDescriptions = {
      'security': 'Identify security vulnerabilities, injection points, insecure dependencies, authentication/authorization issues, OWASP Top 10 risks',
      'code-quality': 'Detect code smells, complexity issues, maintainability problems, duplicate code, poor naming, linting issues',
      'best-practices': 'Review adherence to language conventions, design patterns, SOLID principles, error handling, logging practices',
      'performance': 'Identify performance bottlenecks, inefficient algorithms, memory leaks, excessive API calls, N+1 queries',
      'dependencies': 'Check for outdated dependencies, vulnerable packages (CVE), license compatibility, unused packages',
      'secrets': 'Detect hardcoded secrets: API keys, tokens, passwords, private keys, AWS credentials, database connections, encryption keys, JWT secrets, OAuth tokens'
    };

    const analysisFilters = analysisTypes
      .map(type => analysisDescriptions[type])
      .filter(desc => desc)
      .map((desc, i) => `${i + 1}. ${desc}`)
      .join('\n');

    let prompt = `# Comprehensive Repository Security & Quality Review

## Repository Path/Info
${input.repositoryPath}

## Language/Framework
${input.language || 'Auto-detect'}

## Analysis Focus Areas
${analysisFilters}

## Critical Security Checks to Perform
### OWASP Top 10
1. A01 - Broken Access Control
2. A02 - Cryptographic Failures
3. A03 - Injection (SQL, XSS, Command Injection)
4. A04 - Insecure Design
5. A05 - Security Misconfiguration
6. A06 - Vulnerable Components
7. A07 - Auth Failures
8. A08 - Data Integrity Failures
9. A09 - Logging Failures
10. A10 - SSRF

### Secret Detection Patterns
Search for:
- API keys (AWS, GCP, Azure, Stripe, SendGrid, etc.)
- Private keys and certificates
- Database connection strings
- JWT secrets and session keys
- OAuth tokens and access tokens
- Passwords in code or config files
- Environment variables with secrets
- Backup files and debug logs
- Git history secrets (if applicable)

## Review Guidelines
- Scan the entire repository structure
- Identify critical and high-priority issues first
- Check ALL files including config, env, package.json, requirements.txt
- Look for hardcoded credentials in ANY file type
- Provide specific file paths and line numbers where applicable
- Suggest concrete improvements with examples
- Prioritize issues by severity and impact
- Consider the overall architecture and design patterns
- For each issue, provide CWE (Common Weakness Enumeration) IDs

## Response Format
Respond ONLY with valid JSON in this exact format:
{
  "summary": {
    "totalIssues": <number>,
    "criticalIssues": <number>,
    "highIssues": <number>,
    "mediumIssues": <number>,
    "lowIssues": <number>,
    "overallScore": <0-100>,
    "securityScore": <0-100>,
    "codeQualityScore": <0-100>
  },
  "security": {
    "vulnerabilities": [
      {
        "severity": "critical|high|medium|low",
        "type": "<vulnerability type (e.g., SQL Injection, XSS, CSRF)>",
        "description": "<detailed description of the vulnerability>",
        "file": "<file path>",
        "line": <line number or null>,
        "fix": "<how to fix this vulnerability>",
        "cwe": "<CWE ID (e.g., CWE-89)>",
        "owasp": "<OWASP category (e.g., A03)>"
      }
    ],
    "score": <0-100>
  },
  "secrets": [
    {
      "severity": "critical",
      "type": "<secret type (e.g., AWS Key, API Token, Private Key)>",
      "description": "<what was found and risk level>",
      "file": "<file path>",
      "line": <line number or null>,
      "value": "<truncated secret (e.g.,AKIA****XXXX)>"
    }
  ],
  "codeQuality": {
    "issues": [
      {
        "severity": "critical|high|medium|low",
        "category": "complexity|duplication|smell|maintainability|naming|comments",
        "description": "<issue description>",
        "file": "<file path>",
        "line": <line number or null>,
        "suggestion": "<how to fix or improve>"
      }
    ],
    "score": <0-100>
  },
  "bestPractices": {
    "violations": [
      {
        "severity": "high|medium|low",
        "practice": "<best practice name>",
        "description": "<violation description>",
        "file": "<file path>",
        "line": <line number or null>,
        "recommendation": "<what to do instead>"
      }
    ],
    "score": <0-100>
  },
  "performance": {
    "bottlenecks": [
      {
        "severity": "high|medium|low",
        "type": "<bottleneck type (e.g., N+1 Query, Memory Leak)>",
        "description": "<description>",
        "file": "<file path>",
        "line": <line number or null>,
        "optimization": "<how to optimize>"
      }
    ],
    "score": <0-100>
  },
  "dependencies": {
    "vulnerable": [
      {
        "name": "<package name>",
        "currentVersion": "<current version>",
        "severity": "critical|high|medium|low",
        "fixedVersion": "<safe version>",
        "cve": "<CVE ID if available>",
        "description": "<vulnerability description>"
      }
    ],
    "outdated": [
      {
        "name": "<package name>",
        "currentVersion": "<current>",
        "latestVersion": "<latest>"
      }
    ]
  },
  "actionItems": [
    {
      "priority": "critical|high|medium|low",
      "category": "security|quality|performance|practices|secrets",
      "description": "<action item description>",
      "effort": "low|medium|high",
      "file": "<file path>"
    }
  ],
  "recommendations": [
    "<overall recommendation 1>",
    "<overall recommendation 2>"
  ]
}`;

    return prompt;
  }
};

class PromptBuilder {
  buildPrompt(mode, input, options = {}) {
    const template = promptTemplates[mode];
    if (!template) {
      throw new Error(`Unknown mode: ${mode}`);
    }
    return template(input, options);
  }

  getSystemPrompt(mode) {
    return systemPrompts[mode] || systemPrompts['code-review'];
  }

  buildFullPrompt(mode, input, options = {}) {
    return {
      system: this.getSystemPrompt(mode),
      user: this.buildPrompt(mode, input, options)
    };
  }

  buildRepoReviewPrompt(repositoryPath, language, analysisTypes) {
    return this.buildPrompt('repo-review', {
      repositoryPath,
      language,
      analysisTypes
    });
  }
}

module.exports = new PromptBuilder();



