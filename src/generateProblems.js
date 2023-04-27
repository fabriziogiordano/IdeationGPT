import { log, green } from "./utils/log.js";
import fs from "fs";

import { openAISimple } from "./utils/openai.js";
import { parseTable } from "./utils/parseTable.js";

log(green("Starting"));

const prompt = `
You are an entrepreneur.

For each of the problem below suggest 3 possible audience pain point to solve in the {PROBLEM}:
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
- one with the 3 solutions each one separated by a <br> tag

`;

const space = "online education space";

const data = await openAISimple(prompt.trim().replace("{PROBLEM}", space) + '\n');
data.space = space;
const table = data.content;

const dataTable = parseTable(table);
console.log(dataTable);

fs.writeFileSync("../problems/problems.json", JSON.stringify(data, null, 2));

log(green("Done"));
