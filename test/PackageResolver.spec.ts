import {Utility} from "../src/classLibrary/Utility";
import {PackageResolver} from "../src/classLibrary/ParsingStrategy/PackageResolver";
import {IDirectory, IFile} from "../src/classLibrary/File";
import {Core, Kore, SortType} from "@kirinnee/core";
import {should} from 'chai';

should();

let core: Core = new Kore();
core.ExtendPrimitives();


let util: Utility = new Utility(core);

let packageParser: PackageResolver = new PackageResolver(util);
let flags: object = {
	a: false,
	b: false,
	packages: {
		mocha: true,
		chai: false,
		"@types/mocha": true,
		"@types/chai": false
	}
};

describe("PackageResolver", () => {
	describe("ResolveJsonFile", () => {
		it("should remove unused packages", () => {
			
			let map: Map<string, boolean> = new Map<string, boolean>([
				["mocha", true],
				["chai", false],
				["@types/mocha", true],
				["@types/chai", false]
			]);
			
			let testSubj: string =
				`{
  "name": "@kirinnee/weave",
  "license": "MIT",
  "devDependencies": {
    "@types/chai": "^4.1.5",
    "@types/mocha": "^5.2.5",
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0"
  },
  "dependencies": {
    "chai": "^4.1.2",
    "mocha": "^5.2.0"
  }
}`;
			let expectedContent: string =
				`{
  "name": "@kirinnee/weave",
  "license": "MIT",
  "devDependencies": {
    "@types/mocha": "^5.2.5",
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0"
  },
  "dependencies": {
    "mocha": "^5.2.0"
  }
}`;
			let testFile: IFile = {
				destinationAbsolutePath: "root/package.json",
				sourceAbsolutePath: "root/package.json",
				relativePath: "root/package.json",
				content: testSubj
			};
			
			let expectedFile: IFile = {
				destinationAbsolutePath: "root/package.json",
				sourceAbsolutePath: "root/package.json",
				relativePath: "root/package.json",
				content: expectedContent
			};
			
			packageParser.ResolveJsonFile(map, testFile).should.deep.equal(expectedFile);
		});
	});
	
	describe("ResolveContents", () => {
		it("should return package json with unused packages removed", () => {
			let testSubj: string =
				`{
  "name": "@kirinnee/weave",
  "license": "MIT",
  "devDependencies": {
    "@types/chai": "^4.1.5",
    "@types/mocha": "^5.2.5",
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0"
  },
  "dependencies": {
    "chai": "^4.1.2",
    "mocha": "^5.2.0"
  }
}`;
			let expectedContent: string =
				`{
  "name": "@kirinnee/weave",
  "license": "MIT",
  "devDependencies": {
    "@types/mocha": "^5.2.5",
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0"
  },
  "dependencies": {
    "mocha": "^5.2.0"
  }
}`;
			let testFile: IFile = {
				destinationAbsolutePath: "root/package.json",
				sourceAbsolutePath: "root/package.json",
				relativePath: "root/package.json",
				content: testSubj
			};
			let file2: IFile = {
				destinationAbsolutePath: "root/main.js",
				sourceAbsolutePath: "root/main.js",
				relativePath: "root/main.js",
				content: "rofl"
			};
			let dir: IDirectory = {
				destinationAbsolutePath: "root/src",
				sourceAbsolutePath: "root/src",
				relativePath: "root/src"
			};
			
			let expectedFile: IFile = {
				destinationAbsolutePath: "root/package.json",
				sourceAbsolutePath: "root/package.json",
				relativePath: "root/package.json",
				content: expectedContent
			};
			let expectedFile2: IFile = {
				destinationAbsolutePath: "root/main.js",
				sourceAbsolutePath: "root/main.js",
				relativePath: "root/main.js",
				content: "rofl"
			};
			let expectedDir: IDirectory = {
				destinationAbsolutePath: "root/src",
				sourceAbsolutePath: "root/src",
				relativePath: "root/src"
			};
			
			let test = [testFile, file2, dir];
			let expected = [expectedFile, expectedFile2, expectedDir];
			
			packageParser.ResolveContents(flags, test).should.deep.equal(expected);
			
			
		});
	});
	
	
	describe("Count", () => {
		it("should count the occurrences of the package flags", () => {
			let testSubj: string =
				`{
  "name": "@kirinnee/weave",
  "license": "MIT",
  "devDependencies": {
    "@types/chai": "^4.1.5",
    "@types/mocha": "^5.2.5",
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0"
  },
  "dependencies": {
    "chai": "^4.1.2",
    "mocha": "^5.2.0"
  }
}`;
			
			let testFile: IFile = {
				destinationAbsolutePath: "root/package.json",
				sourceAbsolutePath: "root/package.json",
				relativePath: "root/package.json",
				content: testSubj
			};
			let file2: IFile = {
				destinationAbsolutePath: "root/main.js",
				sourceAbsolutePath: "root/main.js",
				relativePath: "root/main.js",
				content: "rofl"
			};
			let dir: IDirectory = {
				destinationAbsolutePath: "root/src",
				sourceAbsolutePath: "root/src",
				relativePath: "root/src"
			};
			
			let test = [dir, file2, testFile];
			
			let expected: [string, number][] = new Map([
				["packages.mocha", 1],
				["packages.chai", 1],
				["packages.@types/mocha", 1],
				["packages.@types/chai", 1]
			])
				.SortByKey(SortType.AtoZ)
				.Arr();
			
			let oldMap: Map<string, number> = new Map([
				["packages.chai", 1],
				["packages.@types/mocha", 1],
			]);
			let oldExpected: [string, number][] = new Map([
				["packages.mocha", 1],
				["packages.chai", 2],
				["packages.@types/mocha", 2],
				["packages.@types/chai", 1]
			])
				.SortByKey(SortType.AtoZ)
				.Arr();
			
			packageParser.Count(flags, test, new Map([]), true).SortByKey(SortType.AtoZ).Arr().should.deep.equal(expected);
			packageParser.Count(flags, test, oldMap, true).SortByKey(SortType.AtoZ).Arr().should.deep.equal(oldExpected);
		});
	});
});

