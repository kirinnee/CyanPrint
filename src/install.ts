import {Installer} from "./classLibrary/Installer";
import {Utility} from "./classLibrary/Utility";
import {IFileFactory, RootFileFactory} from "./classLibrary/RootFileFactory";
import path from 'path';
import fs from 'graceful-fs';
import chalk from 'chalk';
import {FileWriter} from "./classLibrary/FileWriter";
import inqurier from 'inquirer';
import rimraf from 'rimraf';
import {Core} from "@kirinnee/core";

export async function Install(link: string, group: string, copyNode: boolean, core: Core, util: Utility): Promise<string> {
	let from: string = path.relative(__dirname, process.cwd());
	let templateName: string = link.isFile() && path.extname(link) === ".git" ? link.FileName() : link.split('/').Last()! as string;
	templateName = templateName.Remove("cyan.");
	let template: string = '../templates/' + group + "/" + templateName;
	let fileFactory: IFileFactory = new RootFileFactory(core, __dirname, from, template);
	let target: string = path.resolve(__dirname, template);
	
	let expectedTarget = path.resolve(target, 'cyan.config.js');
	if (fs.existsSync(target)) {
		let answers: string = (await inqurier.prompt(
			[{
				message: "The following template already exist, do you want to re-install it?",
				type: "list",
				name: "reinstall",
				choices: ["Yes", "No"]
			}]
		))["reinstall"];
		if (answers === "Yes") {
			rimraf.sync(target);
			let writer: FileWriter = new FileWriter(util);
			let installer: Installer = new Installer(core, fileFactory, util, writer);
			let string = await installer.Install(link, copyNode);
			if (string !== "Installation Completed") {
				return string;
			}
			if (fs.existsSync(expectedTarget)) {
				return chalk.greenBright("Template ") +
					chalk.blueBright(templateName.ReplaceAll('_', ' ').ReplaceAll('-', ' ')) +
					chalk.greenBright(" has been installed in Group ") +
					chalk.blueBright(group);
			} else {
				rimraf.sync(target);
				return chalk.redBright("Template ") +
					chalk.blueBright(templateName.ReplaceAll('_', ' ').ReplaceAll('-', ' ')) +
					chalk.redBright(" failed to installed in Group ") +
					chalk.blueBright(group) +
					chalk.redBright(`, possibly due to the following reason:
\t- The target folder does not exist
\t- The target git repository does not exist
\t- The target folder or repository does not contain [cyan.config.js] in the root folder
`);
			}
		} else {
			return chalk.yellow("Installation has been stopped.");
		}
		
	} else {
		let writer: FileWriter = new FileWriter(util);
		let installer: Installer = new Installer(core, fileFactory, util, writer);
		let string = await installer.Install(link, copyNode);
		if (string !== "Installation Completed") {
			return string;
		}
		if (fs.existsSync(expectedTarget)) {
			return chalk.greenBright("Template ") +
				chalk.blueBright(templateName.ReplaceAll('_', ' ').ReplaceAll('-', ' ')) +
				chalk.greenBright(" has been installed in Group ") +
				chalk.blueBright(group);
		} else {
			rimraf.sync(target);
			return chalk.redBright("Template ") +
				chalk.blueBright(templateName.ReplaceAll('_', ' ').ReplaceAll('-', ' ')) +
				chalk.redBright(" failed to installed in Group ") +
				chalk.blueBright(group) +
				chalk.redBright(`, possibly due to the following reason:
\t- The target folder does not exist
\t- The target git repository does not exist
\t- The target folder or repository does not contain [cyan.config.js] in the root folder

Cyan has deleted the downloaded/copied files/
`);
		}
	}
	
	
}