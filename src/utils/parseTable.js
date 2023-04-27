export function parseTable(table) {
	if (table.charAt(0) === "|") {
		const regexp = /^\|(.*)\|\n/gim;

		return [...table.matchAll(regexp)].map((match) => {
			const row = match[0].split("|").map((x) => x.trim());
			row.shift();
			row.pop();
			row[1] = row[1].split("<br>").map((x) => x.trim());
			return row;
		});
	} else {
		return table.split("\n").map((match) => {
			const row = match[0].split("|").map((x) => x.trim());
			return row;
		});
	}
}
