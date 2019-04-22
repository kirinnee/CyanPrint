interface GroupResponse {
	display_name: string;
	unique_key: string;
	downloads: number;
	stars: number;
	readme: string;
	templates: string[];
	author: string;
}

interface GroupData {
	name: string,
	key: string,
	email: string,
	readme: string,
	templates: { [s: string]: string }
}

export {GroupResponse, GroupData}
