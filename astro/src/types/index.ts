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

export interface DataItem {
	audience: Audience;
	pain_points: PainPoint[];
}
