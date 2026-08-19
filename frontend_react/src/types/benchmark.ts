export interface StageTimings {
  unit_formation: number;
  fast_filter: number;
  rerank: number;
  selection: number;
  pack: number;
}

export interface BaselineRAGResponse {
  tokens: number;
  latency_s: number;
  ttft_ms: number;
  answer: string;
  raw_context: string;
}

export interface SmartRAGResponse {
  tokens: number;
  latency_s: number;
  ttft_ms: number;
  answer: string;
  compressed_text: string;
}

export interface MetricsSummary {
  token_reduction_pct: number;
  speedup_factor: number;
  cost_saved_usd: number;
}

export interface BenchmarkResponse {
  baseline: BaselineRAGResponse;
  smart: SmartRAGResponse | null;
  stage_timings_ms: StageTimings;
  metrics: MetricsSummary;
  normal_succeeded: boolean;
  smart_succeeded: boolean;
  error: string | null;
}
