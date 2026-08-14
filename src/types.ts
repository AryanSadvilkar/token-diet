export type NavView = 'overview' | 'demo' | 'compare' | 'details';

export type DetailsSubTab = 'how-it-works' | 'architecture' | 'calculator' | 'docs' | 'analytics';

export interface SentenceItem {
  text: string;
  kept: boolean;
  relevanceScore: number;
  reason: string;
}

export interface CompressionResult {
  success: boolean;
  mode: string;
  rawTokens: number;
  compressedTokens: number;
  compressionRatio: string;
  percentSaved: string;
  latencyDropMs: number;
  costSavedEstimate: string;
  compressedContext: string;
  sentences: SentenceItem[];
  source?: string;
}

export interface PresetContext {
  id: string;
  title: string;
  category: string;
  query: string;
  rawText: string;
}

export type CompressionStrategy = 'BM25' | 'Cross-Encoder' | 'LLM-Semantic' | 'HyDE';

export interface CompressionRecord {
  id: string;
  timestamp: number;
  mode: 'rag-chunks' | 'paste' | 'image';
  presetTitle?: string;
  rawText: string;
  compressedText: string;
  rawTokens: number;
  compressedTokens: number;
  tokensSaved: number;
  compressionRatio: string;
  percentSaved: string;
  percentSavedNum: number;
  costSavedEstimate: string;
  executionTimeMs?: number;
  query?: string;
}

export interface SessionStats {
  totalCompressions: number;
  totalTokensSaved: number;
  totalRawTokens: number;
  totalCompressedTokens: number;
  avgCompressionRatio: string;
  avgPercentSaved: string;
}

export interface RagPreset {
  id: string;
  title: string;
  badge: string;
  query: string;
  rawText: string;
  description: string;
}
