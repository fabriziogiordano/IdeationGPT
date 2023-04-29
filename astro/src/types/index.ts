export interface Audience {
	id: number;
	title: string;
}

export interface PainPoint {
	id: number;
	title: string;
    solutions: Solution[];
}

export interface Solution {
	id: number;
    title: string;
    description: string;
}

export interface DataItem {
	audience: Audience;
	pain_points: PainPoint[];
}
