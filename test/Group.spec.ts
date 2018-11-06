import {Group} from "../src/classLibrary/Group";
import * as path from 'path';
import chalk from 'chalk';
import {should} from 'chai';
import {Core, Kore} from "@kirinnee/core";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

let root: string = path.resolve(__dirname, './target/Groups');
let group: Group = new Group(core, root);

describe("Group", () => {
	describe("List", () => {
		it("should list out all the possible groups", () => {
			let expected =
				`${chalk.blueBright("a")}
${chalk.blueBright("b")}
${chalk.blueBright("c")}`;
			group.List().should.deep.equal(expected);
		});
	});
	describe("Exist", () => {
		it("should return false for Groups that do not exist", () => {
			group.Exist("group1").should.be.false;
			group.Exist("d").should.be.false;
		});
		
		it("should return true for Groups that exist", () => {
			group.Exist("a").should.be.true;
			group.Exist("b").should.be.true;
		});
	})
});


