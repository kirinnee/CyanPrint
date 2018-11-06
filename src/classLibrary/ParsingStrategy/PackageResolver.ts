import {Utility} from "../Utility";
import {FileSystemInstance, IFile} from "../File";
import {MapType, ParsingStrategy} from "./ParsingStrategy";
import * as path from "path";

class PackageResolver implements ParsingStrategy {
	
	MapType: MapType = MapType.FLAG;
	Target: string = "flags";
	private util: Utility;
	
	constructor(util: Utility) {
		this.util = util;
	}
	
	Count(flag: object, files: FileSystemInstance[], data: Map<string, number>, ignoreFile: boolean): Map<string, number> {
		if (!ignoreFile) return data;
		if (flag["packages"] != null) {
			let map = this.util.FlattenFlagObject(flag["packages"]!);
			files.Each((f: FileSystemInstance) => {
				if (f["content"] != null) {
					let file: IFile = f as IFile;
					//console.log("is package?",this.IsPackageDotJson(file), file.sourceAbsolutePath);
					if (this.IsPackageDotJson(file)) {
						let jsonObject: object = JSON.parse(file.content);
						map.Each((k: string) => {
							if (jsonObject["devDependencies"] != null) {
								if (jsonObject["devDependencies"][k] != null) {
									if (data.has("packages." + k)) {
										data.set("packages." + k, data.get("packages." + k)! + 1);
									} else {
										data.set("packages." + k, 1);
									}
								}
							}
							if (jsonObject["dependencies"] != null) {
								if (jsonObject["dependencies"][k] != null) {
									if (data.has("packages." + k)) {
										data.set("packages." + k, data.get("packages." + k)! + 1);
									} else {
										data.set("packages." + k, 1);
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
	
	ResolveJsonFile(map: Map<string, boolean>, f: FileSystemInstance): FileSystemInstance {
		if (f["content"] != null) {
			let file: IFile = f as IFile;
			if (this.IsPackageDotJson(file)) {
				let jsonObject: object = JSON.parse(file.content);
				
				map.Each((k: string, v: boolean) => {
					if (jsonObject["devDependencies"] != null) {
						if (jsonObject["devDependencies"][k] != null && !v) {
							delete jsonObject["devDependencies"][k];
						}
					}
					if (jsonObject["dependencies"] != null) {
						if (jsonObject["dependencies"][k] != null && !v) {
							delete jsonObject["dependencies"][k];
						}
					}
				});
				file.content = JSON.stringify(jsonObject, null, 2);
				return file;
			}
			return file;
		}
		return f;
	}
	
	IsPackageDotJson(file: IFile): boolean {
		return file.destinationAbsolutePath.FileName() === "package" && path.extname(file.destinationAbsolutePath) === ".json";
	}
	
	ResolveContents(flag: object, files: FileSystemInstance[]): FileSystemInstance[] {
		if (flag["packages"] != null) {
			let map = this.util.FlattenFlagObject(flag["packages"]!);
			return files.Map((f: FileSystemInstance) => this.ResolveJsonFile(map, f));
		}
		return files;
	}
	
	ResolveFiles(wFlag: any, files: FileSystemInstance[]): FileSystemInstance[] {
		return files;
	}
	
	CountPossibleUnaccountedFlags(files: FileSystemInstance[]): string[] {
		return [];
	}
}

export {PackageResolver}