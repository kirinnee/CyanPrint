import {Group} from "../src/classLibrary/Group";
import * as path from 'path';
import {should} from 'chai';
import {Core, Kore} from "@kirinnee/core";
import {ObjectX, Objex} from "@kirinnee/objex";
import {Utility} from "../src/classLibrary/Utility";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

const objex: Objex = new ObjectX(core);
objex.ExtendPrimitives();

const util: Utility = new Utility(core);

let root: string = path.resolve(__dirname, './target/Groups');
let group: Group = new Group(core, objex, root, util);

describe("Group", () => {
	describe("ListAsArray", () => {
		it("should list out all the possible groups", () => {
			let expected = [
				["Frontend Templates", "frontend"],
				["C# .NET Core", "csharp"],
				["Ruby Gems", "gem"]
			];
			group.ListAsArray().should.deep.equal(expected);
		});
	});
	describe("Exist", () => {
		it("should return false for Groups that do not exist", () => {
			group.Exist("group1").should.be.false;
			group.Exist("d").should.be.false;
		});
		
		it("should return true for Groups that exist", () => {
			group.Exist("gem").should.be.true;
			group.Exist("csharp").should.be.true;
		});
	});
	
	describe("Obtain group data", () => {
		it("should read cyan.group.json and return as GroupData object", () => {
			const expected = {
				name: "C# .NET Core",
				key: "chsarp",
				email: "kirinnee97@gmail.com",
				templates: {
					nuget_lib: "NuGet Library",
					nuget_cli: "NuGet Command Line"
				}
			};
			group.ObtainGroupData("csharp").should.deep.equal(expected);
		});
	});
	
	describe("ListTemplate", () => {
		it("should list all templates", () => {
			const expected: [string, string][] = [
				["vue", "Vue Template"],
				["react", "React Template"]
			];
			group.ListTemplate("frontend").should.deep.equal(expected);
		});
	});
	
	
});


