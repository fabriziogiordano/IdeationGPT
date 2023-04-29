export const AUDIENCE_STATUS = {
	EMPTY: 0,
	INPROGRESS: 1,
	COMPLETED: 2,
};
export const PAIN_POIN_STATUS = {
	NEW: 0,
	PARSED: 1,
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));