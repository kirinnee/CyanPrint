import {MapType, ParsingStrategy} from "./ParsingStrategy";
import {FileSystemInstance, IFile} from "../File";
import {Utility} from "../Utility";
import * as path from "path";

class MoveResolver implements ParsingStrategy {
	MapType: MapType = MapType.FLAG;
	Target: string = "flags";
	
	private readonly util: Utility;
	
	constructor(util: Utility) {
		this.util = util;
	}
	
	Count(flag: object, files: FileSystemInstance[], data: Map<string, number>, ignoreFile: boolean): Map<string, number> {
		if (!ignoreFile) return data;
		if (flag["move"] != null) {
			let map = this.util.FlattenFlagObject(flag["move"]!);
			files.Each((f: FileSystemInstance) => {
				if (f["content"] != null) {
					let file: IFile = f as IFile;
					if (this.IsPackageDotJson(file)) {
						let jsonObject: object = JSON.parse(file.content);
						map.Each((k: string) => {
							if (jsonObject["devDependencies"] != null) {
								if (jsonObject["devDependencies"][k] != null) {
									if (data.has("move." + k)) {
										data.set("move." + k, data.get("move." + k)! + 1);
									} else {
										data.set("move." + k, 1);
									}
								}
							}
							if (jsonObject["dependencies"] != null) {
								if (jsonObject["dependencies"][k] != null) {
									if (data.has("move." + k)) {
										data.set("move." + k, data.get("move." + k)! + 1);
									} else {
										data.set("move." + k, 1);
									}
								}
							}
						})
					}
				}
			});
		}
		return data;
	}
	
	ResolveContents(flag: object, files: FileSystemInstance[]): FileSystemInstance[] {
		if (flag["move"] != null) {
			let map = this.util.FlattenFlagObject(flag["move"]!);
			return files.Map((f: FileSystemInstance) => this.ResolveJsonFile(map, f));
		}
		return files;
	}
	
	ResolveFiles(wFlag: any, files: FileSystemInstance[]): FileSystemInstance[] {
		return files;
	}
	
	ResolveJsonFile(map: Map<string, boolean>, f: FileSystemInstance): FileSystemInstance {
		if (f["content"] == null) return f;
		let file: IFile = f as IFile;
		if (!this.IsPackageDotJson(file)) return file;
		
		let jsonObject: object = JSON.parse(file.content);
		
		map.Where((k: string, v: boolean) => v)
			.Keys()
			.Each((k: string) => {
				if (jsonObject["devDependencies"] != null && jsonObject["devDependencies"][k] != null) {
					if (jsonObject["dependencies"] == null) jsonObject["dependencies"] = {};
					jsonObject["dependencies"][k] = jsonObject["devDependencies"][k];
					delete jsonObject["devDependencies"][k];
				} else if (jsonObject["dependencies"] != null && jsonObject["dependencies"][k] != null) {
					if (jsonObject["devDependencies"] == null) jsonObject["devDependencies"] = {};
					jsonObject["devDependencies"][k] = jsonObject["dependencies"][k];
					delete jsonObject["dependencies"][k];
				}
			});
		file.content = JSON.stringify(jsonObject, null, 2);
		return file;
	}
	
	IsPackageDotJson(file: IFile): boolean {
		return file.destinationAbsolutePath.FileName() === "package" && path.extname(file.destinationAbsolutePath) === ".json";
	}
	
	CountPossibleUnaccountedFlags(files: FileSystemInstance[]): string[] {
		return [];
	}
}

export {MoveResolver};