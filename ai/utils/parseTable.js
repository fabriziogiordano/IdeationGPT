export function parseTable(table) {
	if (table.charAt(0) === "|") {
		const regexp = /^\|(.*)\|\n/gim;
		const results = [...table.matchAll(regexp)].map((match) => {
			const row = match[0].split("|").map((x) => x.trim());
			row.shift();
			row.pop();
			// row[1] = row[1].split("<br>").map((x) => x.trim());
			return row;
		});
		return results.slice(2)
	} else {
		//console.log(table.split("\n").slice(2));
		return table.split("\n").slice(2).map((match) => {
			const row = match.split("|").map((x) => x.trim());
			return row;
		});
	}
}

export function parseTableSolutions(table) {
	if (table.charAt(0) === "|") {
		const regexp = /^\|(.*)\|\n/gim;
		const results = [...table.matchAll(regexp)].map((match) => {
			const row = match[0].split("|").map((x) => x.trim());
			row.shift();
			row.pop();
			return row;
		});
		return results;
	} else {
		return table.split("\n").map((match) => {
			const row = match.split("|").map((x) => x.trim());
			return row;
		});
	}
}
