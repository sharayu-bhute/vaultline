export const GITHUB_API_BASE =
  process.env.GITHUB_API_BASE?.replace(/\/$/, "") || "https://api.github.com";

export const GITHUB_HOST = process.env.GITHUB_HOST || "github.com";

export const GROQ_API_URL =
  process.env.GROQ_API_URL ||
  "https://api.groq.com/openai/v1/chat/completions";