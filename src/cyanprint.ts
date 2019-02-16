import program from 'commander';
import {Utility} from "./classLibrary/Utility";
import {Install} from "./install";
import chalk from 'chalk';
import {CreateGroup, DeleteGroup, ExistGroup, ListGroup} from "./group";
import {Core, Kore} from "@kirinnee/core";
import {Try} from "./try";
import {Permute} from "./permute";
import {Create} from "./create";
import {ObjectX, Objex} from "@kirinnee/objex";

declare global {
	interface String {
		isFile(): boolean;
		
		FileName(): string;
	}
}


let core: Core = new Kore();
core.ExtendPrimitives();

let objex: Objex = new ObjectX(core);
objex.ExtendPrimitives();


let u: Utility = new Utility(core);


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
		let reply: string = await Create(u, folderName);
		console.log(reply);
		process.exit(0);
	});

program
	.command("install <dir> [group]")
	.alias("i")
	.description("install templates from git or from local machine")
	.option("-N --copy-node", "Copies node_module to target area")
	.action(function (link, dir, cmd) {
		let group: string = dir || "Main";
		let copyNode: boolean = cmd["copyNode"] != null;
		if (ExistGroup(group)) {
			Install(link, group, copyNode, core, u)
				.then(reply => console.log(reply))
				.then(() => process.exit(0));
		} else {
			console.log(chalk.redBright("Group ") + chalk.yellow(group) + chalk.redBright(" does not exist!"));
			process.exit(0);
		}
	});

program
	.command("group <action> [dirName]")
	.description("Group functions, create - delete - list")
	.action(function (action: string, name: string) {
		switch (action.toLowerCase()) {
			case "create":
				if (name != null) {
					console.log(CreateGroup(name));
				} else {
					console.log(chalk.yellowBright("Usage:") + " group create <group name>");
				}
				break;
			case "delete":
				if (name != null) {
					console.log(DeleteGroup(name));
				} else {
					console.log(chalk.yellowBright("Usage:") + " group delete <group name>");
				}
				break;
			case "list":
				console.log(ListGroup());
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
		let reply = await Permute(u, git, copyNode, from, to);
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
		
		let reply = await Try(u, from, to, git, copyNode);
		console.log(reply);
		process.exit(0);
	});


program.parse(process.argv);

let NO_COMMAND_SPECIFIED = program.args.length === 0;

if (NO_COMMAND_SPECIFIED) {
	program.help();
}