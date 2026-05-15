const OpenAI = require('openai');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.model = 'gpt-4o-mini';
    this.maxRetries = 3;
    this.retryDelay = 2000;
  }

  async createCompletion(prompt, options = {}) {
    const maxTokens = options.maxTokens || 4000;
    const temperature = options.temperature || 0;
    const systemPrompt = options.systemPrompt || 'You are a helpful AI assistant specialized in code analysis.';

    let lastError;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        logger.info(`OpenAI request attempt ${attempt + 1}/${this.maxRetries}`);

        const startTime = Date.now();
        
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature,
          max_tokens: maxTokens,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: { type: 'json_object' }
        });

        const processingTime = Date.now() - startTime;
        const tokensUsed = response.usage?.total_tokens || 0;

        logger.info('OpenAI response received', {
          tokens: tokensUsed,
          time: processingTime,
          finishReason: response.choices[0]?.finish_reason
        });

        return {
          content: response.choices[0]?.message?.content || '',
          tokensUsed,
          processingTime,
          model: this.model
        };
      } catch (error) {
        lastError = error;
        logger.error(`OpenAI request failed (attempt ${attempt + 1})`, {
          error: error.message,
          code: error.code
        });

        if (error.code === 'rate_limit_exceeded') {
          const waitTime = parseInt(error.headers?.['retry-after'] || this.retryDelay * (attempt + 1));
          logger.info(`Rate limited, waiting ${waitTime}ms`);
          await this.sleep(waitTime);
        } else if (error.code === 'context_length_exceeded') {
          throw new AppError('Input too long for AI processing', 413, 'INPUT_TOO_LONG');
        } else if (attempt < this.maxRetries - 1) {
          await this.sleep(this.retryDelay * (attempt + 1));
        }
      }
    }

    throw new AppError(
      `OpenAI request failed after ${this.maxRetries} attempts: ${lastError.message}`,
      503,
      'AI_SERVICE_UNAVAILABLE'
    );
  }

  async createStreamingCompletion(prompt, onChunk, options = {}) {
    const maxTokens = options.maxTokens || 4000;
    const temperature = options.temperature || 0;

    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: options.systemPrompt || 'You are a helpful AI assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true
      });

      let fullContent = '';
      let tokensUsed = 0;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          tokensUsed++;
          if (onChunk) {
            onChunk(content);
          }
        }
      }

      return {
        content: fullContent,
        tokensUsed
      };
    } catch (error) {
      logger.error('OpenAI streaming error:', error);
      throw new AppError('Streaming request failed', 500, 'STREAMING_ERROR');
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  trimPrompt(prompt, maxLength = 30000) {
    if (prompt.length <= maxLength) {
      return prompt;
    }
    return prompt.substring(0, maxLength) + '\n\n[Truncated due to length...]';
  }
}

module.exports = new OpenAIService();
