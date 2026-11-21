import { runAgent } from "./agent.js"

const prompt =
  "Search for the population of Singapore and the population of Malaysia, " +
  "then calculate what percentage Singapore's population is of Malaysia's."

const answer = await runAgent(prompt)
console.log(`\n==== Final answwer ====\n ${answer}`)
