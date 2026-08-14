import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, RefreshCw, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface PasteModeProps {
  onImageUploadedText: (extractedText: string, fileName: string) => void;
  isExtractingImage: boolean;
  uploadedImageName: string | null;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  onFileSelected: (file: File) => void;
}

export const PasteMode: React.FC<PasteModeProps> = ({
  onImageUploadedText,
  isExtractingImage,
  uploadedImageName,
  dragActive,
  setDragActive,
  onFileSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Image Upload Dropzone & Multimodal OCR */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-[12px] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? 'border-[#6EE7B7] bg-[#6EE7B7]/10'
            : 'border-[#2A2A38] hover:border-[#6EE7B7]/50 bg-[#14141C]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileSelected(e.target.files[0]);
            }
          }}
        />

        {isExtractingImage ? (
          <div className="space-y-2 flex flex-col items-center py-2">
            <RefreshCw className="w-7 h-7 text-[#818CF8] animate-spin" />
            <div className="text-xs font-semibold text-[#F5F5F7]">
              Extracting document text with Gemini Multimodal...
            </div>
            <div className="text-[11px] text-[#9494A6] font-mono-code">
              Parsing paragraphs, tables, and clauses
            </div>
          </div>
        ) : uploadedImageName ? (
          <div className="space-y-2 flex flex-col items-center py-1">
            <div className="p-2.5 rounded-full bg-[#6EE7B7]/15 text-[#6EE7B7]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-[#F5F5F7] truncate max-w-sm">
              {uploadedImageName}
            </div>
            <div className="text-[11px] text-[#6EE7B7]">
              Text extracted and loaded into Raw Context
            </div>
            <span className="text-[10px] text-[#9494A6] underline hover:text-[#F5F5F7]">
              Click or drag another image to replace
            </span>
          </div>
        ) : (
          <div className="space-y-2 flex flex-col items-center py-1">
            <div className="p-3 rounded-full bg-[#1C1C26] text-[#818CF8] border border-[#2A2A38]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#F5F5F7]">
                Upload Document Screenshot or Diagram
              </span>
              <p className="text-[11px] text-[#9494A6] mt-0.5">
                Drag & drop or click to browse (PNG, JPG, WEBP) — Gemini will transcribe text directly
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mode explanation banner (No Target Query field in Paste Mode!) */}
      <div className="bg-[#14141C] border border-[#2A2A38] rounded-[12px] p-3.5 flex items-center justify-between text-xs text-[#9494A6]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#6EE7B7] shrink-0" />
          <span>
            Paste custom rambling notes, draft prompts, or messy transcripts below. Gemini will compress filler words and redundant phrases with zero factual loss.
          </span>
        </div>
      </div>
    </div>
  );
};
