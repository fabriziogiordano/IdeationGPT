import { log, warning, blue } from "./log.js";

import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
dotenv.config({ path: '../.env' });

import { system_prompt } from "./prompt.js";

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

export async function openAI(audience) {
	log(blue("Sending message to OpenAI"));
	try {
		const completion = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			temperature: 0.8,
			messages: [
				{ role: "system", content: system_prompt.trim() },
				{ role: "user", content: audience.trim() },
			],
		});
		log(blue("Message received from OpenAI"));
		return completion.data.choices[0].message;
	} catch (error) {
		log(warning("Error with OpenAI"));
	}
}

export async function openAISimple(message) {
	log(blue("Sending message to OpenAI"));
	try {
		const completion = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			temperature: 0.8,
			messages: [{ role: "user", content: message.trim() }],
		});
		log(blue("Message received from OpenAI"));
		return completion.data.choices[0].message;
	} catch (error) {
		log(warning("Error with OpenAI"));
		console.log(error);
	}

}
