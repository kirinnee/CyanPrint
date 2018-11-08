import {FileSystemInstance, IDirectory, IFile} from "./File";
import * as path from 'path';
import fs from "graceful-fs";
import {Core} from "@kirinnee/core";
import {CRC32} from "./CRC32";

interface IFileFactory {
	readonly FromRoot: string;
	readonly ToRoot: string;
	
	CreateFileSystemInstance(relativePath: string, from?: string, to?: string): FileSystemInstance;
	
	ReadFile(file: FileSystemInstance, callback?: Function): Promise<FileSystemInstance>;
}

function clone(files: IFile): IFile {
	return {
		relativePath: files.relativePath,
		destinationAbsolutePath: files.destinationAbsolutePath,
		sourceAbsolutePath: files.sourceAbsolutePath,
		content: files.content
	};
}

class SimpleFileFactory implements IFileFactory {
	private static cache: Map<number, IFile> = new Map();
	readonly FromRoot: string;
	readonly ToRoot: string;
	
	constructor(core: Core, FromRoot: string, ToRoot: string) {
		core.AssertExtend();
		this.FromRoot = FromRoot;
		this.ToRoot = ToRoot;
	}
	
	
	CreateFileSystemInstance(relativePath: string, from: string = "./", to: string = './'): FileSystemInstance {
		let absFrom = path.resolve(this.FromRoot, from, relativePath);
		let absTo = path.resolve(this.ToRoot, to, relativePath);
		if (fs.lstatSync(absFrom).isFile()) {
			return {
				relativePath: relativePath,
				sourceAbsolutePath: absFrom,
				destinationAbsolutePath: absTo,
				content: ""
			} as IFile;
		} else {
			return {
				relativePath: relativePath,
				sourceAbsolutePath: absFrom,
				destinationAbsolutePath: absTo
			}as IDirectory;
		}
	}
	
	async ReadFile(file: FileSystemInstance, callback?: Function): Promise<FileSystemInstance> {
		if ((file as any)["content"] != null) {
			let f: IFile = file as IFile;
			let hash: number = CRC32(f);
			if (SimpleFileFactory.cache.has(hash)) {
				return clone(SimpleFileFactory.cache.get(hash)!);
			}
			let ff = this;
			return new Promise<FileSystemInstance>(function (resolve: (f: FileSystemInstance) => void) {
				fs.readFile(f.sourceAbsolutePath, 'utf8', function (err, content: string) {
					if (err) console.log(err);
					ff.TryCallback(callback);
					f.content = content;
					let c: IFile = clone(f);
					SimpleFileFactory.cache.set(hash, c);
					resolve(f);
				})
			});
		} else {
			this.TryCallback(callback);
			return file;
		}
	}
	
	TryCallback(callback?: Function): void {
		if (typeof callback === "function") {
			callback();
		}
	}
	
	CreateFileOrDir(relativePath: string, from: string = './', to: string = './'): FileSystemInstance {
		let absFrom = path.resolve(this.FromRoot, from, relativePath);
		let absTo = path.resolve(this.ToRoot, to, relativePath);
		
		if (fs.lstatSync(absFrom).isFile()) {
			let content = fs.readFileSync(absFrom, 'utf8')
				.ReplaceAll("\r\n", "\n")
				.ReplaceAll("\r", "\n");
			return {
				relativePath: relativePath,
				sourceAbsolutePath: absFrom,
				destinationAbsolutePath: absTo,
				content: content
			} as IFile
		} else {
			return {
				relativePath: relativePath,
				sourceAbsolutePath: absFrom,
				destinationAbsolutePath: absTo
			} as IDirectory
		}
	}
	
	
}

class RootFileFactory implements IFileFactory {
	
	private static cache: Map<number, IFile> = new Map();
	private readonly root: string;
	private readonly from: string;
	private readonly to: string;
	
	constructor(core: Core, root: string, from: string, to: string) {
		if (!core.IsExtended) throw "Core needs to be extended";
		this.root = root;
		this.from = from;
		this.to = to;
	}
	
	get FromRoot(): string {
		return path.resolve(this.root, this.from);
	}
	
	get ToRoot(): string {
		return path.resolve(this.root, this.to);
	}
	
	CreateFileSystemInstance(relativePath: string, from: string = "./", to: string = './'): FileSystemInstance {
		let absFrom = path.resolve(this.FromRoot, from, relativePath);
		let absTo = path.resolve(this.ToRoot, to, relativePath);
		if (fs.lstatSync(absFrom).isFile()) {
			return {
				relativePath: relativePath,
				sourceAbsolutePath: absFrom,
				destinationAbsolutePath: absTo,
				content: ""
			} as IFile;
		} else {
			return {
				relativePath: relativePath,
				sourceAbsolutePath: absFrom,
				destinationAbsolutePath: absTo
			}as IDirectory;
		}
	}
	
	async ReadFile(file: FileSystemInstance, callback?: Function): Promise<FileSystemInstance> {
		if ((file as any)["content"] != null) {
			let f: IFile = file as IFile;
			let hash: number = CRC32(f);
			if (RootFileFactory.cache.has(hash)) {
				return clone(RootFileFactory.cache.get(hash)!);
			}
			let ff = this;
			return new Promise<FileSystemInstance>(function (resolve: (f: FileSystemInstance) => void) {
				fs.readFile(f.sourceAbsolutePath, 'utf8', function (err, content: string) {
					if (err) console.log(err);
					ff.TryCallback(callback);
					f.content = content;
					let cache = clone(f);
					RootFileFactory.cache.set(hash, cache);
					resolve(f);
				})
			});
		} else {
			this.TryCallback(callback);
			return file;
		}
	}
	
	TryCallback(callback?: Function): void {
		if (typeof callback === "function") {
			callback();
		}
	}
}

export {RootFileFactory, IFileFactory, SimpleFileFactory};