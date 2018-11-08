import {FileSystemInstance, IFile} from "../File";
import {MapType, ParsingStrategy} from "./ParsingStrategy";
import {Core} from "@kirinnee/core";

class GuidResolver implements ParsingStrategy {
	
	private static guids: string[] = [];
	
	constructor(core: Core) {
		core.AssertExtend();
	}
	
	get MapType(): MapType {
		return MapType.GUID;
	}
	
	get Target(): string {
		return "guid";
	}
	
	IsGuid(guid: string) {
		let regex: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
		return regex.test(guid) && guid.length === 36;
	}
	
	ReplaceGuid(guidArr: Map<string, string>, f: FileSystemInstance): FileSystemInstance {
		let upper: Map<string, string> = guidArr.MapKey((s: string) => s.toUpperCase());
		let lower: Map<string, string> = guidArr.MapKey((s: String) => s.toLowerCase());
		if (f["content"] != null) {
			let file: IFile = f as IFile;
			let content = file.content;
			upper.Each((k: string, v: string) => content = content.ReplaceAll(k, v));
			lower.Each((k: string, v: string) => content = content.ReplaceAll(k, v));
			file.content = content;
			return file;
		}
		return f;
	}
	
	Count(guidArr: string[], files: FileSystemInstance[], data: Map<string, number>, ignoreFile: boolean): Map<string, number> {
		if (!ignoreFile) return data;
		files.Each((f: FileSystemInstance) => {
			if (f["content"] != null) {
				let file: IFile = f as IFile;
				guidArr.Each((s: string) => {
					let num: number = file.content.Count(s.toUpperCase());
					if (data.has(s)) {
						data.set(s, data.get(s)! + num);
					} else {
						data.set(s, num);
					}
				})
			}
		});
		return data;
	}
	
	GenerateGuid() {
		var d = new Date().getTime();
		if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
			d += performance.now(); //use high-precision timer if available
		}
		let x = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		
		if (GuidResolver.guids.Has(x)) {
			return this.GenerateGuid();
		} else {
			GuidResolver.guids.push(x);
			return x;
		}
	}
	
	ResolveContents(guidArr: string[], files: FileSystemInstance[]): FileSystemInstance[] {
		let map: Map<string, string> = guidArr.AsKey(() => this.GenerateGuid());
		return files.Each((f: FileSystemInstance) => {
			if (f["content"] != null) {
				let file: IFile = f as IFile;
				let content = file.content;
				map.Each((s: string, v: string) => content = content.ReplaceAll(s.toLowerCase(), v).ReplaceAll(s.toUpperCase(), v));
				file.content = content;
			}
		});
	}
	
	ResolveFiles(wFlag: any, files: FileSystemInstance[]): FileSystemInstance[] {
		return files;
	}
	
	CountPossibleUnaccountedFlags(files: FileSystemInstance[]): string[] {
		return [];
	}
	
}

export {GuidResolver}