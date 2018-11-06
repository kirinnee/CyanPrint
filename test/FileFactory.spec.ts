import {IFileFactory, RootFileFactory} from "../src/classLibrary/RootFileFactory";
import * as path from 'path';
import {should} from 'chai';
import {Core, Kore} from "@kirinnee/core";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

let from = '../target/InlineFlagResolver/testDir/';
let to = '../target/InlineFlagResolver/newDir/';
let fileFactory: IFileFactory = new RootFileFactory(core, __dirname, from, to);

describe("RootFileFactory", () => {
	describe("FromRoot", () => {
		it("should return the absolute path to the from folder", () => {
			let expected = path.resolve(__dirname, from);
			fileFactory.FromRoot.should.equal(expected);
		});
	});
	describe("ToRoot", () => {
		it("should return the absolute path tot the to folder", () => {
			let expected = path.resolve(__dirname, to);
			fileFactory.ToRoot.should.equal(expected);
			
		});
	});
});
