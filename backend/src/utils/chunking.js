class ChunkManager {
  constructor(maxChunkSize = 8000, overlapSize = 200) {
    this.maxChunkSize = maxChunkSize;
    this.overlapSize = overlapSize;
  }

  chunkText(text) {
    if (!text || text.length === 0) {
      return [];
    }

    if (text.length <= this.maxChunkSize) {
      return [{ text, index: 0, total: 1 }];
    }

    const chunks = [];
    const lines = text.split('\n');
    let currentChunk = '';
    let chunkIndex = 0;

    for (const line of lines) {
      if (currentChunk.length + line.length + 1 > this.maxChunkSize) {
        if (currentChunk.length > 0) {
          chunks.push({
            text: currentChunk.trim(),
            index: chunkIndex,
            total: Math.ceil(text.length / this.maxChunkSize),
            hasOverlap: chunkIndex > 0
          });
          chunkIndex++;

          const overlapLines = currentChunk.split('\n').slice(-3).join('\n');
          currentChunk = overlapLines + '\n' + line;
        } else {
          chunks.push({
            text: line.substring(0, this.maxChunkSize),
            index: chunkIndex,
            total: Math.ceil(text.length / this.maxChunkSize)
          });
          chunkIndex++;
          currentChunk = line.substring(this.maxChunkSize - this.overlapSize);
        }
      } else {
        currentChunk += (currentChunk.length > 0 ? '\n' : '') + line;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        index: chunkIndex,
        total: chunkIndex + 1,
        hasOverlap: chunkIndex > 0
      });
    }

    return chunks;
  }

  mergeChunks(results) {
    if (!Array.isArray(results) || results.length === 0) {
      return { merged: '', summary: 'No results to merge' };
    }

    if (results.length === 1) {
      return { merged: results[0], summary: 'Single chunk processed' };
    }

    let merged = results.map((r, i) => {
      const content = typeof r === 'string' ? r : (r.content || r.text || JSON.stringify(r));
      return `--- Chunk ${i + 1} ---\n${content}`;
    }).join('\n\n');

    return {
      merged,
      summary: `Merged ${results.length} chunks`
    };
  }

  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  shouldChunk(text) {
    return this.estimateTokens(text) > this.maxChunkSize / 4;
  }
}

module.exports = new ChunkManager();
