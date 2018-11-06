import {should} from 'chai';
import {Core, Kore} from '@kirinnee/core';
import {LicenseResolver} from "../src/classLibrary/SpecialParser/LicenseResolver";
import {VariableResolver} from "../src/classLibrary/ParsingStrategy/VariableResolver";
import {Utility} from "../src/classLibrary/Utility";
import {IFile} from "../src/classLibrary/File";
import {License} from "../src/classLibrary/TargetUtil/CyanResponse";

should();

let core: Core = new Kore();
core.ExtendPrimitives();

describe("LicenseResolver", () => {
	let u: Utility = new Utility(core);
	let varResolver: VariableResolver = new VariableResolver(u);
	let licenseParser: LicenseResolver = new LicenseResolver(varResolver);
	
	it("should correctly create a LicenseFile", () => {
		
		let testSubj: License = {
			type: "MIT",
			author: "kirinnee",
			year: "2018"
		};
		
		let expectedContent: string =
			`# MIT License

Copyright (c) 2018 kirinnee

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
		let expectedFile: IFile = {
			sourceAbsolutePath: "",
			destinationAbsolutePath: "target/root",
			relativePath: "",
			content: expectedContent
		};
		licenseParser.ResolveLicense(testSubj, "target/root").should.deep.equal(expectedFile);
	});
});

