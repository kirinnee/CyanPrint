import path from 'path';
import glob from 'glob';
import {Utility} from "./Utility";
import {IFileFactory} from "./RootFileFactory";
import {FileSystemInstance} from "./File";
import {Bar, Presets} from "cli-progress";
import {Core} from "@kirinnee/core";
import {CRC32} from "./CRC32";

export class GlobFactory {
	
	private static cache: Map<number, string[]> = new Map();
	readonly c: Core;
	private util: Utility;
	private fileFactory: IFileFactory;
	
	constructor(util: Utility, fileFactory: IFileFactory) {
		let core = util.c;
		if (!core.IsExtended) throw "Core needs to be extended";
		this.util = util;
		this.c = this.util.c;
		this.fileFactory = fileFactory;
	}
	
	GenerateFiles(root: string, pattern: string, ignore?: string | string[], target: string = './'): FileSystemInstance[] {
		
		
		let paths = path.resolve(this.fileFactory.FromRoot, root, pattern);
		let relPath = path.resolve(this.fileFactory.FromRoot, root);
		let opts: object = {dot: true};
		if (ignore != null) {
			opts["ignore"] = ignore;
		}
		let hash = CRC32([paths, relPath]);
		let files: string[] = [];
		if (GlobFactory.cache.has(hash)) {
			files = GlobFactory.cache.get(hash)!;
		} else {
			files = glob.sync(paths, opts).Map((s: string) => path.relative(relPath, s));
			GlobFactory.cache.set(hash, files);
		}
		return files.Map(s => this.fileFactory.CreateFileSystemInstance(s, root, target));
	}
	
	async ReadFiles(files: FileSystemInstance[]): Promise<FileSystemInstance[]> {
		
		let readBar: Bar = new Bar({}, Presets.shades_classic);
		let readCounter: number = 0;
		readBar.start(files.length, readCounter);
		
		let promises: Promise<FileSystemInstance>[] = [];
		
		files.Each((f: FileSystemInstance) => promises.push(this.fileFactory.ReadFile(f, function () {
			readCounter++;
			readBar.update(readCounter);
			if (readCounter >= readBar.getTotal()) {
				readBar.stop();
			}
		})));
		return await Promise.all(promises);
	}
	
	
}