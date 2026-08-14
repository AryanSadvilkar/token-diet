import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "15mb" }));

  // Helper token estimator (characters / 4 rule of thumb)
  const estimateTokens = (text: string): number => {
    if (!text || !text.trim()) return 0;
    return Math.max(1, Math.round(text.trim().length / 4));
  };

  // Helper to initialize Gemini
  const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Helper for sleeping during retries
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Helper with 3x retry on 503 / UNAVAILABLE / transient errors
  async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 3, delayMs = 1500): Promise<T> {
    let lastError: any;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("Resource has been exhausted") ||
          errMsg.includes("429") ||
          errMsg.includes("overloaded") ||
          errMsg.includes("fetch failed");

        console.warn(`Gemini API attempt ${attempt}/${maxRetries} failed: ${errMsg}`);

        if (attempt < maxRetries && (isTransient || attempt === 1)) {
          await sleep(delayMs);
        } else if (attempt === maxRetries) {
          break;
        }
      }
    }
    throw lastError;
  }

  // Multimodal Image Text Extraction Endpoint
  app.post("/api/extract-image", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/png" } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "imageBase64 is required" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.status(500).json({
          error: "Gemini API key is not configured in environment variables (GEMINI_API_KEY).",
        });
      }

      // Clean base64 data if it contains a data URL header
      const cleanedBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanedBase64,
                  mimeType: mimeType,
                },
              },
              {
                text: "Extract all readable text, documentation, notes, or paragraphs from this image verbatim. Preserve layout, paragraphs, and list structure. Return ONLY the extracted text, with no conversational preamble or markdown code fences.",
              },
            ],
          },
        })
      );

      const extractedText = response.text?.trim() || "";
      if (!extractedText) {
        return res.status(422).json({ error: "No readable text could be extracted from the uploaded image." });
      }

      const estimatedTokens = estimateTokens(extractedText);

      return res.json({
        success: true,
        text: extractedText,
        estimatedTokens,
      });
    } catch (err: any) {
      console.error("Image Extraction Error:", err);
      return res.status(500).json({
        error: "Compression failed after 3 attempts. Please try again.",
      });
    }
  });

  // Context Compression API Endpoint
  app.post("/api/compress", async (req, res) => {
    const startTime = Date.now();
    try {
      const { rawContext, query, mode = "rag" } = req.body;

      if (!rawContext || typeof rawContext !== "string" || !rawContext.trim()) {
        return res.status(400).json({ error: "rawContext is required and cannot be empty." });
      }

      const rawTokens = estimateTokens(rawContext);
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(500).json({
          error: "GEMINI_API_KEY is not configured on the server. Please check environment settings.",
        });
      }

      let prompt = "";
      if (mode === "paste") {
        // Mode B: Paste Anything
        prompt = `Rewrite the following text to be maximally concise and information-dense for an AI system to parse — remove filler words, redundant phrasing, and unnecessary pleasantries, while preserving every factual detail, instruction, and constraint. Format the output in clean Markdown structure if it improves clarity for an AI reader. Return ONLY the compressed text, no commentary.

Text to compress:
"""
${rawContext}
"""`;
      } else {
        // Mode A: RAG Chunks
        const targetQueryText = query ? `Target User Query / Focus Directive: "${query}"\n\n` : "";
        prompt = `Given this retrieved document context and this user query, remove all sentences and details irrelevant to answering the query, while preserving every fact directly relevant to it. Return ONLY the compressed text, no commentary.

${targetQueryText}Retrieved Document Context:
"""
${rawContext}
"""`;
      }

      const response = await callGeminiWithRetry(() =>
        ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: {
            temperature: 0.1,
          },
        })
      );

      const compressedText = response.text?.trim() || rawContext;
      const compressedTokens = estimateTokens(compressedText);
      const executionTimeMs = Date.now() - startTime;

      // Calculate token savings and compression ratio
      const tokensSaved = Math.max(0, rawTokens - compressedTokens);
      const ratioNumber = compressedTokens > 0 ? rawTokens / compressedTokens : 1.0;
      const compressionRatio = `${ratioNumber.toFixed(1)}x`;
      const percentSavedNum = rawTokens > 0 ? Math.round((tokensSaved / rawTokens) * 100) : 0;
      const percentSaved = `${percentSavedNum}%`;

      // Cost estimation assuming standard $2.50 per 1M tokens ($0.0025 per 1k tokens)
      const costSavedEstimate = `$${((tokensSaved / 1000) * 0.0025).toFixed(5)}`;

      return res.json({
        success: true,
        rawTokens,
        compressedTokens,
        tokensSaved,
        compressionRatio,
        percentSaved,
        percentSavedNum,
        executionTimeMs,
        costSavedEstimate,
        compressedContext: compressedText,
        source: "gemini-2.0-flash",
      });
    } catch (err: any) {
      console.error("Compression API Error:", err);
      return res.status(500).json({
        error: "Compression failed after 3 attempts. Please try again.",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TokenDiet server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
