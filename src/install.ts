import {Installer} from "./classLibrary/Installer";
import {IFileFactory, RootFileFactory} from "./classLibrary/RootFileFactory";
import path from 'path';
import fs from 'graceful-fs';
import chalk from 'chalk';
import {FileWriter} from "./classLibrary/FileWriter";
import rimraf from 'rimraf';
import {Dependency} from "./Depedency";
import {Template} from "./classLibrary/Template";
import {Group} from "./classLibrary/Group";
import {TemplateResponse} from "./classLibrary/TemplateData";


export async function Install(key: string, group: string, copyNode: boolean, dep: Dependency): Promise<string> {
	// Obtain relative path to global node folder
	const fromPath: string = path.relative(__dirname, process.cwd());
	
	// Generate group instance to update group meta data during installation
	const g: Group = new Group(dep.core, dep.objex, path.resolve(__dirname, '../templates'), dep.util);
	
	// check with server whether key exist
	const exist = await dep.api.TemplateExist(key);
	if (!exist) return chalk.red(`Template ${key} does not exist!`);
	
	// Create a reflection of file system for template using Template object.
	const r: TemplateResponse = await dep.api.GetTemplateData(key);
	const template: Template = new Template(group, r.unique_key, r.display_name, r.repository, g);
	
	let fileFactory: IFileFactory = new RootFileFactory(dep.core, __dirname, fromPath, template.Template);
	if (fs.existsSync(template.Target)) {
		const overwrite = await dep.autoInquirer.InquirePredicate("The following template already exist, do you want to re-install it?");
		if (overwrite) {
			rimraf.sync(template.Target);
			return DownloadTemplate(template, copyNode, fileFactory, dep);
		} else {
			return chalk.yellow("Installation has been stopped.");
		}
	} else {
		return DownloadTemplate(template, copyNode, fileFactory, dep);
	}
}


async function DownloadTemplate(template: Template, copyNode: boolean, fileFactory: IFileFactory, dep: Dependency): Promise<string> {
	const writer: FileWriter = new FileWriter(dep.util);
	const installer: Installer = new Installer(dep.core, fileFactory, dep.util, writer);
	const string = await installer.Install(template.Link, copyNode);
	if (string !== "Installation Completed") return string;
	template.CreateGroupEntry();
	if (template.Exist()) {
		const data = template.TemplateData;
		const verify = data.key === template.key && template.name == data.name && template.link === data.repo;
		if (verify)
			return chalk.greenBright("Template ") +
				chalk.blueBright(template.name) +
				chalk.greenBright(" has been installed in Group ") +
				chalk.blueBright(template.group);
	}
	template.DeleteGroupEntry();
	rimraf.sync(template.Target);
	return chalk.redBright("Template ") +
		chalk.blueBright(template.name) +
		chalk.redBright(" failed to installed in Group ") +
		chalk.blueBright(template.group) +
		chalk.redBright(`, possibly due to the following reason:
\t- The target folder does not exist
\t- The target git repository does not exist
\t- The target folder or repository does not contain [cyan.config.js] in the root folder
\t- The target folder or repository does not contain [cyan.json] in the root folder
\t- The data in the target repository's [cyan.json] does not match with server's
`);
}
