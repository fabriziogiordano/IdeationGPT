import { log, warning, blue, white } from "./log.js";

import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

export async function openAI(system, user) {
	log(blue(`Sending message to OpenAI for ${white(user)}`));
	try {
		const completion = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			temperature: 1,
			messages: [
				{ role: "system", content: system.trim() },
				{ role: "user", content: user.trim() },
			],
		});
		log(blue(`Message received from OpenAI ${white(user)}`));
		return completion.data.choices[0].message;
	} catch (error) {
		log(warning("Error with OpenAI"));
	}
}

export async function openAISimple(message, detail) {
	log(blue(`Sending message to OpenAI for: ${white(detail)}`));
	try {
		const completion = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			temperature: 0.8,
			messages: [{ role: "user", content: message }],
		});
		log(blue(`Message received from OpenAI for: ${white(detail)}`));
		return completion.data.choices[0].message;
	} catch (error) {
		log(warning("Error with OpenAI"));
		console.log(error);
	}
}
