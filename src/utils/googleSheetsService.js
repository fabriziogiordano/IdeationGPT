import { log } from "./log.js";

import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config({ path: '../.env' });

const sheets = google.sheets("v4");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const spreadsheetId = process.env.SPREADSHEETID;

export async function saveToSpreadSheet(audiece, result) {
	const content = JSON.parse(result.content);

	// log(content);

	const ideas = [];
	for (const i in content) {
		const idea = content[i];
		const competitors = Array.isArray(idea.competitors) ? idea.competitors.join(", ") : idea.competitors;
		ideas.push([
			idea.problem,
			idea.importance,
			idea.required_expertise,
			idea.no_code_solution,
			idea.content_solution,
			competitors,
			idea.differentiator,
		]);
	}

	const auth = await getAuthToken();

	const sheetName = audiece;

	log("Creating a new sheet...");
	const sheetNameNew = await createNewSheet({ auth, sheetName });

	// Insert Sheet
	const values = [
		["Prompt", sheetName.charAt(0).toUpperCase() + sheetName.slice(1)],
		[],
		[
			"Problem",
			"Importance",
			"Required expertise",
			"No code solution",
			"Content solution",
			"Competitors",
			"Differentiator",
		],
		...ideas,
	];
	
	log("Adding data to spreadsheet...");
	await insertData({
		sheetName: sheetNameNew,
		resource: {
			values,
		},
		auth,
	});
}

async function getAuthToken() {
	const auth = new google.auth.GoogleAuth({
		projectId: process.env.PROJECTID,
		keyFilename: process.env.KEYFILENAME,
		scopes: SCOPES,
	});
	const authToken = await auth.getClient();
	return authToken;
}

async function createNewSheet({ sheetName, auth }) {
	try {
		const res = await sheets.spreadsheets.batchUpdate({
			spreadsheetId,
			resource: {
				requests: [
					{
						addSheet: {
							properties: {
								title: sheetName,
							},
						},
					},
				],
			},
			auth,
		});
		return sheetName;
	} catch (error) {
		sheetName = `${sheetName}(1)`;
		sheetName = await createNewSheet({ sheetName });
	}

	return sheetName;
}

async function insertData({ sheetName, resource, auth }) {
	const res = await sheets.spreadsheets.values.append({
		spreadsheetId,
		range: `${sheetName}!A1`,
		valueInputOption: "RAW", // "USER_ENTERED",
		//insertDataOption: "INSERT_ROWS",
		resource,
		auth,
	});
	return res;
}

// // Get Sheet
// const spreadsheet = await getSpreadSheet();
// sheetName = spreadsheet.data.sheets[0].properties.title;
// console.log(sheetName);

// // Clear Sheet
// const clearSpreadSheetLog = await clearSpreadSheet({ sheetName });
// console.log(clearSpreadSheetLog.data);

// Insert Sheet
// const values = [
// 	[1,2,3],
// 	// Potential next row
// ];
// const resource = {
// 	values,
// };

// console.log(resource);

// const spreadsheetClearValues = await insertData({ sheetName: "Sheet2", resource });
// console.log(spreadsheetClearValues.data);

// sheetName = "Sheet2";
// const createNewSheetLog1 = await createNewSheet({ sheetName });
// console.log(createNewSheetLog1.data);

// sheetName = "Sheet2";
// const createNewSheetLog2 = await createNewSheet({ sheetName });
// console.log(createNewSheetLog2.data);

// const spreadsheetValues = await getSpreadSheetValues({ sheetName });
// console.log(spreadsheetValues.data);

// async function getSpreadSheet() {
// 	const res = await sheets.spreadsheets.get({
// 		spreadsheetId,
// 		auth,
// 	});
// 	return res;
// }

// async function getSpreadSheetValues({ sheetName }) {
// 	const res = await sheets.spreadsheets.values.get({
// 		spreadsheetId,
// 		range: sheetName,
// 		auth,
// 	});
// 	return res;
// }

// async function clearSpreadSheet({ sheetName }) {
// 	const res = await sheets.spreadsheets.values.clear({
// 		spreadsheetId,
// 		range: `${sheetName}!R1C1:R100C100`,
// 		auth,
// 	});
// 	return res;
// }
