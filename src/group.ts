import path from 'path';
import {Group} from "./classLibrary/Group";
import {Core, Kore} from "@kirinnee/core";
import {ObjectX, Objex} from "@kirinnee/objex";
import {Utility} from "./classLibrary/Utility";
import chalk from "chalk";

const core: Core = new Kore();
core.ExtendPrimitives();

const objex: Objex = new ObjectX(core);
objex.ExtendPrimitives();

const util = new Utility(core);

let root = path.resolve(__dirname, '../templates');
let group: Group = new Group(core, objex, root, util);

function CreateGroup(key: string, name: string, email: string): string {
	const success = group.Create(key, name, email);
	if (success)
		return chalk.greenBright("The Group " + chalk.yellowBright(key) + ` (${name}) has been created!`);
	return chalk.redBright("The Group " + chalk.yellowBright(key) + ` (${name}) already exist!`);
}

function DeleteGroup(key: string): string {
	const success = group.Delete(key);
	if (success)
		return chalk.greenBright("The Group " + chalk.yellowBright(key) + " has been deleted!");
	return chalk.redBright("The Group " + chalk.yellowBright(key) + " does not exist!");
}

function ListGroup(): string {
	return group.ListAsArray().Map(([k, v]) => `${chalk.cyanBright(k)} ( ${chalk.red(v)} )`).join("\n");
}

function ExistGroup(name: string): boolean {
	return group.Exist(name);
}

function ListTemplates(key: string): string {
	if (!group.Exist(key)) return chalk.red(`Group ${key} does not exist`);
	return group.ListTemplate(key).Map(([k, v]) => `${chalk.cyanBright(v)} ( ${chalk.red(k)} )`).join("\n");
}

export {CreateGroup, DeleteGroup, ListGroup, ExistGroup, ListTemplates};
