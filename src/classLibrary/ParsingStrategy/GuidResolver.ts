import {FileSystemInstance, IFile} from "../File";
import {MapType, ParsingStrategy} from "./ParsingStrategy";
import {Core} from "@kirinnee/core";
import {IGuidGenerator} from "../GuidGenerator";

class GuidResolver implements ParsingStrategy {

    guidGenerator: IGuidGenerator;

    constructor(core: Core, guidGen) {
        core.AssertExtend();
        this.guidGenerator = guidGen;
    }

    get MapType(): MapType {
        return MapType.GUID;
    }

    get Target(): string {
        return "guid";
    }



    ReplaceGuid(guidArr: Map<string, string>, f: FileSystemInstance): FileSystemInstance {
        let upper: Map<string, string> = guidArr.MapKey((s: string) => s.toUpperCase());
        let lower: Map<string, string> = guidArr.MapKey((s: String) => s.toLowerCase());
        if (f["content"] != null && !f["binary"]) {
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
            if (f["content"] != null && !f["binary"]) {
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


    ResolveContents(guidArr: string[], files: FileSystemInstance[]): FileSystemInstance[] {
        let map: Map<string, string> = guidArr.AsKey(() => this.guidGenerator.GenerateGuid());
        return files.Each((f: FileSystemInstance) => {
            if (f["content"] != null && !f["binary"]) {
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