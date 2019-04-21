interface TemplateData {
	name: string;
	key: string;
	repo: string;
	email: string;
	/**
	 * This is base64 encode
	 */
	readme: string;
}

interface CyanTemplateData {
	name: string;
	key: string;
	repo: string;
	email: string;
	/**
	 * This is relative path
	 */
	readme: string;
}

interface TemplateResponse {
	display_name: string;
	unique_key: string;
	author: string;
	repository: string;
	downloads: number;
	stars: number;
	readme: string;
	group: string[];
}

export {TemplateData, TemplateResponse, CyanTemplateData}
