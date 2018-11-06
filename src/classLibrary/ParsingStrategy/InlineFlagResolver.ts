import {Utility} from '../Utility';
import {FileSystemInstance, IFile} from "../File";
import {MapType, ParsingStrategy} from "./ParsingStrategy";
import {SortType} from "@kirinnee/core";

export class InlineFlagResolver implements ParsingStrategy {
	
	
	private util: Utility;
	private readonly comments: string[];
	
	constructor(util: Utility, comments: string[] = []) {
		this.util = util;
		this.comments = [""].concat(comments).Sort(SortType.Descending, (s: string) => s.length);
	}
	
	
	get MapType(): number {
		return MapType.FLAG;
	}
	
	get Target(): string {
		return "flags";
	}
	
	/**
	 * The flag object to make decisions
	 * @param wFlag flag object
	 * @param files file streams`
	 * @constructor
	 */
	ResolveFiles(wFlag: object, files: FileSystemInstance[]): FileSystemInstance[] {
		//Changes it to search term after flattening the configuration file
		let map: Map<string, boolean> = this.util.FlattenFlagObject(wFlag).MapKey(this.ModifyFlagKeys);
		
		return files
			.Where((f: FileSystemInstance) => this.ShouldStay(map, f.relativePath))
			.Map((f: FileSystemInstance) => this.RemoveFlagSignature(map, f));
	}
	
	ResolveContents(wFlag: object, files: FileSystemInstance[]): FileSystemInstance[] {
		let map: Map<string, boolean> = this.util.FlattenFlagObject(wFlag).MapKey(this.ModifyFlagKeys);
		return files.Map((f: FileSystemInstance) => this.ResolveFileContent(map, f));
		
	}
	
	ModifyFlagKeys(input: string): string {
		return 'flag~' + input + '~';
	}
	
	/**
	 * Check if target file should stay base on flag map
	 * @param map flag map
	 * @param checkTarget file path
	 * @constructor
	 */
	ShouldStay(map: Map<string, boolean>, checkTarget: string) {
		return map.Where((k: string, v: boolean) => !checkTarget.includes(k) || v).size === map.size;
	}
	
	// noinspection JSMethodCanBeStatic
	/**
	 * Removes the injected code signature from files and directories
	 * @param map key value pair of what to remove
	 * @param f the file to remove from
	 * @constructor
	 */
	RemoveFlagSignature(map: Map<string, boolean>, f: FileSystemInstance): FileSystemInstance {
		f.destinationAbsolutePath = f.destinationAbsolutePath.Without(map.Arr().Map((s: [string, boolean]) => s["0"]));
		return f;
	};
	
	ResolveFileContent(map: Map<string, boolean>, f: FileSystemInstance): FileSystemInstance {
		if (f['content'] != null) {
			let file: IFile = f as IFile;
			file.content = file.content
				.LineBreak()
				.Where((s: string) => this.ShouldStay(map, s))
				.Map((s: string) => s.Without(this.RemoveArray(map)))
				.join("\n");
			return file;
		}
		return f;
	}
	
	Count(wFlag: object, files: FileSystemInstance[], map: Map<string, number>, ignoreFile: boolean): Map<string, number> {
		// noinspection JSMismatchedCollectionQueryUpdate
		// noinspection JSMismatchedCollectionQueryUpdate
		// noinspection JSMismatchedCollectionQueryUpdate
		let keys: string[] = this.util.FlattenFlagObject(wFlag).MapKey((s: string) => this.ModifyFlagKeys(s)).Keys();
		files.Each((f: FileSystemInstance) => {
			keys.Each((s: string) => {
				let num = ignoreFile ? 0 : f.sourceAbsolutePath.Count(s);
				let key = s.Omit(1).Skip(5);
				
				if (f["content"] != null) {
					let file: IFile = f as IFile;
					num += file.content.Count(s);
				}
				if (!map.has(key)) {
					map.set(key, num);
				} else {
					map.set(key, map.get(key)! + num);
				}
			});
		});
		return map;
	}
	
	CountPossibleUnaccountedFlags(files: FileSystemInstance[]): string[] {
		let flag = /flag~[^~]*~/g;
		return files
			.Where(f => f["content"] != null)
			.Map(f =>
				(f as IFile).content.LineBreak()
					.Map(s => s.Match(flag))
					.Flatten()
					.Map(s => `${s}:${f.relativePath}`)
			)
			.Flatten()
			.concat(
				files.Map((f: FileSystemInstance) => f.destinationAbsolutePath.Match(flag).Map((s: string) => `${s}:${f.relativePath}`)).Flatten()
			) as string[];
	}
	
	private RemoveArray(map: Map<string, boolean>): string[] {
		return this.comments
			.Map((c: string) =>
				map.Keys().Map((k: string) => c + k)
			)
			.Flatten();
	}
}