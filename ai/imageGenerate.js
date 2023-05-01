import { log, bold, blue } from "./utils/log.js";

import fs from "fs";
import slugify from "slugify";
import { Sema } from "async-sema";
import { RateLimit } from "async-sema";

import * as sqlite from "./db/index.js";
const DB_FILE = "../astro/src/db/DB.db";

import { openAIGenerateImage } from "./utils/openai.js";

const lim = RateLimit(100, { timeUnit: 60 * 1000, uniformDistribution: true });

log(blue("Starting"));

try {
	await sqlite.open(DB_FILE);
	const solutions = await getSolutions();
	// console.log(solutions); process.exit();

	const count_total = solutions.length;
	const s = new Sema(10, { capacity: count_total });
	await Promise.all(
		solutions.map(async ({ audience, title, description }) => {
			await s.acquire();
			await generateImage({ audience, title, description, waiting: s.nrWaiting() });
			s.release();
		}),
	);

	await sqlite.close();
} catch (e) {
	console.log(e);
}

log(blue("Done"));

async function generateImage({ audience, title, description, waiting }) {
	await lim();

	log(`${bold("Audience:")} ${audience} → ${bold("Solution:")} ${title}`);

	const prompt = `${title} for ${audience}. No text, abstract and colorfull.`.slice(0, 1000);
	console.log(prompt);
    const image = await openAIGenerateImage(prompt);
	if(image.status === 200) {  
        const data = image.data.data;
        const image_url = data[0].url
        console.log(data);
        console.log(image_url);

    }
    else {
        console.log(`Error generating image ${image.status}`);
    }
}

async function getSolutions() {
	const solutions = await sqlite.all(`
		SELECT
            audience,
            title,
            description
		FROM
			solutions
        LIMIT 1
	`);
	return solutions;
}
