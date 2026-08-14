import { PresetContext } from '../types';

export const PRESET_CONTEXTS: PresetContext[] = [
  {
    id: 'fox-demo',
    title: 'RAG Sample (Default)',
    category: 'Benchmark',
    query: 'Why is the quick brown fox famous?',
    rawText: `The quick brown fox jumps over the lazy dog. This is a commonly used sentence that contains every letter of the English alphabet. It is often used for typing practice. Many people find it interesting, though its origin is somewhat debated among linguists. We will use this to test the compressor.`,
  },
  {
    id: 'customer-support',
    title: 'Customer Support Transcript',
    category: 'Support Log',
    query: 'What is the user\'s refund status and order ID?',
    rawText: `Agent: Hello! Welcome to Acme Support, my name is Sarah. How can I help you today?
User: Hi Sarah, I want to check my order #84920. I requested a refund yesterday and haven't received confirmation.
Agent: Thanks for contacting us! Let me look that up in our billing database for you right now. Please hold for 30 seconds while I query the system.
Agent: I see order #84920 placed on August 10th for $149.00. The refund request was approved today at 09:15 AM EST.
User: Great, when will the funds appear back in my bank account?
Agent: Standard processing takes 3-5 business days depending on your bank institution. Is there anything else I can assist with?
User: No, that covers it. Thank you!`,
  },
  {
    id: 'financial-report',
    title: 'Q3 Financial Earnings Report',
    category: 'Finance',
    query: 'What was the Q3 revenue growth and operating margin?',
    rawText: `Acme Corp reported Q3 revenue of $420 million, representing a 28% year-over-year growth driven by enterprise SaaS adoption. Gross margin expanded by 180 basis points to 74.2%. Operating margin reached 22.5%, surpassing consensus estimates of 19.8%. Free cash flow generation remained strong at $98 million. The conference call featured opening remarks by the CEO emphasizing AI investment and international expansion in EMEA regions. The CFO noted macroeconomic headwinds in consumer hardware sales.`,
  },
  {
    id: 'codebase-docs',
    title: 'PostgreSQL Database Integration',
    category: 'Developer Docs',
    query: 'How to configure connection pool max connections in Drizzle ORM?',
    rawText: `To configure connection pooling in Drizzle ORM with Node Postgres, pass the max pool size parameter inside the pg Pool constructor. For example: const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 20, idleTimeoutMillis: 30000 }). Drizzle initialized with drizzle(pool) will reuse connections. Ensure environment variable DATABASE_URL is set in your .env file before starting the server. Many developers prefer SSL mode enabled in production deployments.`,
  }
];
