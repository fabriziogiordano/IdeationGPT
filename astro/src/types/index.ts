export interface DataItem {
	id: number;
	title: string;
	slug: string;
	pain_points: PainPoint[];
}

export interface Audience {
	id: number;
	title: string;
	slug: string;
}
export interface PainPoint {
	id: number;
	title: string;
	slug: string;
	description: string;
	status: string;
	solutions: Solution[];
}

export interface Solution {
	id: number;
	title: string;
	description: string;
	slug: string;
	features: string;
	competitors: string;
	differentiator: string;
}
export interface SlugAudiences {
	params: {
		audiences: string;
	};
	props: {
		id: number;
		title: string;
		slug: string;
	};
}

export interface SlugAudiencesPainPoints {
	params: {
		audience: string;
		pain_point: string;
	};
	props: {
		audience: Audience;
		pain_point: PainPoint;
		solutions: Solution[];
	};
}

export interface SlugAudiencesPainPointsSolutions {
	params: {
		audience: string;
		pain_point: string;
		solution: string;
	};
	props: {
		audience: Audience;
		pain_point: PainPoint;
		solution: Solution;
	};
}


