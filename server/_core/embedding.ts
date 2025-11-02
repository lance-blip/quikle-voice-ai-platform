/**
 * Embedding Service
 * 
 * Generates vector embeddings for text content using Jina AI's embedding model.
 * These embeddings enable semantic search and similarity matching in the knowledge base.
 */

import { ENV } from './env';

interface JinaEmbeddingResponse {
  model: string;
  object: string;
  usage: {
    total_tokens: number;
    prompt_tokens: number;
  };
  data: Array<{
    object: string;
    index: number;
    embedding: number[];
  }>;
}

/**
 * Generates a 384-dimensional embedding vector for the given text.
 * 
 * @param text - The text content to vectorize
 * @returns A promise that resolves to an array of 384 numbers representing the embedding,
 *          or null if the operation fails
 * 
 * @example
 * const embedding = await generateEmbedding("Hello, world!");
 * if (embedding) {
 *   console.log(`Generated ${embedding.length}-dimensional vector`);
 * }
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  // Validate input
  if (!text || text.trim().length === 0) {
    console.error("[Embedding] Cannot generate embedding for empty text");
    return null;
  }

  // Truncate very long texts to avoid API limits (max ~8000 tokens)
  const maxLength = 8000;
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

  try {
    console.log(`[Embedding] Generating embedding for text (${truncatedText.length} chars)`);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add API key if available
    if (ENV.jinaApiKey) {
      headers["Authorization"] = `Bearer ${ENV.jinaApiKey}`;
    }

    const response = await fetch("https://api.jina.ai/v1/embeddings", {
      method: "POST",
      headers,
      body: JSON.stringify({
        input: [truncatedText],
        model: "jina-embeddings-v2-base-en",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Embedding] API request failed with status ${response.status}: ${errorText}`);
      return null;
    }

    const data: JinaEmbeddingResponse = await response.json();

    // Validate response structure
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.error("[Embedding] Invalid response structure from API");
      return null;
    }

    const embedding = data.data[0].embedding;

    // Validate embedding dimensions
    if (!Array.isArray(embedding) || embedding.length !== 384) {
      console.error(`[Embedding] Expected 384-dimensional vector, got ${embedding?.length || 0}`);
      return null;
    }

    console.log(`[Embedding] Successfully generated ${embedding.length}-dimensional embedding`);
    return embedding;

  } catch (error) {
    console.error("[Embedding] Failed to generate embedding:", error);
    
    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes("fetch")) {
      console.error("[Embedding] Network error: Unable to reach Jina AI API");
    } else if (error instanceof SyntaxError) {
      console.error("[Embedding] Failed to parse API response as JSON");
    }
    
    return null;
  }
}

/**
 * Calculates cosine similarity between two embedding vectors.
 * Useful for finding similar content in the knowledge base.
 * 
 * @param embedding1 - First embedding vector
 * @param embedding2 - Second embedding vector
 * @returns Similarity score between 0 and 1 (1 = identical, 0 = completely different)
 */
export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error("Embeddings must have the same dimensions");
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  
  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}
