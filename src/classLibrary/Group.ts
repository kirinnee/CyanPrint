import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import {Core} from "@kirinnee/core";
import {Utility} from "./Utility";
import {Objex} from "@kirinnee/objex";
import {GroupData} from "./GroupData";

export class Group {
	
	private readonly templateRoot: string;
	private readonly util: Utility;
	
	constructor(core: Core, objex: Objex, templateRoot: string, util: Utility) {
		core.AssertExtend();
		objex.AssertExtend();
		this.templateRoot = templateRoot;
		this.util = util;
	}
	
	get TopLevelConfig(): string {
		return path.resolve(this.templateRoot, "cyan.toplevel.json");
	}
	
	
	Create(key: string, name: string, email: string, readme: string, readMeContent: string): boolean {
		if (this.Exist(key)) {
			return false;
		} else {
			//Generate the folder
			let full: string = path.resolve(this.templateRoot, key);
			fs.mkdirSync(full);
			
			//Generate the meta data
			const templates: { [s: string]: string } = {};
			const groupData: GroupData = {
				name,
				key,
				email,
				templates,
				readme,
			};
			const groupDataPath: string = path.resolve(this.templateRoot, key, "cyan.group.json");
			const string: string = JSON.stringify(groupData);
			this.util.SafeWriteFile(groupDataPath, string, false);

			//Update top level mapping
			const content: any = JSON.parse(fs.readFileSync(this.TopLevelConfig, 'utf8'));
			content[key] = name;
			const out: string = JSON.stringify(content);
			this.util.SafeWriteFile(this.TopLevelConfig, out, false);

			//Create Read Me file
			const targetPath = path.resolve(this.templateRoot, key, readme);
			this.util.SafeWriteFile(targetPath, readMeContent, false);

			//Reply to console on progress
			return true;
		}
	}
	
	Delete(key: string): boolean {
		if (this.Exist(key)) {

			// Nuke group
			let full: string = path.resolve(this.templateRoot, key);
			rimraf.sync(full);

			//Remove entry from top-level
			const content: any = JSON.parse(fs.readFileSync(this.TopLevelConfig, 'utf8'));
			content[key] = null;
			delete content[key];
			const out: string = JSON.stringify(content);
			this.util.SafeWriteFile(this.TopLevelConfig, out, false);
			return true;
		} else {
			return false;
		}
	}
	
	Exist(key: string): boolean {
		const content: any = JSON.parse(fs.readFileSync(this.TopLevelConfig, 'utf8'));
		let full: string = path.resolve(this.templateRoot, key);
		const file: string = path.resolve(this.templateRoot, key, "cyan.group.json");
		return fs.existsSync(full) && fs.existsSync(file) && content[key] != null;
	}
	
	ListAsArray(): [string, string][] {
		const groups: object = JSON.parse(fs.readFileSync(this.TopLevelConfig, 'utf8'));
		const map: Map<string, string> = groups.AsMap<string>();
		return map.Where(k => this.Exist(k)).Map((k, v) => [v, k] as [string, string]);
	}
	
	ObtainGroupData(key: string): GroupData {
		const full = path.resolve(this.templateRoot, key, "cyan.group.json");
		const data = fs.readFileSync(full, 'utf8');
		return JSON.parse(data) as GroupData;
	}
	
	ListTemplate(key: string): [string, string][] {
		return this.ObtainGroupData(key).templates.AsMap<string>()
		           .Map((k, v) => [k, v] as [string, string]);
	}
	
	AddTemplate(key: string, templateKey: string, templateName: string): void {
		const full = path.resolve(this.templateRoot, key, "cyan.group.json");
		const data: GroupData = JSON.parse(fs.readFileSync(full, 'utf8'));
		data.templates[templateKey] = templateName;
		const newData: string = JSON.stringify(data);
		this.util.SafeWriteFile(full, newData, false);
	}
	
	RemoveTemplate(key: string, templateKey: string) {
		const full = path.resolve(this.templateRoot, key, "cyan.group.json");
		const data: GroupData = JSON.parse(fs.readFileSync(full, 'utf8'));
		(data.templates[templateKey] as any) = null;
		delete data.templates[templateKey];
		const newData: string = JSON.stringify(data);
		this.util.SafeWriteFile(full, newData, false);
	}
	
	
}

