import {FileSystemInstance, IDirectory, IFile} from "../src/classLibrary/File";
import {Core, Kore, SortType} from "@kirinnee/core";
import {should} from 'chai';
import {Utility} from "../src/classLibrary/Utility";
import {InverseIfElseResolver} from "../src/classLibrary/ParsingStrategy/InverseIfElseResolver";

should();
let core: Core = new Kore();
let util: Utility = new Utility(core);
core.ExtendPrimitives();

describe("InverseIfElseResolver", () => {
	
	let flagObject: object = {
		a: {
			b: {
				c: false,
				d: true,
			},
			e: true,
			f: false,
		},
		g: true,
		e: {
			f: false,
			h: true
		}
	};
	let ifElseParser: InverseIfElseResolver = new InverseIfElseResolver(util);
	describe("Count", () => {
		it("should count the number of occurrences of each key in every file and return a map", () => {
			let path1 = "a/a/a/a.a";
			let file1: IFile = {
				sourceAbsolutePath: path1,
				destinationAbsolutePath: path1,
				relativePath: path1,
				content:
					'sample line1 if!~a.b.c~\n' +
					'sample line2\n' +
					'end!~a.b.c~ sample line3\n' +
					'sample line4'
			};
			let path2 = "b/b/b/b.b";
			let file2: IFile = {
				sourceAbsolutePath: path2,
				destinationAbsolutePath: path2,
				relativePath: path2,
				content:
					'sample line1 if!~a.b.d~\n' +
					'sample line2\n' +
					'end!~a.b.d~ sample line3\n' +
					'sample line4\n' +
					'sample line5 if!~a.e~\n' +
					'sample line6\n' +
					'sample line7\n' +
					'end!~a.e~ sample line8\n' +
					'sample line9\n' +
					'sample line10\n' +
					'sample if!~a.f~ line11\n' +
					'sample line12\n' +
					'sample line13\n' +
					'sample line14 end!~a.f~\n' +
					'sample line15 if!~g~\n' +
					'sample line16 if!~e.f~\n' +
					'sample line17\n' +
					'sample line18\n' +
					'sample end!~e.f~ line19\n' +
					'end!~g~ line20\n'
			};
			let path3 = "c/c/c/c.c";
			let file3: IFile = {
				sourceAbsolutePath: path3,
				destinationAbsolutePath: path3,
				relativePath: path3,
				content:
					'sample line1 if!~a.b.c~\n' +
					'sample line2\n' +
					'end!~a.b.c~ sample line3\n' +
					'sample line4\n' +
					'sample line5 if!~a.e~\n' +
					'sample line6\n' +
					'sample line7\n' +
					'end!~a.e~ sample line8\n' +
					'sample line9\n' +
					'sample line10\n' +
					'sample if!~g~ line11\n' +
					'sample line12\n' +
					'sample line13\n' +
					'sample line14 end!~g~\n' +
					'sample line15 if!~e.f~\n' +
					'sample line16 if!~e.h~\n' +
					'sample line17\n' +
					'sample line18\n' +
					'sample end!~e.h~ line19\n' +
					'end!~e.f~ line20\n'
			};
			let dir: IDirectory = {
				sourceAbsolutePath: "b/c/d",
				destinationAbsolutePath: "e/f/g",
				relativePath: "h/i/j"
			};
			let files: FileSystemInstance[] = [file1, dir, file2, file3];
			
			let expected: [string, number][] = ([
				["a.b.c", 2],
				["a.b.d", 1],
				["a.e", 2],
				["a.f", 1],
				["g", 2],
				["e.h", 1],
				["e.f", 2]
			] as [string, number][]).Sort(SortType.AtoZ, e => e[0]);
			
			let actual: [string, number][] = ifElseParser.Count(flagObject, files, new Map([]), true)
				.SortByKey(SortType.AtoZ)
				.Arr();
			
			
			let oldMap: Map<string, number> = new Map([
				["a.b.d", 12],
				["a.f", 3],
				["g", 3]
			]);
			
			let oldActual: [string, number][] = ifElseParser.Count(flagObject, files, oldMap, true)
				.SortByKey(SortType.AtoZ)
				.Arr();
			let oldExpected: [string, number][] = ([
				["a.b.c", 2],
				["a.b.d", 13],
				["a.e", 2],
				["a.f", 4],
				["g", 5],
				["e.h", 1],
				["e.f", 2]
			]as [string, number][]).Sort(SortType.AtoZ, (k: [string, number]) => k["0"]);
			
			actual.should.deep.equal(expected);
			oldActual.should.deep.equal(oldExpected);
			
		});
	});
	
	describe("ModifyIfKeys", () => {
		it("should convert key to if keys", () => {
			let actual = ifElseParser.ModifyIfKeys("a.b.c");
			let expected = "if!~a.b.c~";
			actual.should.deep.equal(expected);
		});
	});
	
	describe("ModifyEndKey", () => {
		it("should convert key to end keys", () => {
			let actual = ifElseParser.ModifyEndKey("a.b.c");
			let expected = "end!~a.b.c~";
			actual.should.deep.equal(expected);
		});
	});
	
	describe("ResolveContents", () => {
		let map: Map<string, boolean> = new Map<string, boolean>([
			["a", true],
			["b", false]
		]);
		it("should remove if else statements if the flag is false", () => {
			
			let testSubj =
				`line1
line2 if!~a~
line3
line4
line5 end!~a~
line6`;
			let expected: FileSystemInstance = {
				content: "line1\nline6",
				destinationAbsolutePath: "a",
				sourceAbsolutePath: "a",
				relativePath: "a"
			} as IFile;
			let actual = ifElseParser.ResolveContent(map, {
				content: testSubj,
				destinationAbsolutePath: "a",
				sourceAbsolutePath: "a",
				relativePath: "a"
			} as IFile);
			actual.should.deep.equal(expected)
		});
		
		it("should remove if else statements if the flag is true", () => {
			
			let testSubj =
				`line1
line2 if!~b~
line3
line4
line5 end!~b~
line6`;
			let expected: FileSystemInstance = {
				content: "line1\nline3\nline4\nline6",
				destinationAbsolutePath: "a",
				sourceAbsolutePath: "a",
				relativePath: "a"
			} as IFile;
			let actual = ifElseParser.ResolveContent(map, {
				content: testSubj,
				destinationAbsolutePath: "a",
				sourceAbsolutePath: "a",
				relativePath: "a"
			} as IFile);
			actual.should.deep.equal(expected)
		});
	});
	
	describe("ResolveFileContent", () => {
		it("should resolve all the flags based on the flag object", () => {
			let path1 = "a/a/a/a.a";
			let file1: IFile = {
				sourceAbsolutePath: path1,
				destinationAbsolutePath: path1,
				relativePath: path1,
				content:
					'sample line1 if!~a.b.c~\n' +
					'sample line2\n' +
					'end!~a.b.c~ sample line3\n' +
					'sample line4'
			};
			let path2 = "b/b/b/b.b";
			let file2: IFile = {
				sourceAbsolutePath: path2,
				destinationAbsolutePath: path2,
				relativePath: path2,
				content:
					'sample line1 if!~a.b.d~\n' +
					'sample line2\n' +
					'end!~a.b.d~ sample line3\n' +
					'sample line4\n' +
					'sample line5 if!~a.e~\n' +
					'sample line6\n' +
					'sample line7\n' +
					'end!~a.e~ sample line8\n' +
					'sample line9\n' +
					'sample line10\n' +
					'sample if!~a.f~ line11\n' +
					'sample line12\n' +
					'sample line13\n' +
					'sample line14 end!~a.f~\n' +
					'sample line15 if!~g~\n' +
					'sample line16 if!~e.f~\n' +
					'sample line17\n' +
					'sample line18\n' +
					'sample end!~e.f~ line19\n' +
					'end!~g~ line20\n'
			};
			let path3 = "c/c/c/c.c";
			let file3: IFile = {
				sourceAbsolutePath: path3,
				destinationAbsolutePath: path3,
				relativePath: path3,
				content:
					'sample line1 if!~a.b.c~\n' +
					'sample line2\n' +
					'end!~a.b.c~ sample line3\n' +
					'sample line4\n' +
					'sample line5 if!~a.e~\n' +
					'sample line6\n' +
					'sample line7\n' +
					'end!~a.e~ sample line8\n' +
					'sample line9\n' +
					'sample line10\n' +
					'sample if!~g~ line11\n' +
					'sample line12\n' +
					'sample line13\n' +
					'sample line14 end!~g~\n' +
					'sample line15 if!~e.f~\n' +
					'sample line16 if!~e.h~\n' +
					'sample line17\n' +
					'sample line18\n' +
					'sample end!~e.h~ line19\n' +
					'end!~e.f~ line20\n'
			};
			let dir: IDirectory = {
				sourceAbsolutePath: "b/c/d",
				destinationAbsolutePath: "e/f/g",
				relativePath: "h/i/j"
			};
			let files: FileSystemInstance[] = [file1, dir, file2, file3];
			
			
			let expectedFile1: IFile = {
				sourceAbsolutePath: path1,
				destinationAbsolutePath: path1,
				relativePath: path1,
				content:
					'sample line2\n' +
					'sample line4'
			};
			let expectedFile2: IFile = {
				sourceAbsolutePath: path2,
				destinationAbsolutePath: path2,
				relativePath: path2,
				content:
					'sample line4\n' +
					'sample line9\n' +
					'sample line10\n' +
					'sample line12\n' +
					'sample line13\n'
			};
			let expectedFile3: IFile = {
				sourceAbsolutePath: path3,
				destinationAbsolutePath: path3,
				relativePath: path3,
				content:
					'sample line2\n' +
					'sample line4\n' +
					'sample line9\n' +
					'sample line10\n'
			};
			let expectedDir: IDirectory = {
				sourceAbsolutePath: "b/c/d",
				destinationAbsolutePath: "e/f/g",
				relativePath: "h/i/j"
			};
			let expectedFiles: FileSystemInstance[] = [expectedFile1, expectedDir, expectedFile2, expectedFile3];
			
			ifElseParser.ResolveContents(flagObject, files).should.deep.equal(expectedFiles);
		});
	});
});


