import type Anthropic from "@anthropic-ai/sdk"

export const tools: Anthropic.Tool[] = [
  {
    name: "calculator",
    description: "Evaluates a basic arithmetic expression and returns the numeric result. " +
      "Supports + - * / % parentheses and decimals. Use this for ANY math instead of computing in your head.",
    input_schema: {
      type: "object",
      properties: {
        expression: { type: "string", description: "arithmetic expression, e.g: '(5.9 * 1.08) / 2'", }
      },
      required: ["expression"]
    }
  },

  {
    name: "web_search",
    description: "Searches the web and returns short text snippets. Use this to look up facts, " +
      "prices, populations or other values you don't know.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" }
      },
      required: ["query"]
    },
  }
]

function calculator(input: {expression: string}): string {
    const expr = input.expression;
    if (!/^[\d\s+\-*/%().]+$/.test(expr)) {
      throw new Error(`Invalid characters in expression: ${expr}`);
    }
    const result = Function(`"use strict"; return (${expr});`)() as number;
    if (!Number.isFinite(result)) throw new Error(`Result is not finite: ${result}`);
    return String(result);
}

function webSearch(input: { query: string }): string {
  const q = input.query.toLowerCase()
  if (q.includes("singapore")) {
      return "Singapore's total population is 6,040,000 (mock data, 2026).";
  }

  if (q.includes("malaysia")) {
    return "Malaysia's total population is 34,500,000 (mock data, 2026).";
  }

  return `No results found for "${input.query}" (mock search).`;
}

export function executeTool(name: string, input: unknown): string {

  switch (name) {
    case "calculator":
      return calculator(input as { expression: string })
    case "web_search":
      return webSearch(input as { query: string })
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
