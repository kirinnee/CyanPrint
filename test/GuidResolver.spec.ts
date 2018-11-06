import {GuidResolver} from "../src/classLibrary/ParsingStrategy/GuidResolver";
import {FileSystemInstance, IDirectory, IFile} from "../src/classLibrary/File";
import {Core, Kore, SortType} from "@kirinnee/core";
import {should} from 'chai';

should();
let core: Core = new Kore();
core.ExtendPrimitives();

describe("GuidResolver", () => {
	
	let guidParser = new GuidResolver(core);
	
	describe("GenerateGuid", () => {
		it("should generate new guid", () => {
			let testSubject = guidParser.GenerateGuid();
			guidParser.IsGuid(testSubject).should.be.true;
		});
	});
	
	describe("Count", () => {
		it("should count the occurrence of each Guid", () => {
			let file1: IFile = {
				sourceAbsolutePath: "root/from",
				destinationAbsolutePath: "root/dest",
				relativePath: "root/rel",
				content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
					"lol\n" +
					"BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n" +
					"4093f5bc-bb3d-4de7-b1d2-7220e66a0675"
			};
			let file2: IFile = {
				sourceAbsolutePath: "root/from",
				destinationAbsolutePath: "root/dest",
				relativePath: "root/rel",
				content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
					"lol\n" +
					"bc6b7b1a-6e23-4cd4-a6e7-4291f8238dd1\n" +
					"4093f5bc-bb3d-4de7-b1d2-7220e66a0675"
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
	
	describe("ReplaceGuid", () => {
		it("should replace both upper and lower case occurence of the guid", () => {
			let file1: IFile = {
				sourceAbsolutePath: "root/from",
				destinationAbsolutePath: "root/dest",
				relativePath: "root/rel",
				content: "6de0a74e-70a9-4cfc-be14-04789ecd44fa\n" +
					"lol\n" +
					"BC6B7B1A-6E23-4CD4-A6E7-4291F8238DD1\n" +
					"4093f5bc-bb3d-4de7-b1d2-7220e66a0675"
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
					"4093f5bc-bb3d-4de7-b1d2-7220e66a0675"
			};
			
			let actual = guidParser.ReplaceGuid(guidArr, file1);
			actual.should.deep.equal(expected);
		});
	});
});

