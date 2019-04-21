import program from 'commander';
import {Utility} from "./classLibrary/Utility";
import {Install} from "./install";
import chalk from 'chalk';
import {CreateGroup, DeleteGroup, ExistGroup, ListGroup, ListTemplates} from "./group";
import {Core, Kore} from "@kirinnee/core";
import {Try} from "./try";
import {Permute} from "./permute";
import {Create} from "./create";
import {ObjectX, Objex} from "@kirinnee/objex";
import {Dependency} from "./Depedency";
import {ApiSdk} from "./classLibrary/sdk/ApiSdk";
import {IAutoInquire, IAutoMapper} from "./classLibrary/TargetUtil/CyanResponse";
import {AutoInquire} from "./classLibrary/TargetUtil/AutoInquire";
import {AutoMapper} from "./classLibrary/TargetUtil/AutoMapper";
import {RemoveTemplate} from "./remove";
import {UpdateTemplate} from "./upgrade";

declare global {
	interface String {
		isFile(): boolean;
		
		FileName(): string;
	}
}

const core: Core = new Kore();
core.ExtendPrimitives();

const objex: Objex = new ObjectX(core);
objex.ExtendPrimitives();

const u: Utility = new Utility(core);
const api: ApiSdk = new ApiSdk("http://localhost:3001");
const autoMapper: IAutoMapper = new AutoMapper(u);
const autoInquirer: IAutoInquire = new AutoInquire(u, autoMapper);

const dep: Dependency = {
	core,
	objex,
	util: u,
	api,
	autoInquirer,
	autoMapper,
};

program
	.version('0.12.9');

// error on unknown commands
program
	.on('command:*', function () {
		console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
		process.exit(1);
	});

program
	.command("create <app-name>")
	.alias("c")
	.description("create a project from installed templates")
	.action(async function (folderName: string) {
		let reply: string = await Create(dep, folderName);
		console.log(reply);
		process.exit(0);
	});

program
	.command("install <dir> [group]")
	.alias("i")
	.description("install templates from git or from local machine")
	.option("-N --copy-node", "Copies node_module to target area")
	.action(function (link, dir, cmd) {
		let group: string = dir || "main";
		let copyNode: boolean = cmd["copyNode"] != null;
		if (ExistGroup(group)) {
			Install(link, group, copyNode, dep)
				.then(reply => console.log(reply))
				.then(() => process.exit(0));
		} else {
			console.log(chalk.redBright("Group ") + chalk.yellow(group) + chalk.redBright(" does not exist!"));
			process.exit(0);
		}
	});

program
	.command("group <action> [key] [name] [email]")
	.description("Group functions - [create (c), deleted (r), list (l), install (i)]")
	.action(async function (action: string, key: string, name: string, email: string) {
		switch (action.toLowerCase()) {
			case "c":
			case "create":
				if (name != null && key != null && email != null) {
					console.log(CreateGroup(key, name, email));
				} else {
					console.log(chalk.yellowBright("Usage:") + " group create <group-key> <group-name> <author-email>");
				}
				break;
			case "r":
			case "delete":
				if (key != null) {
					const r = await DeleteGroup(key);
					console.log(r);
				} else {
					console.log(chalk.yellowBright("Usage:") + " group delete <group-key>");
				}
				break;
			case "l":
			case "list":
				if (key == null) {
					console.log(ListGroup());
				} else {
					console.log(ListTemplates(key));
				}
				break;
			case "install":
			case "i":
				
				break;
			default:
				console.log(chalk.redBright("Unknown group sub-command: available commands: \n\tcreate - creates a new group\n\tdelete - deletes a group\n\tlist - show the list of groups"));
		}
	});

program
	.command("permute <from> <to>")
	.description("Permute all possible outcome of the template")
	.option("-N --copy-node", "Copies node_module to target area")
	.option("-G --git", "Simulates a git install from local folders, the target folder needs to be a git repository")
	.action(async function (from: string, to: string, cmd) {
		
		let copyNode: boolean = cmd["copyNode"] != null;
		let git: boolean = cmd["git"] != null;
		let reply = await Permute(dep, git, copyNode, from, to);
		console.log(reply);
		process.exit(0);
	});

program
	.command("try <from> <to>")
	.description("Try out the template")
	.option("-N --copy-node", "Copies node_module to target area")
	.option("-G --git", "Simulates a git install from local folders, the target folder needs to be a git repository")
	.action(async function (from: string, to: string, cmd) {
		
		let copyNode: boolean = cmd["copyNode"] != null;
		let git: boolean = cmd["git"] != null;
		
		let reply = await Try(dep, from, to, git, copyNode);
		console.log(reply);
		process.exit(0);
	});

program
	.command("remove <group> <key>")
	.description("Deletes or removes the template from the group")
	.alias("r")
	.action(async function (group: string, key: string) {
		const reply = await RemoveTemplate(dep, key, group);
		console.log(reply);
		process.exit(0);
	});

program
	.command("update <group> <key>")
	.description("updates a template of a group")
	.alias("u")
	.action(async function (group: string, key: string) {
		const reply = await UpdateTemplate(dep, key, group);
		console.log(reply);
		process.exit(0);
	});

program.parse(process.argv);

let NO_COMMAND_SPECIFIED = program.args.length === 0;

if (NO_COMMAND_SPECIFIED) {
	program.help();
}
