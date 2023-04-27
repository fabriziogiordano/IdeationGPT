import { log, blue } from "./utils/log.js";
import fs from "fs";

import { openAISimple } from "./utils/openai.js";
import { parseTable } from "./utils/parseTable.js";

log(blue("Starting"));

const prompt = `You are an entrepreneur. For each of the problem below suggest 3 possible audience pain point to solve:
- Lack of time
- Lack of expertise
- Limited access to resources
- Limited budget
- Health concerns
- Environmental concerns
- Convenience
- Need for personalization
- Need for remote access or virtual options
- Need for education or guidance

Generate a table with 2 columns:
- one with the problem
- one with the 3 solutions each one separated in a new line

`;

const data = await openAISimple(prompt);
const table = data.content;

const dataTable = parseTable(table);
console.log(dataTable);

fs.writeFileSync("./results/problems.json", JSON.stringify(data, null, 2));

log(array);
log(blue("\nDone"));
