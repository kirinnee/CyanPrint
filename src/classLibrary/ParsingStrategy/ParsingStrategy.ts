import {FileSystemInstance} from "../File";

interface ParsingStrategy {
	Target: string;
	MapType: MapType;
	
	ResolveContents(target: any, files: FileSystemInstance[]): FileSystemInstance[];
	
	Count(target: any, files: FileSystemInstance[], data: Map<string, number>, ignoreFile: boolean): Map<string, number>;
	
	ResolveFiles(wFlag: any, files: FileSystemInstance[]): FileSystemInstance[];
	
	CountPossibleUnaccountedFlags(files: FileSystemInstance[]): string[];
}

enum MapType {
	FLAG,
	VARIABLE,
	GUID
}

export {ParsingStrategy, MapType};