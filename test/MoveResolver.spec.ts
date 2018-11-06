import {Utility} from "../src/classLibrary/Utility";
import {IDirectory, IFile} from "../src/classLibrary/File";
import {Core, Kore, SortType} from "@kirinnee/core";
import {should} from 'chai';
import {MoveResolver} from "../src/classLibrary/ParsingStrategy/MoveResolver";

should();

let core: Core = new Kore();
core.ExtendPrimitives();

let util: Utility = new Utility(core);

let packageParser: MoveResolver = new MoveResolver(util);
let flags: object = {
	a: false,
	b: false,
	move: {
		"@types/mocha": true,
		"@types/chai": false
	}
};

describe("MoveResolver", () => {
	describe("ResolveJsonFile", () => {
		it("should move dev dependency to dependency", () => {
			
			let map: Map<string, boolean> = new Map<string, boolean>([
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
    "@types/chai": "^4.1.5",
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0"
  },
  "dependencies": {
    "chai": "^4.1.2",
    "mocha": "^5.2.0",
    "@types/mocha": "^5.2.5"
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
		
		it("should move dependency to dev dependency", () => {
			
			let map: Map<string, boolean> = new Map<string, boolean>([
				["@types/mocha", false],
				["@types/chai", true]
			]);
			
			let testSubj: string =
				`{
  "name": "@kirinnee/weave",
  "license": "MIT",
  "devDependencies": {
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0"
  },
  "dependencies": {
    "@types/chai": "^4.1.5",
    "@types/mocha": "^5.2.5",
    "chai": "^4.1.2",
    "mocha": "^5.2.0"
  }
}`;
			let expectedContent: string =
				`{
  "name": "@kirinnee/weave",
  "license": "MIT",
  "devDependencies": {
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0",
    "@types/chai": "^4.1.5"
  },
  "dependencies": {
    "@types/mocha": "^5.2.5",
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
		it("should move dev dependency to dependency", () => {
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
    "@types/chai": "^4.1.5",
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0"
  },
  "dependencies": {
    "chai": "^4.1.2",
    "mocha": "^5.2.0",
    "@types/mocha": "^5.2.5"
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
		it("should move dependency to dev dependency", () => {
			let testSubj: string =
				`{
  "name": "@kirinnee/weave",
  "license": "MIT",
  "devDependencies": {
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0"
  },
  "dependencies": {
    "@types/chai": "^4.1.5",
    "@types/mocha": "^5.2.5",
    "chai": "^4.1.2",
    "mocha": "^5.2.0"
  }
}`;
			let expectedContent: string =
				`{
  "name": "@kirinnee/weave",
  "license": "MIT",
  "devDependencies": {
    "@types/webpack": "^4.4.12",
    "typescript": "^3.0.3",
    "webpack": "^4.19.1",
    "webpack-cli": "^3.1.0",
    "@types/mocha": "^5.2.5"
  },
  "dependencies": {
    "@types/chai": "^4.1.5",
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
		it("should count the occurrences of the move flags", () => {
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
				["move.@types/mocha", 1],
				["move.@types/chai", 1]
			])
				.SortByKey(SortType.AtoZ)
				.Arr();
			
			let oldMap: Map<string, number> = new Map([
				["move.chai", 1],
				["move.@types/mocha", 1],
			]);
			let oldExpected: [string, number][] = new Map([
				["move.chai", 1],
				["move.@types/mocha", 2],
				["move.@types/chai", 1]
			])
				.SortByKey(SortType.AtoZ)
				.Arr();
			
			packageParser.Count(flags, test, new Map([]), true).SortByKey(SortType.AtoZ).Arr().should.deep.equal(expected);
			packageParser.Count(flags, test, oldMap, true).SortByKey(SortType.AtoZ).Arr().should.deep.equal(oldExpected);
		});
	});
});

