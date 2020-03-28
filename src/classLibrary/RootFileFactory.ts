import {FileSystemInstance, IDirectory, IFile} from "./File";
import * as path from 'path';
import fs from "graceful-fs";
import {Core} from "@kirinnee/core";
import {CRC32} from "./CRC32";
import {isBinaryFile} from "isbinaryfile";

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
        content: files.content,
        binary: files.binary,
        buffer: files.buffer,
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
                content: "",
                binary: false,
                buffer: Buffer.from(''),
            } as IFile;
        } else {
            return {
                relativePath: relativePath,
                sourceAbsolutePath: absFrom,
                destinationAbsolutePath: absTo
            } as IDirectory;
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
            return new Promise<FileSystemInstance>(async function (resolve: (f: FileSystemInstance) => void) {
                const isBinary = await isBinaryFile(f.sourceAbsolutePath);
                if (isBinary) {
                    fs.readFile(f.sourceAbsolutePath, function (err, content: Buffer) {
                        if (err) console.log(err);
                        ff.TryCallback(callback);
                        f.buffer = content;
                        f.binary = true;
                        let c: IFile = clone(f);
                        SimpleFileFactory.cache.set(hash, c);
                        resolve(f);
                    });
                } else {
                    fs.readFile(f.sourceAbsolutePath, 'utf8', function (err, content: string) {
                        if (err) console.log(err);
                        ff.TryCallback(callback);
                        f.content = content;
                        f.binary = false;
                        let c: IFile = clone(f);
                        SimpleFileFactory.cache.set(hash, c);
                        resolve(f);
                    });
                }

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
                content: "",
                binary: false,
                buffer: Buffer.from(''),
            } as IFile;
        } else {
            return {
                relativePath: relativePath,
                sourceAbsolutePath: absFrom,
                destinationAbsolutePath: absTo
            } as IDirectory;
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
            return new Promise<FileSystemInstance>(async function (resolve: (f: FileSystemInstance) => void) {
                const isBinary = await isBinaryFile(f.sourceAbsolutePath);
                if (isBinary) {
                    fs.readFile(f.sourceAbsolutePath, function (err, content: Buffer) {
                        if (err) console.log(err);
                        ff.TryCallback(callback);
                        f.binary = true;
                        f.buffer = content;
                        let cache = clone(f);
                        RootFileFactory.cache.set(hash, cache);
                        resolve(f);
                    })
                } else {
                    fs.readFile(f.sourceAbsolutePath, 'utf8', function (err, content: string) {
                        if (err) console.log(err);
                        ff.TryCallback(callback);
                        f.binary = false;
                        f.content = content;
                        let cache = clone(f);
                        RootFileFactory.cache.set(hash, cache);
                        resolve(f);
                    })
                }

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