import fetch, {HeadersInit, RequestInit, Response} from "node-fetch"
import {TemplateData, TemplateResponse} from "../TemplateData";

class ApiSdk {
	
	constructor(host: string) {
		this.host = host;
	}
	
	private readonly host: string;
	
	private Endpoint(path: string): string {
		return `${this.host}/${path}`;
	}
	
	private async ping<T>(path: string, method: string = "GET", content: any = null, headers: HeadersInit = {
		accept: "application/json",
		'Content-Type': 'application/json'
	}): Promise<T> {
		try {
			const request: RequestInit = {
				method,
				headers,
			};
			if (content != null) {
				request.body = JSON.stringify(content);
			}
			return await this.fetch<T>(this.Endpoint(path), request);
		} catch (e) {
			return Promise.reject(e);
		}
		
	}
	
	private async fetch<T>(input: string, init?: RequestInit): Promise<T> {
		const response: Response = await fetch(input, init);
		if (response.status === 204) {
			return {} as T;
		}
		try {
			const body = await response.json();
			if (!response.ok) return Promise.reject({name: "Error", message: body, type: response.status});
			return body;
		} catch {
			return {} as T;
		}
		
	}
	
	async TemplateExist(k: string): Promise<boolean> {
		try {
			await this.ping<void>(`template/${k}`, "HEAD");
			return true;
		} catch {
			return false;
		}
	}
	
	async GetTemplateData(k: string): Promise<TemplateResponse> {
		try {
			return await this.ping<TemplateResponse>(`template/${k}`, "GET");
		} catch (e) {
			return Promise.reject(e);
		}
	}
	
	async UpdateTemplate(template: TemplateData, secret: string): Promise<void> {
		try {
			const body = {
				name: template.name,
				repo: template.repo,
				secret,
				email: template.email,
				readme: template.readme,
			};
			await this.ping<TemplateResponse>(`template/${template.key}`, "PUT", body);
			return
		} catch (e) {
			return Promise.reject(e);
		}
	}
	
	
}

export {ApiSdk}
