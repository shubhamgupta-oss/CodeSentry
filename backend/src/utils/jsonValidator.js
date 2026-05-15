const { z } = require('zod');

const responseSchemas = {
  codeReview: z.object({
    bugs: z.array(z.object({
      line: z.number().optional(),
      severity: z.enum(['critical', 'high', 'medium', 'low']),
      description: z.string(),
      suggestion: z.string().optional()
    })).optional().default([]),
    improvements: z.array(z.object({
      line: z.number().optional(),
      type: z.string(),
      description: z.string(),
      code: z.string().optional()
    })).optional().default([]),
    complexity: z.object({
      time: z.string(),
      space: z.string()
    }).optional(),
    summary: z.string()
  }),

  debug: z.object({
    rootCause: z.string(),
    confidence: z.number().min(0).max(100),
    fix: z.object({
      description: z.string(),
      code: z.string().optional()
    }),
    explanation: z.string().optional()
  }),

  generateTests: z.object({
    tests: z.array(z.object({
      name: z.string(),
      type: z.enum(['unit', 'integration', 'e2e', 'edge', 'negative']),
      code: z.string(),
      description: z.string().optional()
    })),
    framework: z.string(),
    summary: z.string().optional()
  }),

  analyzePR: z.object({
    summary: z.string(),
    riskAreas: z.array(z.object({
      severity: z.enum(['critical', 'high', 'medium', 'low']),
      description: z.string(),
      file: z.string().optional(),
      line: z.number().optional()
    })).optional().default([]),
    suggestions: z.array(z.string()).optional().default([]),
    testRecommendations: z.array(z.string()).optional().default([])
  })
};

const validateResponse = (mode, response) => {
  const schema = responseSchemas[mode];
  if (!schema) {
    console.warn(`No schema found for mode: ${mode}`);
    return { valid: true, data: response };
  }

  try {
    const validated = schema.parse(response);
    return { valid: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Response validation error:', error.errors);
      return {
        valid: false,
        error: 'Invalid response structure',
        details: error.errors
      };
    }
    return { valid: false, error: 'Unknown validation error' };
  }
};

const extractJSON = (text) => {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }

  return text;
};

const parseJSONResponse = (text) => {
  try {
    const jsonStr = extractJSON(text);
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
};

module.exports = {
  validateResponse,
  extractJSON,
  parseJSONResponse,
  responseSchemas
};
