import * as path from "path";
import {Group} from "./Group";
import fs from "graceful-fs";
import {CyanTemplateData} from "./TemplateData";

class Template {
	
	public readonly group: string;
	public readonly key: string;
	public readonly name: string;
	public readonly link: string;
	public readonly g: Group;
	
	get Link(): string {
		return this.link;
	}
	
	get Template(): string {
		return `../templates/${this.group}/${this.key}`;
	}
	
	get Target(): string {
		return path.resolve(__dirname, this.Template);
	}
	
	Exist(): boolean {
		const exist = this.g.Exist(this.group);
		if (!exist) return false;
		const templates: string[] = this.g.ListTemplate(this.group).Map(([k, _]) => k);
		const info: string = path.resolve(this.Target, "cyan.json");
		const jsFile: string = path.resolve(this.Target, "cyan.config.js");
		return fs.existsSync(this.Target) && fs.existsSync(info) && fs.existsSync(jsFile) && templates.Has(this.key);
	}
	
	CreateGroupEntry(): void {
		this.g.AddTemplate(this.group, this.key, this.name);
	}
	
	DeleteGroupEntry(): void {
		this.g.RemoveTemplate(this.group, this.key);
	}
	
	get TemplateData(): CyanTemplateData {
		const data = fs.readFileSync(path.resolve(this.Target, "cyan.json"), 'utf8');
		return JSON.parse(data);
	}
	
	constructor(group: string, key: string, name: string, link: string, g: Group) {
		this.group = group;
		this.key = key;
		this.name = name;
		this.link = link;
		this.g = g;
	}
	
}

export {Template}
