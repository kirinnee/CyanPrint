import chalk from 'chalk';
import fs from 'graceful-fs';
import path from 'path';
import {Core} from "@kirinnee/core";

declare global {
	interface String {
		isFile(): boolean;
		
		FileName(): string;
	}
}


export class Utility {
	
	public readonly c: Core;
	
	constructor(core: Core) {
		if (!core.IsExtended) throw "Core needs to be extended";
		this.c = core;
		
		String.prototype.isFile = function (): boolean {
			if (!core.IsString(this)) return false;
			let s = this.ReplaceAll("\\\\", "/");
			if (s.Starts(".")) return true;
			return s.split(".").length > 1;
		};
		String.prototype.FileName = function (): string {
			return this.ReplaceAll("\\\\", "/").split('.').Omit(1).join('.').split('/').Last();
		};
	}
	
	static Throw(type: string, error: string, target?: object): void {
		console.log(chalk.red(type + " Exception: \n\t" + error));
		if (target) console.log(target);
		process.exit(1);
	}
	
	FlattenMappable(obj: any, prepend: string = ''): Map<string, [string, string] | string> {
		let ret: Map<string, [string, string] | string> = new Map<string, [string, string] | string>();
		
		for (let k in obj) {
			if (obj.hasOwnProperty(k)) {
				let data = obj[k];
				if (this.IsStringPair(data)) {
					ret.set(prepend + k, data);
				} else if (this.c.IsString(data)) {
					ret.set(prepend + k, data as string);
				} else if (typeof data === "object") {
					ret = new Map<string, [string, string] | string>(ret.Arr().Union(this.FlattenMappable(data, prepend + k + '.').Arr(), true));
				} else {
					Utility.Throw("Type", "Every field has be an array of 2 values [string,string]");
				}
			}
		}
		return ret;
	}
	
	IsStringPair(obj: any) {
		return Array.isArray(obj) && this.c.IsString(obj[0]) && this.c.IsString(obj[1]);
	}
	
	FlattenFlagObject(obj: any, prepend: string = ''): Map<string, boolean> {
		let ret: Map<string, boolean> = new Map<string, boolean>();
		
		for (let k in obj) {
			if (obj.hasOwnProperty(k)) {
				let data = obj[k];
				if (typeof data === "boolean") {
					ret.set(prepend + k, data);
				} else if (typeof data === "object") {
					ret = new Map<string, boolean>(ret.Arr().Union(this.FlattenFlagObject(data, prepend + k + '.').Arr(), true));
				} else {
					Utility.Throw('Type', 'Every field has to be a boolean: field ' + k);
				}
			}
		}
		return ret;
	}
	
	FlattenObject(obj: any, prepend: string = ''): Map<string, string> {
		let c = this.c;
		
		let ret: Map<string, string> = new Map<string, string>();
		
		for (let k in obj) {
			if (obj.hasOwnProperty(k)) {
				let data = obj[k];
				if (c.IsAnyString(data)) {
					if (c.IsString(data)) {
						ret.set(prepend + k, data);
					} else {
						Utility.Throw('Type', 'Every field cannot be empty: field ' + k, obj);
					}
				} else if (typeof data === "object") {
					ret = new Map<string, string>(ret.Arr().Union(this.FlattenObject(data, prepend + k + '.').Arr(), true));
				} else {
					Utility.Throw('Type', 'Every field cannot be empty: field ' + k, obj);
				}
			}
		}
		return ret;
	}
	
	async ASafeWriteFile(filePath: string, content: string, callback?: Function): Promise<void> {
		if (fs.existsSync(filePath)) return;
		this.EnsureDirectory(filePath);
		return await new Promise<void>(function (resolve) {
			fs.writeFile(filePath, content, 'utf8', function (err) {
				if (err) console.log(err);
				if (typeof callback === "function") callback();
				resolve();
			});
		});
	}
	
	async ASafeCreateDirectory(filePath: string, callback?: Function): Promise<void> {
		if (fs.existsSync(filePath)) return;
		this.EnsureDirectory(filePath);
		return await new Promise<void>(function (resolve) {
			fs.mkdir(filePath, function (err) {
				if (err) console.log(err);
				if (typeof callback === "function") callback();
				resolve();
			});
		});
	}
	
	SafeWriteFile(filePath: string, content: string): void {
		this.EnsureDirectory(filePath);
		fs.writeFileSync(filePath, content, 'utf8');
	}
	
	SafeCreateDirectory(directoryPath: string): void {
		this.EnsureDirectory(directoryPath);
		fs.mkdirSync(directoryPath);
	}
	
	MapToObject(map: Map<string, any>): object {
		let ret: object = {};
		map.Each((k: string, v: any) => {
			let dot: string[] = k.split('.');
			this.SetValue(ret, dot, v);
		});
		return ret;
	}
	
	SetValue(obj: any, dot: string[], value: any) {
		if (dot.length === 1) {
			obj[dot[0]] = value;
		} else {
			if (typeof obj[dot[0]] === "undefined") {
				obj[dot[0]] = {};
			}
			this.SetValue(obj[dot[0]], dot.Skip(1), value);
		}
	}
	
	private EnsureDirectory(filePath: string): void {
		let dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			this.EnsureDirectory(dir);
			fs.mkdirSync(dir);
		}
	}
}