import {Utility} from "../Utility";
import {FileSystemInstance, IFile} from "../File";
import {MapType, ParsingStrategy} from "./ParsingStrategy";

class VariableResolver implements ParsingStrategy {
	
	Target: string = "variable";
	MapType: MapType = MapType.VARIABLE;
	private util: Utility;
	
	constructor(util: Utility) {
		this.util = util;
	}
	
	Count(flag: object, files: FileSystemInstance[], map: Map<string, number>, ignoreFile: boolean): Map<string, number> {
		let flags: string[] = this.util.FlattenObject(flag).Keys();
		files.Each((f: FileSystemInstance) => {
			flags.Each((s: string) => {
				let key = this.ModifyFlagKey(s);
				let num: number = ignoreFile ? 0 : f.destinationAbsolutePath.Count(key);
				if (f["content"] != null) {
					let file: IFile = f as IFile;
					num += file.content.Count(key);
				}
				if (map.has(s)) {
					map.set(s, map.get(s)! + num);
				} else {
					map.set(s, num);
				}
			})
		});
		
		return map;
	}
	
	ResolveFiles(flag: object, files: FileSystemInstance[]): FileSystemInstance[] {
		let map: Map<string, string> = this.util.FlattenObject(flag);
		return files.Each((f: FileSystemInstance) => map.MapKey(this.ModifyFlagKey)
			.Each((k: string, v: string) => f.destinationAbsolutePath = f.destinationAbsolutePath.ReplaceAll(k, v)));
		
	}
	
	
	ModifyFlagKey(input: string) {
		return 'var~' + input + '~';
	}
	
	ResolveFileContent(map: Map<string, string>, f: FileSystemInstance): FileSystemInstance {
		map = map.MapKey(this.ModifyFlagKey);
		if (f["content"] != null) {
			let file: IFile = f as IFile;
			map.Each((k: string, v: string) => file.content = file.content.ReplaceAll(k, v));
			return file;
		}
		return f;
	}
	
	
	ResolveContents(flag: object, file: FileSystemInstance[]): FileSystemInstance[] {
		let map = this.util.FlattenObject(flag);
		return file.Map((f: FileSystemInstance) => this.ResolveFileContent(map, f));
	}
	
	CountPossibleUnaccountedFlags(files: FileSystemInstance[]): string[] {
		let variable = /var~[^~]*~/g;
		return files
			.Where(f => f["content"] != null)
			.Map(f =>
				(f as IFile).content
					.LineBreak()
					.Map(s => s.Match(variable).Map(s => `${s}:${f.relativePath}`))
					.Flatten()
			)
			.Flatten().concat(
				files.Map((f: FileSystemInstance) => f.destinationAbsolutePath.Match(variable).Map((s: string) => `${s}:${f.relativePath}`)).Flatten()
			) as string[];
	}
}

export {VariableResolver}