import React, { useState } from 'react';
import { PageHeader } from '../PageHeader';
import {
  BookOpen,
  Copy,
  Check,
  Terminal,
  Code2,
  ExternalLink,
  ShieldCheck,
  FileCode,
  ArrowRight,
} from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'langchain' | 'rest'>('python');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const codeSnippets = {
    python: `# 1. Install TokenDiet SDK via pip
# pip install tokendiet-rag

from tokendiet import TokenDiet

# Initialize Stateless Gateway Client
td = TokenDiet(api_key="td_live_94f8a12bc90a")

# Query your existing vector index
raw_context = vector_db.query("What was Acme Corp's Q3 net revenue growth?")

# Drop-in context pruning (1 line of code)
compressed = td.compress(
    context=raw_context,
    query="What was Acme Corp's Q3 net revenue growth?",
    mode="cross-encoder",
    target_reduction=0.60
)

# Send ultra-lean context to Gemini 2.0 or GPT-4o
response = gemini.generate_content(
    contents=f"Context: {compressed.text}\\n\\nQuestion: What was Acme Corp's Q3 net revenue growth?"
)
print(response.text)`,

    node: `// 1. Install TokenDiet SDK via npm
// npm install @tokendiet/sdk

import { TokenDiet } from '@tokendiet/sdk';

const td = new TokenDiet({
  apiKey: process.env.TOKENDIET_API_KEY
});

// Middleware compression call in your RAG route
const { compressedContext, percentSaved, latencyDropMs } = await td.compress({
  rawContext: rawVectorResults,
  query: "What was Acme Corp's Q3 net revenue growth?",
  mode: "cross-encoder",
  targetRatio: 0.60
});

console.log(\`Compressed context in \${latencyDropMs}ms (saved \${percentSaved})\`);
// Forward compressedContext to LLM stream`,

    langchain: `# Native LangChain Contextual Compression
from langchain.retrievers import ContextualCompressionRetriever
from tokendiet.langchain import TokenDietCompressor

# Initialize TokenDiet Compressor Middleware
compressor = TokenDietCompressor(
    mode="llm-semantic",
    target_ratio=0.60
)

compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever()
)

# Context is automatically pruned before reaching generation chain
compressed_docs = compression_retriever.invoke(
    "What was Acme Corp's Q3 net revenue growth?"
)`,

    rest: `# Direct High-Throughput REST Gateway API
curl -X POST https://api.tokendiet.io/v1/compress \\
  -H "Authorization: Bearer td_live_94f8a12bc90a" \\
  -H "Content-Type: application/json" \\
  -d '{
    "raw_context": "Acme Corp reported Q3 revenue of $420 million representing 28% year-over-year growth...",
    "query": "What was Acme Corp Q3 net revenue growth?",
    "mode": "cross-encoder",
    "target_ratio": 0.60
  }'`,
  };

  const jsonResponseShape = `{
  "success": true,
  "gateway": "tokendiet-edge-v2",
  "mode": "cross-encoder",
  "executionMs": 13.8,
  "metrics": {
    "rawTokens": 1847,
    "compressedTokens": 612,
    "compressionRatio": "3.0x",
    "percentSaved": "66.9%",
    "costSavedEstimate": "$0.0031"
  },
  "compressedContext": "Acme Corp reported Q3 revenue of $420 million (28% YoY growth). Gross margin: 74.2%. Operating margin: 22.5%.",
  "prunedSentencesCount": 14,
  "retainedSentencesCount": 5
}`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(jsonResponseShape);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* View Header */}
      <PageHeader
        eyebrow="INTEGRATION GUIDE"
        title="Drop-in SDK & REST API Reference"
        description="Integrate context pruning into your Python, Node, or LangChain retrieval chain in under 4 lines of code."
      />

      {/* Grid: Code Snippet & API Response Shape */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: SDK Quickstart (7 cols) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono-code text-xs">
            <div className="flex items-center gap-2 text-[#e4e1ed] font-bold">
              <Terminal className="w-4 h-4 text-[#6EE7B7]" />
              <span>1. CLIENT INTEGRATION SNIPPET</span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-[#0A0A0F] p-1 rounded-lg border border-[#2A2A38]">
              {(['python', 'node', 'langchain', 'rest'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveTab(lang)}
                  className={`px-3 py-1 rounded-md font-bold uppercase transition-all cursor-pointer text-[11px] ${
                    activeTab === lang
                      ? 'bg-[#6EE7B7] text-[#0A0A0F] shadow-[0_0_10px_rgba(110,231,183,0.3)]'
                      : 'text-[#888899] hover:text-white'
                  }`}
                >
                  {lang === 'node' ? 'Node / TS' : lang}
                </button>
              ))}
            </div>
          </div>

          {/* Code Window */}
          <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-xl overflow-hidden shadow-2xl font-mono-code text-xs">
            <div className="bg-[#14141C] px-4 py-3 border-b border-[#2A2A38] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F87171]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7]" />
                <span className="text-[#888899] text-[11px] ml-2">
                  app_retriever.{activeTab === 'python' || activeTab === 'langchain' ? 'py' : activeTab === 'node' ? 'ts' : 'sh'}
                </span>
              </div>

              <button
                onClick={handleCopySnippet}
                className="flex items-center gap-1.5 text-[11px] text-[#bccac1] hover:text-[#6EE7B7] bg-[#1C1C26] px-3 py-1 rounded border border-[#2A2A38] transition-colors cursor-pointer"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#6EE7B7]" />
                    <span className="text-[#6EE7B7] font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-5 text-[#e4e1ed] overflow-x-auto leading-relaxed text-xs">
              <code>{codeSnippets[activeTab]}</code>
            </pre>
          </div>
        </div>

        {/* Right Column: API Response Shape (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="flex items-center justify-between font-mono-code text-xs">
            <div className="flex items-center gap-2 text-[#e4e1ed] font-bold">
              <Code2 className="w-4 h-4 text-[#818CF8]" />
              <span>2. API RESPONSE PAYLOAD (JSON)</span>
            </div>

            <button
              onClick={handleCopyResponse}
              className="flex items-center gap-1.5 text-[11px] text-[#bccac1] hover:text-[#818CF8] bg-[#0A0A0F] px-3 py-1 rounded border border-[#2A2A38] transition-colors cursor-pointer"
            >
              {copiedResponse ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#818CF8]" />
                  <span className="text-[#818CF8] font-bold">Copied JSON</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-xl overflow-hidden shadow-2xl font-mono-code text-xs">
            <div className="bg-[#14141C] px-4 py-3 border-b border-[#2A2A38] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
                <span className="text-[#6EE7B7] text-[11px] font-bold">HTTP 200 OK • 13.8ms</span>
              </div>
              <span className="text-[#888899] text-[10px]">application/json</span>
            </div>

            <pre className="p-5 text-[#80f9c8] overflow-x-auto leading-relaxed text-xs">
              <code>{jsonResponseShape}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Parameter Reference Table */}
      <div className="bg-[#14141C] border border-[#2A2A38] rounded-xl p-5 sm:p-6 space-y-4 font-mono-code text-xs">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-[#e4e1ed] font-bold">
            <FileCode className="w-4 h-4 text-[#6EE7B7]" />
            <span className="uppercase">Request Parameters & Defaults</span>
          </div>
          <span className="text-[11px] text-[#888899]">v2.0 Gateway Spec</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[#888899] border-b border-white/5">
              <tr>
                <th className="py-2 pr-4 font-bold">Param</th>
                <th className="py-2 px-4 font-bold">Type</th>
                <th className="py-2 px-4 font-bold">Default</th>
                <th className="py-2 pl-4 font-bold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[#bccac1]">
              <tr>
                <td className="py-2.5 pr-4 text-[#6EE7B7] font-bold">rawContext</td>
                <td className="py-2.5 px-4 text-[#888899]">string | string[]</td>
                <td className="py-2.5 px-4 text-[#F87171]">required</td>
                <td className="py-2.5 pl-4">The raw retrieved document chunks or full context text.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[#6EE7B7] font-bold">query</td>
                <td className="py-2.5 px-4 text-[#888899]">string</td>
                <td className="py-2.5 px-4 text-[#F87171]">required</td>
                <td className="py-2.5 pl-4">The active user question/directive guiding semantic relevance.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[#6EE7B7] font-bold">mode</td>
                <td className="py-2.5 px-4 text-[#888899]">string</td>
                <td className="py-2.5 px-4 text-[#e4e1ed]">"cross-encoder"</td>
                <td className="py-2.5 pl-4">Algorithm strategy: BM25, Cross-Encoder, LLM-Semantic, or HyDE.</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4 text-[#6EE7B7] font-bold">targetRatio</td>
                <td className="py-2.5 px-4 text-[#888899]">number</td>
                <td className="py-2.5 px-4 text-[#e4e1ed]">0.60</td>
                <td className="py-2.5 pl-4">Target compression percentage (0.40 = 40%, 0.60 = 60%, 0.80 = 80%).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
