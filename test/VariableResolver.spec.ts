import {VariableResolver} from "../src/classLibrary/ParsingStrategy/VariableResolver";
import {Utility} from "../src/classLibrary/Utility";
import {IDirectory, IFile} from "../src/classLibrary/File";
import {Core, Kore, SortType} from "@kirinnee/core";
import {should} from 'chai';

should();
let core: Core = new Kore();
let utility: Utility = new Utility(core);
core.ExtendPrimitives();

let variableParser: VariableResolver = new VariableResolver(utility);
let flag: object = {
	a: "Roses",
	b: {
		c: "Violets",
		d: {
			e: "please",
			f: "Apples"
		}
	},
	g: "Oreos"
};

describe("intentionally fail test", () => {
    it("should fail", () => {
        (1).should.equal(2);
    });
});

describe("VariableResolver", () => {
	describe("Count", () => {
		it("should count the number of occurrences of each variable", () => {
			let path1: string = "root/var~a~/a.a";
			let file1: IFile = {
				sourceAbsolutePath: path1,
				destinationAbsolutePath: path1,
				relativePath: path1,
				content: "line1\nvar~b.c~ are red\nvar~b.c~ are blue"
			};
			let path2: string = "root/var~b.c~/var~g~";
			let file2: IFile = {
				sourceAbsolutePath: path2,
				destinationAbsolutePath: path2,
				relativePath: path2,
				content: "line2\nvar~b.d.e~ help me!\nvar~b.c~ are blue\nvar~g~ are black!!"
			};
			let path3: string = "root/var~b.d.e~/var~g~";
			let file3: IFile = {
				sourceAbsolutePath: path3,
				destinationAbsolutePath: path3,
				relativePath: path3,
				content: "line2\nvar~b.d.f~ are red\nvar~b.c~ are blue\nvar~g~ are black!!"
			};
			let path4: string = "root/var~a~";
			let dir1: IDirectory = {
				sourceAbsolutePath: path4,
				destinationAbsolutePath: path4,
				relativePath: path4
			};
			let dir2: IDirectory = {
				sourceAbsolutePath: "root",
				destinationAbsolutePath: "root",
				relativePath: "root"
			};
			let testSubject = [dir1, file1, file2, dir2, file3];
			
			let expected: [string, number][] = ([
				["a", 2],
				["b.c", 5],
				["b.d.e", 2],
				["b.d.f", 1],
				["g", 4]
			] as [string, number][]).Sort(SortType.AtoZ, (t: [string, number]) => t[0]);
			
			let oldMap: Map<string, number> = new Map([
				["b.c", 3],
				["b.d.e", 6],
				["g", 5]
			]);
			
			let oldExpected: [string, number][] = new Map<string, number>([
				["a", 2],
				["b.c", 8],
				["b.d.e", 8],
				["b.d.f", 1],
				["g", 9]
			]).SortByKey(SortType.AtoZ).Arr();
			
			let oldActual: [string, number][] = variableParser.Count(flag, testSubject, oldMap, false)
				.SortByKey(SortType.AtoZ)
				.Arr();
			
			let actual: [string, number][] = variableParser.Count(flag, testSubject, new Map([]), false)
				.SortByKey(SortType.AtoZ)
				.Arr();
			
			actual.should.deep.equal(expected);
			oldActual.should.deep.equal(oldExpected);
		});
	});
	
	describe("ResolveContents", () => {
		it("should rename the file destination to the correct name", () => {
			let path1: string = "root/var~a~/a.a";
			let file1: IFile = {
				sourceAbsolutePath: path1,
				destinationAbsolutePath: path1,
				relativePath: path1,
				content: "line1\nvar~b.c~ are red\nvar~b.c~ are blue"
			};
			let path2: string = "root/var~b.c~/var~g~";
			let file2: IFile = {
				sourceAbsolutePath: path2,
				destinationAbsolutePath: path2,
				relativePath: path2,
				content: "line2\nvar~b.d.e~ help me!\nvar~b.c~ are blue\nvar~g~ are black!!"
			};
			let path3: string = "root/var~b.d.e~/var~g~";
			let file3: IFile = {
				sourceAbsolutePath: path3,
				destinationAbsolutePath: path3,
				relativePath: path3,
				content: "line2\nvar~b.d.f~ are red\nvar~b.c~ are blue\nvar~g~ are black!!"
			};
			let path4: string = "root/var~a~";
			let dir1: IDirectory = {
				sourceAbsolutePath: path4,
				destinationAbsolutePath: path4,
				relativePath: path4
			};
			let dir2: IDirectory = {
				sourceAbsolutePath: "root",
				destinationAbsolutePath: "root",
				relativePath: "root"
			};
			let testSubject = [dir1, file1, file2, dir2, file3];
			
			let file1Expected: IFile = {
				sourceAbsolutePath: "root/var~a~/a.a",
				destinationAbsolutePath: "root/Roses/a.a",
				relativePath: "root/var~a~/a.a",
				content: "line1\nvar~b.c~ are red\nvar~b.c~ are blue"
			};
			let file2Expected: IFile = {
				sourceAbsolutePath: "root/var~b.c~/var~g~",
				destinationAbsolutePath: "root/Violets/Oreos",
				relativePath: "root/var~b.c~/var~g~",
				content: "line2\nvar~b.d.e~ help me!\nvar~b.c~ are blue\nvar~g~ are black!!"
			};
			let file3Expected: IFile = {
				sourceAbsolutePath: "root/var~b.d.e~/var~g~",
				destinationAbsolutePath: "root/please/Oreos",
				relativePath: "root/var~b.d.e~/var~g~",
				content: "line2\nvar~b.d.f~ are red\nvar~b.c~ are blue\nvar~g~ are black!!"
			};
			let dir1Expected: IDirectory = {
				sourceAbsolutePath: "root/var~a~",
				destinationAbsolutePath: "root/Roses",
				relativePath: "root/var~a~"
			};
			let dir2Expected: IDirectory = {
				sourceAbsolutePath: "root",
				destinationAbsolutePath: "root",
				relativePath: "root"
			};
			let expected = [dir1Expected, file1Expected, file2Expected, dir2Expected, file3Expected];
			
			let actual = variableParser.ResolveFiles(flag, testSubject);
			actual.should.deep.equal(expected)
		});
	});
	
	describe("ResolveContents", () => {
		it("should replace the content variable to the correct value", () => {
			let path1: string = "root/var~a~/a.a";
			let file1: IFile = {
				sourceAbsolutePath: path1,
				destinationAbsolutePath: path1,
				relativePath: path1,
				content: "line1\nvar~b.c~ are red\nvar~b.c~ are blue"
			};
			let path2: string = "root/var~b.c~/var~g~";
			let file2: IFile = {
				sourceAbsolutePath: path2,
				destinationAbsolutePath: path2,
				relativePath: path2,
				content: "line2\nvar~b.d.e~ help me!\nvar~b.c~ are blue\nvar~g~ are black!!"
			};
			let path3: string = "root/var~b.d.e~/var~g~";
			let file3: IFile = {
				sourceAbsolutePath: path3,
				destinationAbsolutePath: path3,
				relativePath: path3,
				content: "line2\nvar~b.d.f~ are red\nvar~b.c~ are blue\nvar~g~ are black!!"
			};
			let path4: string = "root/var~a~";
			let dir1: IDirectory = {
				sourceAbsolutePath: path4,
				destinationAbsolutePath: path4,
				relativePath: path4
			};
			let dir2: IDirectory = {
				sourceAbsolutePath: "root",
				destinationAbsolutePath: "root",
				relativePath: "root"
			};
			let testSubject = [dir1, file1, file2, dir2, file3];
			
			let file1Expected: IFile = {
				sourceAbsolutePath: "root/var~a~/a.a",
				destinationAbsolutePath: "root/var~a~/a.a",
				relativePath: "root/var~a~/a.a",
				content: "line1\nViolets are red\nViolets are blue"
			};
			let file2Expected: IFile = {
				sourceAbsolutePath: "root/var~b.c~/var~g~",
				destinationAbsolutePath: "root/var~b.c~/var~g~",
				relativePath: "root/var~b.c~/var~g~",
				content: "line2\nplease help me!\nViolets are blue\nOreos are black!!"
			};
			let file3Expected: IFile = {
				sourceAbsolutePath: "root/var~b.d.e~/var~g~",
				destinationAbsolutePath: "root/var~b.d.e~/var~g~",
				relativePath: "root/var~b.d.e~/var~g~",
				content: "line2\nApples are red\nViolets are blue\nOreos are black!!"
			};
			let dir1Expected: IDirectory = {
				sourceAbsolutePath: "root/var~a~",
				destinationAbsolutePath: "root/var~a~",
				relativePath: "root/var~a~"
			};
			let dir2Expected: IDirectory = {
				sourceAbsolutePath: "root",
				destinationAbsolutePath: "root",
				relativePath: "root"
			};
			let expected = [dir1Expected, file1Expected, file2Expected, dir2Expected, file3Expected];
			
			let actual = variableParser.ResolveContents(flag, testSubject);
			actual.should.deep.equal(expected)
		});
	});
	
	describe("ModifyFlagKey", () => {
		it("should convert keys to correct search term", () => {
			variableParser.ModifyFlagKey("package.name").should.deep.equal("var~package.name~");
		});
	});
	
	describe("ResolveFileContent", () => {
		it("should correctly resolve each file content", () => {
			let map: Map<string, string> = new Map([
				["flower1", "roses"],
				["flower2", "violets"],
				["flower3", "lily"]
			]);
			
			let f: IFile = {
				destinationAbsolutePath: "root/a",
				sourceAbsolutePath: "root/b",
				relativePath: "./c",
				content: "Emily likes var~flower1~\nJune likes var~flower2~\nLily likes var~flower3~"
			};
			
			let expected: IFile = {
				destinationAbsolutePath: "root/a",
				sourceAbsolutePath: "root/b",
				relativePath: "./c",
				content: "Emily likes roses\nJune likes violets\nLily likes lily"
			};
			
			variableParser.ResolveFileContent(map, f).should.deep.equal(expected);
		});
	});
	
});
