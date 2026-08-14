import React, { useState } from 'react';
import { Terminal, Copy, Check, BookOpen, ArrowRight, ExternalLink, Sparkles } from 'lucide-react';

export const DocsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'langchain' | 'rest'>('python');
  const [copied, setCopied] = useState(false);

  const codeSnippets = {
    python: `# 1. Install via pip
# pip install tokendiet-rag

from tokendiet import TokenDiet

# Initialize TokenDiet Client
td = TokenDiet(api_key="td_live_94f8a12bc")

# Drop into your retrieval loop
raw_context = vector_db.query("What is Acme's Q3 revenue growth?")
compressed_context = td.compress(
    context=raw_context,
    query="What is Acme's Q3 revenue growth?",
    target_reduction=0.6,
    mode="bm25"
)

# Pass lean context to Gemini or OpenAI
response = gemini.generate_content(f"{compressed_context.text}")
print(response.text)`,

    node: `// 1. Install via npm
// npm install @tokendiet/sdk

import { TokenDiet } from '@tokendiet/sdk';

const td = new TokenDiet({ apiKey: process.env.TOKENDIET_API_KEY });

// Middleware compression call
const { compressedContext, percentSaved, latencyDropMs } = await td.compress({
  rawContext: rawVectorResults,
  query: "What is Acme's Q3 revenue growth?",
  mode: "cross-encoder",
  targetRatio: 0.60
});

console.log(\`Compressed context in \${latencyDropMs}ms (saved \${percentSaved})\`);`,

    langchain: `# Native LangChain Integration
from langchain.retrievers import ContextualCompressionRetriever
from tokendiet.langchain import TokenDietCompressor

# Drop-in TokenDiet Retriever Middleware
compressor = TokenDietCompressor(mode="llm-semantic", target_ratio=0.6)
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=vectorstore.as_retriever()
)

# Context is automatically pruned before reaching generation chain
compressed_docs = compression_retriever.invoke("What is Acme's Q3 revenue growth?")`,

    rest: `# Direct High-Performance REST Gateway API
curl -X POST https://api.tokendiet.io/v1/compress \\
  -H "Authorization: Bearer td_live_94f8a12bc" \\
  -H "Content-Type: application/json" \\
  -d '{
    "raw_context": "Acme Corp reported Q3 revenue of $420 million...",
    "query": "What is Acme Q3 revenue?",
    "mode": "BM25",
    "target_ratio": 0.60
  }'`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="space-y-10 my-24 scroll-mt-28" id="docs">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <BookOpen className="w-4 h-4 text-[#6EE7B7]" />
            <span className="font-mono-code text-xs text-[#6EE7B7] font-bold uppercase tracking-wider">
              DEVELOPER INTEGRATION
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#e4e1ed] tracking-tight">
            Built to drop into your stack
          </h2>
          <p className="font-body text-sm text-[#bccac1] mt-1">
            Zero re-indexing. Wrap your existing retriever in under 4 lines of code.
          </p>
        </div>

        {/* Multi-Language Tabs */}
        <div className="flex items-center gap-1.5 font-mono-code text-xs bg-[#0A0A0F] p-1.5 rounded-xl border border-[#2A2A38]">
          {(['python', 'node', 'langchain', 'rest'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveTab(lang)}
              className={`px-3.5 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === lang
                  ? 'bg-[#6EE7B7] text-[#0A0A0F] shadow-[0_0_12px_rgba(110,231,183,0.3)]'
                  : 'text-[#888899] hover:text-white hover:bg-white/5'
              }`}
            >
              {lang === 'node' ? 'Node / TS' : lang}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Code Block Card */}
      <div className="bg-[#0A0A0F] border border-[#2A2A38] rounded-2xl overflow-hidden shadow-premium-card font-mono-code text-xs">
        {/* Mac-Style Window Header */}
        <div className="bg-[#14141C] px-5 py-3.5 border-b border-[#2A2A38] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F87171]" />
              <span className="w-3 h-3 rounded-full bg-[#818CF8]" />
              <span className="w-3 h-3 rounded-full bg-[#6EE7B7]" />
            </div>
            <span className="text-[#888899] text-xs ml-3">
              quickstart_{activeTab}.{activeTab === 'python' || activeTab === 'langchain' ? 'py' : activeTab === 'node' ? 'ts' : 'sh'}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[#bccac1] hover:text-[#6EE7B7] bg-[#1C1C26] px-3.5 py-1.5 rounded-lg border border-[#2A2A38] hover:border-[#6EE7B7]/40 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#6EE7B7]" />
                <span className="text-[#6EE7B7] font-bold">Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Snippet</span>
              </>
            )}
          </button>
        </div>

        {/* Code Viewport */}
        <pre className="p-6 sm:p-8 text-[#e4e1ed] overflow-x-auto leading-relaxed text-xs sm:text-sm">
          <code>{codeSnippets[activeTab]}</code>
        </pre>
      </div>

      {/* Docs Link */}
      <div className="flex items-center justify-between text-xs font-mono-code">
        <a
          href="#docs"
          className="inline-flex items-center gap-2 text-[#bccac1] hover:text-[#6EE7B7] transition-colors group cursor-pointer"
        >
          <span className="group-hover:underline">Full documentation & API reference</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </a>

        <span className="text-[#888899]">Supports Python 3.9+, Node 18+, Go, and Rust</span>
      </div>
    </section>
  );
};
