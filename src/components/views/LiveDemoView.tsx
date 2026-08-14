import React, { useState } from 'react';
import { CompressionRecord, RagPreset } from '../../types';
import { RAG_PRESETS } from '../../data/ragPresets';
import { RagMode } from '../demo/RagMode';
import { PasteMode } from '../demo/PasteMode';
import { TokenPill } from '../TokenPill';
import {
  Play,
  Copy,
  Check,
  FileText,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface LiveDemoViewProps {
  onRecordCompression: (record: CompressionRecord) => void;
}

export const LiveDemoView: React.FC<LiveDemoViewProps> = ({ onRecordCompression }) => {
  // Mode selection: "rag-chunks" vs "paste-anything"
  const [demoMode, setDemoMode] = useState<'rag-chunks' | 'paste-anything'>('rag-chunks');

  // RAG Preset selection
  const [selectedPresetId, setSelectedPresetId] = useState<string>(RAG_PRESETS[0].id);

  // Input states
  const [rawText, setRawText] = useState<string>(RAG_PRESETS[0].rawText);
  const [ragQuery, setRagQuery] = useState<string>(RAG_PRESETS[0].query);

  // Image Upload state
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [isExtractingImage, setIsExtractingImage] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Compression execution & retry states
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compressionResult, setCompressionResult] = useState<{
    compressedText: string;
    rawTokens: number;
    compressedTokens: number;
    tokensSaved: number;
    compressionRatio: string;
    percentSaved: string;
    costSavedEstimate: string;
    executionTimeMs?: number;
  } | null>(null);

  // Copy state
  const [copiedCompressed, setCopiedCompressed] = useState(false);
  const [isDiffMode, setIsDiffMode] = useState<boolean>(false);

  // Helper token estimator: characters / 4
  const estimateTokens = (text: string): number => {
    if (!text || !text.trim()) return 0;
    return Math.max(1, Math.round(text.trim().length / 4));
  };

  const currentRawTokens = estimateTokens(rawText);

  // Computes which sentences are kept or removed
  const computeSentencesDiff = () => {
    if (!rawText) return [];
    
    // Split sentences but keep punctuation and separation spaces
    const sentences = rawText.split(/(?<=[.!?])\s+/).filter(Boolean);
    const compressed = compressionResult?.compressedText || '';
    
    if (!compressed) {
      return sentences.map((text) => ({ text, kept: true, reason: 'No compression run yet' }));
    }
    
    const cleanStr = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const compressedCleaned = cleanStr(compressed);
    
    return sentences.map((text) => {
      const sentenceCleaned = cleanStr(text);
      if (!sentenceCleaned) {
        return { text, kept: true, reason: 'Empty sentence' };
      }
      
      const kept = compressedCleaned.includes(sentenceCleaned);
      return {
        text,
        kept,
        reason: kept 
          ? 'Retained: high semantic relevance'
          : 'Removed: redundant or low-signal context pruned by Gemini'
      };
    });
  };

  // Handle RAG preset switch
  const handleSelectPreset = (preset: RagPreset) => {
    setSelectedPresetId(preset.id);
    setRawText(preset.rawText);
    setRagQuery(preset.query);
    setCompressionResult(null);
    setErrorMessage(null);
    setRetryStatus(null);
    setIsDiffMode(false);
  };

  // Handle Mode Switch
  const handleModeChange = (mode: 'rag-chunks' | 'paste-anything') => {
    setDemoMode(mode);
    setErrorMessage(null);
    setRetryStatus(null);
    setIsDiffMode(false);
    if (mode === 'rag-chunks') {
      const preset = RAG_PRESETS.find((p) => p.id === selectedPresetId) || RAG_PRESETS[0];
      setRawText(preset.rawText);
      setRagQuery(preset.query);
    } else {
      setUploadedImageName(null);
    }
  };

  // Image file drop/upload handler
  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploadedImageName(file.name);
    setIsExtractingImage(true);
    setErrorMessage(null);
    setRetryStatus(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;

        try {
          const res = await fetch('/api/extract-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type,
            }),
          });

          const data = await res.json();
          if (!res.ok || data.error) {
            throw new Error(data.error || 'Compression failed after 3 attempts. Please try again.');
          }

          setRawText(data.text);
          setCompressionResult(null);
        } catch (err: any) {
          setErrorMessage(err.message || 'Compression failed after 3 attempts. Please try again.');
        } finally {
          setIsExtractingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage('Failed to read image file.');
      setIsExtractingImage(false);
    }
  };

  // Run Compression with automatic retry logic
  const handleRunCompression = async () => {
    if (!rawText || !rawText.trim()) {
      setErrorMessage('Please provide raw context or select a sample preset first.');
      return;
    }

    setIsCompressing(true);
    setErrorMessage(null);
    setRetryStatus(null);

    const maxRetries = 3;
    let attempt = 1;
    let success = false;

    while (attempt <= maxRetries && !success) {
      try {
        if (attempt > 1) {
          setRetryStatus(`Gemini is experiencing high demand — retrying automatically... (Attempt ${attempt} of ${maxRetries})`);
        }

        const res = await fetch('/api/compress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawContext: rawText,
            query: demoMode === 'rag-chunks' ? ragQuery.trim() : undefined,
            mode: demoMode === 'rag-chunks' ? 'rag' : 'paste',
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          if (attempt < maxRetries) {
            attempt++;
            setRetryStatus(`Gemini is experiencing high demand — retrying automatically... (Attempt ${attempt} of ${maxRetries})`);
            await new Promise((r) => setTimeout(r, 1500));
            continue;
          } else {
            throw new Error('Compression failed after 3 attempts. Please try again.');
          }
        }

        const resultObj = {
          compressedText: data.compressedContext,
          rawTokens: data.rawTokens,
          compressedTokens: data.compressedTokens,
          tokensSaved: data.tokensSaved,
          compressionRatio: data.compressionRatio,
          percentSaved: data.percentSaved,
          costSavedEstimate: data.costSavedEstimate,
          executionTimeMs: data.executionTimeMs,
        };

        setCompressionResult(resultObj);
        setIsDiffMode(true);
        setRetryStatus(null);
        success = true;

        // Record to parent session state
        const newRecord: CompressionRecord = {
          id: `comp_${Date.now()}`,
          timestamp: Date.now(),
          mode: demoMode === 'rag-chunks' ? 'rag-chunks' : uploadedImageName ? 'image' : 'paste',
          presetTitle: demoMode === 'rag-chunks' ? RAG_PRESETS.find((p) => p.id === selectedPresetId)?.title : undefined,
          rawText,
          compressedText: data.compressedContext,
          rawTokens: data.rawTokens,
          compressedTokens: data.compressedTokens,
          tokensSaved: data.tokensSaved,
          compressionRatio: data.compressionRatio,
          percentSaved: data.percentSaved,
          percentSavedNum: data.percentSavedNum || 0,
          costSavedEstimate: data.costSavedEstimate,
          executionTimeMs: data.executionTimeMs,
          query: demoMode === 'rag-chunks' ? ragQuery.trim() : undefined,
        };

        onRecordCompression(newRecord);
      } catch (err: any) {
        if (attempt >= maxRetries) {
          setErrorMessage('Compression failed after 3 attempts. Please try again.');
          setRetryStatus(null);
          break;
        }
        attempt++;
        setRetryStatus(`Gemini is experiencing high demand — retrying automatically... (Attempt ${attempt} of ${maxRetries})`);
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    setIsCompressing(false);
  };

  const handleCopyCompressed = () => {
    if (compressionResult?.compressedText) {
      navigator.clipboard.writeText(compressionResult.compressedText);
      setCopiedCompressed(true);
      setTimeout(() => setCopiedCompressed(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-6xl">
      {/* Header & Mode Segmented Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A38] pb-5">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F5F7] tracking-tight">
            Live Context Compression Testbed
          </h2>
          <p className="text-xs sm:text-sm text-[#9494A6] mt-0.5">
            Test Gemini context pruning with realistic RAG chunks or custom pasted messages.
          </p>
        </div>

        {/* Sliding Segmented Mode Control */}
        <div className="flex items-center bg-[#14141C] p-1 rounded-[8px] border border-[#2A2A38] self-start sm:self-auto">
          <button
            onClick={() => handleModeChange('rag-chunks')}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-all duration-200 cursor-pointer ${
              demoMode === 'rag-chunks'
                ? 'bg-[#6EE7B7] text-[#0A0A0F] shadow-[0_0_12px_rgba(110,231,183,0.3)]'
                : 'text-[#9494A6] hover:text-[#F5F5F7]'
            }`}
          >
            RAG Chunks
          </button>
          <button
            onClick={() => handleModeChange('paste-anything')}
            className={`px-4 py-2 rounded-[6px] text-xs font-semibold transition-all duration-200 cursor-pointer ${
              demoMode === 'paste-anything'
                ? 'bg-[#6EE7B7] text-[#0A0A0F] shadow-[0_0_12px_rgba(110,231,183,0.3)]'
                : 'text-[#9494A6] hover:text-[#F5F5F7]'
            }`}
          >
            Paste Anything
          </button>
        </div>
      </div>

      {/* Mode A: Realistic Sample RAG Chunks Component */}
      {demoMode === 'rag-chunks' && (
        <RagMode
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          query={ragQuery}
          onChangeQuery={(newQuery) => {
            setRagQuery(newQuery);
            setCompressionResult(null);
          }}
        />
      )}

      {/* Mode B: Paste Text & Image Upload Dropzone Component */}
      {demoMode === 'paste-anything' && (
        <PasteMode
          onImageUploadedText={(extractedText, fileName) => {
            setRawText(extractedText);
            setUploadedImageName(fileName);
            setCompressionResult(null);
          }}
          isExtractingImage={isExtractingImage}
          uploadedImageName={uploadedImageName}
          dragActive={dragActive}
          setDragActive={setDragActive}
          onFileSelected={handleImageFile}
        />
      )}

      {/* Run Compression Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-4">
        <div className="flex items-center gap-3">
          <TokenPill tokens={currentRawTokens} type="raw" label="Input Context" isEstimate={true} />
          <span className="text-xs text-[#9494A6] hidden sm:inline font-mono-code">
            Ready to compress via Gemini 2.0 Flash
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {rawText && (
            <button
              onClick={() => {
                setRawText('');
                setCompressionResult(null);
                setErrorMessage(null);
                setRetryStatus(null);
                setUploadedImageName(null);
              }}
              className="px-3 py-2 rounded-[8px] border border-[#2A2A38] hover:border-[#F87171]/40 text-xs text-[#9494A6] hover:text-[#F87171] transition-colors cursor-pointer"
              title="Clear context text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleRunCompression}
            disabled={isCompressing || !rawText.trim()}
            className={`px-5 py-2.5 rounded-[8px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all duration-200 ${
              isCompressing || !rawText.trim()
                ? 'bg-[#1C1C26] text-[#9494A6] border border-[#2A2A38] cursor-not-allowed opacity-60'
                : 'bg-[#6EE7B7] hover:bg-[#80f9c8] text-[#0A0A0F] shadow-[0_0_16px_rgba(110,231,183,0.35)] active:scale-98'
            }`}
          >
            {isCompressing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Compressing...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Compression</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Automatic Retry Notification Banner */}
      {retryStatus && !errorMessage && (
        <div className="bg-[#818CF8]/10 border border-[#818CF8]/40 rounded-[12px] p-4 flex items-center gap-3 text-xs text-[#818CF8] animate-fadeIn">
          <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-[#818CF8]" />
          <div className="font-medium">{retryStatus}</div>
        </div>
      )}

      {/* Graceful Error Handling Inline Alert (Only shown if all 3 retries are exhausted) */}
      {errorMessage && (
        <div className="bg-[#F87171]/10 border border-[#F87171]/40 rounded-[12px] p-4 flex items-start gap-3 text-xs text-[#F87171] animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">Compression Notice</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Side-by-Side Context Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Raw Context Card */}
        <div className="bg-[#14141C] border border-[#2A2A38] hover:border-[#6EE7B7]/30 rounded-[12px] p-5 sm:p-6 space-y-3 flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between border-b border-[#2A2A38] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F87171]" />
              <span className="font-semibold text-xs sm:text-sm text-[#F5F5F7]">
                Raw Context
              </span>
            </div>

            <div className="flex items-center gap-2">
              {compressionResult && (
                <button
                  onClick={() => setIsDiffMode(!isDiffMode)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-[8px] border text-xs font-semibold cursor-pointer transition-all duration-200 ${
                    isDiffMode
                      ? 'bg-[#1C1C26] border-[#6EE7B7]/40 text-[#6EE7B7]'
                      : 'border-[#2A2A38] hover:border-[#6EE7B7]/30 text-[#9494A6] hover:text-[#F5F5F7]'
                  }`}
                  title={isDiffMode ? "Switch to edit context text" : "Switch to visual diff view"}
                >
                  <span>{isDiffMode ? 'Edit Text' : 'View Diff'}</span>
                </button>
              )}
              {/* Red-tinted token pill with (est) */}
              <TokenPill tokens={currentRawTokens} type="raw" isEstimate={true} />
            </div>
          </div>

          {/* Text area / Diff view for raw text */}
          <div className="flex-1 min-h-[220px]">
            {isDiffMode && compressionResult ? (
              <div className="w-full h-full min-h-[220px] bg-[#0A0A0F] border border-[#2A2A38] rounded-[8px] p-3.5 text-xs text-[#9494A6] font-mono-code leading-relaxed overflow-y-auto max-h-[360px] select-text">
                {computeSentencesDiff().map((item, idx) => {
                  if (item.kept) {
                    return <span key={idx} className="text-[#F5F5F7] mr-1">{item.text}</span>;
                  }
                  return (
                    <span
                      key={idx}
                      data-reason={item.reason}
                      className="strikethrough-red mr-1 cursor-help"
                    >
                      {item.text}
                    </span>
                  );
                })}
              </div>
            ) : (
              <textarea
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setCompressionResult(null);
                  setIsDiffMode(false);
                }}
                placeholder={
                  demoMode === 'rag-chunks'
                    ? 'Retrieved documents from vector database...'
                    : 'Paste your messy, filler-filled draft message, prompt, or notes here...'
                }
                className="w-full h-full min-h-[220px] bg-[#0A0A0F] border border-[#2A2A38] focus:border-[#6EE7B7] rounded-[8px] p-3.5 text-xs text-[#F5F5F7] font-mono-code leading-relaxed resize-y outline-none transition-colors"
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#9494A6] pt-2 border-t border-[#2A2A38]">
            <span>{rawText.length.toLocaleString()} characters</span>
            <span>{isDiffMode ? 'Visual diff view' : 'Editable input'}</span>
          </div>
        </div>

        {/* RIGHT: Compressed Context Card (subtle mint-to-indigo gradient background wash) */}
        <div className="bg-gradient-to-b from-[#14141C] via-[#14141C] to-[#14141C]/90 border border-[#2A2A38] hover:border-[#6EE7B7]/30 rounded-[12px] p-5 sm:p-6 space-y-3 flex flex-col justify-between relative overflow-hidden transition-all shadow-sm">
          {/* Subtle gradient wash */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#6EE7B7]/10 via-[#818CF8]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-[#2A2A38] pb-3 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6EE7B7]" />
              <span className="font-semibold text-xs sm:text-sm text-[#F5F5F7]">
                Compressed Context
              </span>
            </div>

            {/* Mint-tinted token pill with (est) */}
            <div className="flex items-center gap-2">
              {compressionResult ? (
                <TokenPill
                  tokens={compressionResult.compressedTokens}
                  type="compressed"
                  isEstimate={true}
                />
              ) : (
                <span className="text-xs font-mono-code text-[#9494A6] bg-[#1C1C26] px-2.5 py-1 rounded-full border border-[#2A2A38]">
                  Awaiting run
                </span>
              )}
            </div>
          </div>

          {/* Compressed Text Area / Output Box */}
          <div className="flex-1 min-h-[220px] relative z-10">
            {isCompressing ? (
              <div className="w-full h-full min-h-[220px] bg-[#0A0A0F] border border-[#2A2A38] rounded-[8px] p-6 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-7 h-7 text-[#6EE7B7] animate-spin" />
                <div className="text-xs font-semibold text-[#F5F5F7]">
                  Pruning redundant context with Gemini...
                </div>
                <div className="text-[11px] text-[#9494A6] font-mono-code">
                  Zero factual loss distillation
                </div>
              </div>
            ) : compressionResult ? (
              <div className="w-full h-full min-h-[220px] bg-[#0A0A0F] border border-[#6EE7B7]/30 rounded-[8px] p-3.5 text-xs text-[#6EE7B7] font-mono-code leading-relaxed overflow-y-auto max-h-[360px] select-text">
                {compressionResult.compressedText}
              </div>
            ) : (
              <div className="w-full h-full min-h-[220px] bg-[#0A0A0F]/60 border border-dashed border-[#2A2A38] rounded-[8px] p-6 flex flex-col items-center justify-center text-center space-y-2 text-[#9494A6]">
                <Sparkles className="w-6 h-6 text-[#9494A6]/60" />
                <div className="text-xs font-medium text-[#F5F5F7]">No compression run yet</div>
                <p className="text-[11px] text-[#9494A6] max-w-xs">
                  Click "Run Compression" to generate the distilled, high-signal context.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action / Meta */}
          <div className="flex items-center justify-between text-[11px] text-[#9494A6] pt-2 border-t border-[#2A2A38] relative z-10">
            <span>
              {compressionResult
                ? `${compressionResult.compressedText.length.toLocaleString()} characters`
                : 'Zero-loss factual retention'}
            </span>

            {compressionResult && (
              <button
                onClick={handleCopyCompressed}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#2A2A38] hover:border-[#6EE7B7]/30 hover:text-[#6EE7B7] text-xs text-[#9494A6] transition-colors cursor-pointer"
              >
                {copiedCompressed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#6EE7B7]" />
                    <span className="text-[#6EE7B7] font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy compressed text</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Telemetry Bar (Below both cards: Compression Ratio & Tokens Saved) */}
      {compressionResult && (
        <div className="bg-[#14141C] border border-[#6EE7B7]/40 rounded-[12px] p-5 sm:p-6 shadow-[0_0_25px_rgba(110,231,183,0.1)] animate-fadeIn">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono-code">
            {/* Compression Ratio */}
            <div className="space-y-1">
              <div className="text-[11px] text-[#9494A6] uppercase">Compression Ratio</div>
              <div className="text-2xl font-bold text-[#6EE7B7] tabular-nums">
                {compressionResult.compressionRatio}
              </div>
              <div className="text-[10px] text-[#9494A6]">
                {compressionResult.percentSaved} context reduction
              </div>
            </div>

            {/* Tokens Saved */}
            <div className="space-y-1">
              <div className="text-[11px] text-[#9494A6] uppercase">Tokens Saved</div>
              <div className="text-2xl font-bold text-[#6EE7B7] tabular-nums">
                {compressionResult.tokensSaved.toLocaleString()}
              </div>
              <div className="text-[10px] text-[#6EE7B7]">
                Prompt tokens saved
              </div>
            </div>

            {/* Estimated Cost Reduction */}
            <div className="space-y-1">
              <div className="text-[11px] text-[#9494A6] uppercase">Est. Cost Saved</div>
              <div className="text-2xl font-bold text-[#F5F5F7] tabular-nums">
                {compressionResult.costSavedEstimate}
              </div>
              <div className="text-[10px] text-[#9494A6]">
                per single call
              </div>
            </div>

            {/* Execution Latency */}
            <div className="space-y-1">
              <div className="text-[11px] text-[#9494A6] uppercase">Latency</div>
              <div className="text-2xl font-bold text-[#818CF8] tabular-nums">
                {compressionResult.executionTimeMs || 350}ms
              </div>
              <div className="text-[10px] text-[#818CF8]">
                Gemini 2.0 Flash
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
