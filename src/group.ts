import path from 'path';
import {Group} from "./classLibrary/Group";
import {Core, Kore} from "@kirinnee/core";
import {ObjectX, Objex} from "@kirinnee/objex";
import {Utility} from "./classLibrary/Utility";
import chalk from "chalk";
import {AutoMapper} from "./classLibrary/TargetUtil/AutoMapper";
import {AutoInquire} from "./classLibrary/TargetUtil/AutoInquire";
import {Dependency} from "./Depedency";
import {GroupData, GroupResponse} from "./classLibrary/GroupData";
import {InstallTemplate} from "./install";
import fse from "fs-extra";
import fs from "graceful-fs";
import rimraf = require("rimraf");

const core: Core = new Kore();
core.ExtendPrimitives();

const objex: Objex = new ObjectX(core);
objex.ExtendPrimitives();

const util = new Utility(core);

let root = path.resolve(__dirname, '../templates');
let group: Group = new Group(core, objex, root, util);

function CreateGroup(key: string, name: string, email: string, readme: string): string {
	const content =
		`# ${name}
*Unique Key*: ${key}

# Author
${email}
`;
	const success = group.Create(key, name, email, readme, content);
	if (success)
		return chalk.greenBright("The Group " + chalk.yellowBright(key) + ` (${name}) has been created!`);
	return chalk.redBright("The Group " + chalk.yellowBright(key) + ` (${name}) already exist!`);
}

async function DeleteGroup(key: string): Promise<string> {
	const autoMapper = new AutoMapper(util);
	const autoInquirer = new AutoInquire(util, autoMapper);
	const confirm =
		await autoInquirer.InquirePredicate(
			`Are you sure you want to delete Group ${key} and all templates and content with the group? This cannot be undone`
		);
	if (!confirm) return "User cancelled";
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

async function UpdateGroup(dep, key: string): Promise<string> {
	const red = chalk.red;
	const cyan = chalk.cyanBright;
	
	// Check if group exist
	const exist = await dep.api.GroupExist(key);
	if (!exist) return red(`Group ${key} does not exist`);
	
	//Pull group data
	const groupData: GroupResponse = await dep.api.GetGroupData(key);
	
	//Move old data
	const target: string = path.resolve(root, key);
	const old: string = target + "_old_kirin_temp_folder";
	fse.moveSync(target, old);
	try {
		const content = await dep.api.getReadMeContent(groupData.readme);
		const success = group.Create(groupData.unique_key, groupData.display_name, groupData.author, "README.MD", content);
		if (!success) throw red("Failed to create group, possibly due to old version still existing. Please try again.");
		
		for (const e of groupData.templates) {
			console.log(cyan("========================"));
			console.log(cyan(`Installing ${e}...`));
			const out: string = await InstallTemplate(e, key, false, dep);
			console.log(out);
		}
		rimraf.sync(old);
		return cyan.greenBright(`Update of group ${key} completed!`);
	} catch (e) {
		//Roll back
		rimraf.sync(target);
		fse.moveSync(old, target);
		return e;
	}
	
	
}

async function InstallGroup(dep: Dependency, key: string): Promise<string> {
	const red = chalk.red;
	const cyan = chalk.cyanBright;
	// Check if group exist
	const exist = await dep.api.GroupExist(key);
	if (!exist) return red(`Group ${key} does not exist`);
	
	
	//Pull group data
	const groupData: GroupResponse = await dep.api.GetGroupData(key);
	
	if (group.Exist(groupData.unique_key)) {
		const override = await dep.autoInquirer.InquirePredicate(`Group ${key} already exist, do you want to re-install? This cannot be undone.`);
		if (!override) return red(`User cancelled`);
		const success = group.Delete(key);
		if (!success) return red("Failed to remove old version, please try again");
	}
	
	
	const content = await dep.api.getReadMeContent(groupData.readme);
	const success = group.Create(groupData.unique_key, groupData.display_name, groupData.author, "README.MD", content);
	if (!success) return red("Failed to create group, possibly due to old version still existing. Please try again.");
	
	
	for (const e of groupData.templates) {
		console.log(cyan("========================"));
		console.log(cyan(`Installing ${e}...`));
		const out: string = await InstallTemplate(e, key, false, dep);
		console.log(out);
	}
	return cyan.greenBright(`Installation of group ${key} completed!`);
}

async function PushGroup(dep: Dependency, key: string, secret: string): Promise<string> {
	if (!group.Exist(key)) return chalk.red(`Group ${key} does not exist!`);
	const groupData: GroupData = group.ObtainGroupData(key);
	const readMePath: string = path.resolve(root, key, groupData.readme);
	const readMeBinary = fs.readFileSync(readMePath);
	groupData.readme = Buffer.from(readMeBinary).toString('base64');
	try {
		await dep.api.UpdateGroup(groupData, secret);
		return chalk.greenBright(`Successfully pushed group ${key} to CyanPrint host!`);
	} catch (e) {
		return chalk.red(JSON.stringify(e.message));
	}
	
}

export {CreateGroup, DeleteGroup, ListGroup, ExistGroup, ListTemplates, InstallGroup, UpdateGroup, PushGroup};
