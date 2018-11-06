import {Utility} from "../Utility";
import {FileSystemInstance, IFile} from "../File";
import {MapType, ParsingStrategy} from "./ParsingStrategy";

class IfElseResolver implements ParsingStrategy {
	
	
	MapType: MapType = MapType.FLAG;
	Target: string = "flags";
	private util: Utility;
	
	constructor(util: Utility) {
		this.util = util;
	}
	
	Count(wFlag: object, files: FileSystemInstance[], map: Map<string, number>, ignoreFile: boolean): Map<string, number> {
		if (!ignoreFile) return map;
		let real: Map<string, boolean> = this.util.FlattenFlagObject(wFlag);
		
		files.Where((f: FileSystemInstance) => f["content"] != null)
			.Map((f: FileSystemInstance) => f as IFile)
			.Map((f: IFile) => f.content)
			.Each((s: string) => {
				real.Each((k: string) => {
					let number: number = s
						.Count(this.ModifyIfKeys(k))
						.AtMax(s.Count(this.ModifyEndKey(k)));
					if (map.has(k)) {
						map.set(k, map.get(k)! + number);
					} else {
						map.set(k, number);
					}
				})
			});
		return map;
	}
	
	ModifyIfKeys(input: string): string {
		return 'if~' + input + '~';
	}
	
	ModifyEndKey(input: string): string {
		return 'end~' + input + '~';
	}
	
	ResolveContent(map: Map<string, boolean>, file: FileSystemInstance): FileSystemInstance {
		if (file["content"] != null) {
			let f: IFile = file as IFile;
			let content = f.content;
			map.Each((k: string, v: boolean) => {
					let startIndex: number[] = content
						.LineBreak()
						.Map((s: string, i: number) => [s, i] as [string, number])
						.Where((n: [string, number]) => n[0].includes(this.ModifyIfKeys(k)))
						.Map((n: [string, number]) => n[1]);
					let endIndex: number[] = content
						.LineBreak()
						.Map((s: string, i: number) => [s, i] as [string, number])
						.Where((n: [string, number]) => n[0].includes(this.ModifyEndKey(k)))
						.Map(((n: [string, number]) => n[1]));
					if (v) {
						content = content.LineBreak().WithoutIndex(startIndex.concat(endIndex)).join('\n');
					} else {
						content =
							content.LineBreak().WithoutIndex(
								startIndex.Map((n: number, index: number) =>
									[].Fill(endIndex[index] - n + 1, (i: number) => i + n)
								).Flatten()
							).join('\n');
					}
					
					
				}
			);
			f.content = content;
			return f;
		}
		return file;
		
	}
	
	ResolveContents(wFlag: object, files: FileSystemInstance[]): FileSystemInstance[] {
		let map = this.util.FlattenFlagObject(wFlag);
		return files.Map((f: FileSystemInstance) => this.ResolveContent(map, f));
	}
	
	ResolveFiles(wFlag: any, files: FileSystemInstance[]): FileSystemInstance[] {
		return files;
	}
	
	CountPossibleUnaccountedFlags(files: FileSystemInstance[]): string[] {
		let ifRegex = /if~[^~]*~/g;
		let endRegex = /end~[^~]*~/g;
		return files
			.Where(f => f["content"] != null)
			.Map(f =>
				(f as IFile).content
					.LineBreak()
					.Map(s => s.Match(ifRegex).concat(s.Match(endRegex)))
					.Flatten()
					.Map(s => `${s}:${f.relativePath}`)
			)
			.Flatten();
	}
	
}

export {IfElseResolver}