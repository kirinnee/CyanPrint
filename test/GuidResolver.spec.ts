import {GuidResolver} from "../src/classLibrary/ParsingStrategy/GuidResolver";
import {FileSystemInstance, IDirectory, IFile} from "../src/classLibrary/File";
import {Core, Kore, SortType} from "@kirinnee/core";
import {should} from 'chai';
import {IGuidGenerator} from "../src/classLibrary/GuidGenerator";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

class FakeGuidGenerator implements IGuidGenerator {

    GenerateGuid(): string {
        return "this-is-a-guid";
    }

}

describe("GuidResolver", () => {

    let guidParser = new GuidResolver(core, new FakeGuidGenerator());

    describe("Count", () => {
        it("should count the occurrence of each Guid", () => {
            let file1: IFile = {
                sourceAbsolutePath: "root/from",
                destinationAbsolutePath: "root/dest",
                relativePath: "root/rel",
                content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                    "lol\n" +
                    "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n" +
                    "4093f5bc-bb3d-4de7-b1d2-7220e66a0675",
                binary: false,
                buffer: Buffer.from(''),
            };
            let file2: IFile = {
                sourceAbsolutePath: "root/from",
                destinationAbsolutePath: "root/dest",
                relativePath: "root/rel",
                content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                    "lol\n" +
                    "bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1\n" +
                    "4093f5bc-bb3d-4de7-b1d2-7220e66a0675",
                binary: false,
                buffer: Buffer.from(''),
            };
            let dir: IDirectory = {
                sourceAbsolutePath: "nothing",
                destinationAbsolutePath: "nothing",
                relativePath: "relative"
            };

            let guidArr: string[] = ["6de0a74e-70a9-4cfc-be14-04789ecd44fa", "bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1"];
            let testArr: FileSystemInstance[] = [file1, dir, file2];

            let expected: [string, number][] = new Map([
                ["6de0a74e-70a9-4cfc-be14-04789ecd44fa", 2],
                ["bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1", 2]
            ])
                .SortByKey(SortType.AtoZ)
                .Arr();

            let oldMap: Map<string, number> = new Map([
                ["6de0a74e-70a9-4cfc-be14-04789ecd44fa", 2]
            ]);
            let oldExpected: [string, number][] = new Map([
                ["6de0a74e-70a9-4cfc-be14-04789ecd44fa", 4],
                ["bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1", 2]
            ])
                .SortByKey(SortType.AtoZ)
                .Arr();

            //test normal
            let actual = guidParser.Count(guidArr, testArr, new Map([]), true).SortByKey(SortType.AtoZ).Arr();
            let oldActual = guidParser.Count(guidArr, testArr, oldMap, true).SortByKey(SortType.AtoZ).Arr();

            actual.should.deep.equal(expected);
            oldActual.should.deep.equal(oldExpected);
        });
    });


    describe("CountPossibleUnaccountedFlags", () => {
        it("should return empty array", () => {
            const file1: IFile = {
                sourceAbsolutePath: "root/from",
                destinationAbsolutePath: "root/dest",
                relativePath: "root/rel",
                content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa",
                binary: false,
                buffer: Buffer.from(''),
            };
            const file2: IFile = {
                sourceAbsolutePath: "root/from2",
                destinationAbsolutePath: "root/dest2",
                relativePath: "root/rel",
                content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa",
                binary: false,
                buffer: Buffer.from(''),
            };
            guidParser.CountPossibleUnaccountedFlags([]).should.deep.equal([]);
            guidParser.CountPossibleUnaccountedFlags([file1, file2]).should.deep.equal([]);
        });
    });

    describe("ResolveFile", () => {
        it("should do nothing to the file instances", () => {
            const file1: IFile = {
                sourceAbsolutePath: "root/from",
                destinationAbsolutePath: "root/dest",
                relativePath: "root/rel",
                content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa",
                binary: false,
                buffer: Buffer.from(''),
            };
            const file2: IFile = {
                sourceAbsolutePath: "root/from2",
                destinationAbsolutePath: "root/dest2",
                relativePath: "root/rel",
                content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa",
                binary: false,
                buffer: Buffer.from(''),
            };


            const afile1: IFile = {
                sourceAbsolutePath: "root/from",
                destinationAbsolutePath: "root/dest",
                relativePath: "root/rel",
                content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa",
                binary: false,
                buffer: Buffer.from(''),
            };
            const afile2: IFile = {
                sourceAbsolutePath: "root/from2",
                destinationAbsolutePath: "root/dest2",
                relativePath: "root/rel",
                content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa",
                binary: false,
                buffer: Buffer.from(''),
            };

            const subject = [afile1, afile2];
            const expected = [file1, file2];
            const actual = guidParser.ResolveFiles({}, subject);
            actual.should.deep.equal(expected);
        });
    });

    describe("ResolveContents", () => {
        let file1: IFile = {
            sourceAbsolutePath: "root/from",
            destinationAbsolutePath: "root/dest",
            relativePath: "root/rel",
            content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                "lol\n" +
                "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n",
            binary: false,
            buffer: Buffer.from(''),
        };

        let file2: IFile = {
            sourceAbsolutePath: "root/from2",
            destinationAbsolutePath: "root/dest2",
            relativePath: "root/rel",
            content:
                "lol\n" +
                "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n" +
                "4093f5bc-bb3d-4de7-b1d2-7220e66a0675",
            binary: false,
            buffer: Buffer.from(''),
        };
        const arrSubj = ['6de0a74e-70a9-4cfc-be14-04789ecd44fa', '4093f5bc-bb3d-4de7-b1d2-7220e66a0675'];
        const subj = [file1, file2];

        let eFile1: IFile = {
            sourceAbsolutePath: "root/from",
            destinationAbsolutePath: "root/dest",
            relativePath: "root/rel",
            content: "this-is-a-guid\n" +
                "lol\n" +
                "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n",
            binary: false,
            buffer: Buffer.from(''),
        };

        let eFile2: IFile = {
            sourceAbsolutePath: "root/from2",
            destinationAbsolutePath: "root/dest2",
            relativePath: "root/rel",
            content:
                "lol\n" +
                "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n" +
                "this-is-a-guid",
            binary: false,
            buffer: Buffer.from(''),
        };

        const expected = [eFile1, eFile2];
        const actual = guidParser.ResolveContents(arrSubj,subj);
        expected.should.deep.equal(actual);

    });


    describe("ReplaceGuid", () => {
        it("should replace both upper and lower case occurence of the guid", () => {
            let file1: IFile = {
                sourceAbsolutePath: "root/from",
                destinationAbsolutePath: "root/dest",
                relativePath: "root/rel",
                content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
                    "lol\n" +
                    "BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n" +
                    "4093f5bc-bb3d-4de7-b1d2-7220e66a0675",
                binary: false,
                buffer: Buffer.from(''),
            };

            let guidArr: Map<string, string> = new Map([
                ["6de0a74e-70a9-4cfc-be14-04789ecd44fa", "guid1"],
                ["bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1", "guid2"]
            ]);

            let expected: IFile = {
                sourceAbsolutePath: "root/from",
                destinationAbsolutePath: "root/dest",
                relativePath: "root/rel",
                content: "guid1\n" +
                    "lol\n" +
                    "guid2\n" +
                    "4093f5bc-bb3d-4de7-b1d2-7220e66a0675",
                binary: false,
                buffer: Buffer.from(''),
            };

            let actual = guidParser.ReplaceGuid(guidArr, file1);
            actual.should.deep.equal(expected);
        });
    });
});

