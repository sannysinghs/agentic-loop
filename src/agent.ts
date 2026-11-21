import Anthropic from "@anthropic-ai/sdk"
import {tools, executeTool} from "./tools.js"
import { log } from "console"
import { ToolResultBlockParam } from "@anthropic-ai/sdk/resources"

const client = new Anthropic()
const MODEL = "claude-sonnet-5-5"
const MAX_ITERATIONS = 20

export async function runAgent(userPrompt: string): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userPrompt }]
  let iterations = 0

  while (iterations < MAX_ITERATIONS) {
    iterations++
    console.log(`\n--- Iteration ${iterations} ---`);
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      tools,
      messages,
    })

    console.log(`stop reason: ${res.stop_reason}`)
    if (res.stop_reason == "end_turn") {
      return res.content
        .filter((b): b is Anthropic.TextBlock => b.type == "text")
        .map((b) => b.text)
        .join("\n")
    }

    if (res.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: res.content })

      const toolResults: ToolResultBlockParam[] = []
      for (const block of res.content) {
        if (block.type != "tool_use") continue
        console.log(`-> ${block.name}(${JSON.stringify(block.input)})`)
        try {
          const output = executeTool(block.name, block.type)
          log(`<- ${output}`)
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: output
          })
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          console.log(`<- Error: ${msg}`)
          toolResults.push ({
            type: "tool_result",
            tool_use_id: block.id,
            content: msg
          })
        }
      }

      messages.push({
        role: "user",
        content: toolResults
      })
      continue
    }

    throw new Error(`Unexpected stop_reason: ${res.stop_reason}`)
  }

  console.warn(`⚠️  MAX_ITERATIONS (${MAX_ITERATIONS}) reached — stopped by safety cap, not stop_reason.`);
  return "Agent stopped: iteration limit reached!"
}
