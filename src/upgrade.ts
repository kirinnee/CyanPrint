import {Dependency} from "./Depedency";
import {Group} from "./classLibrary/Group";
import path from "path";
import chalk from "chalk";
import {Template} from "./classLibrary/Template";
import {TemplateResponse} from "./classLibrary/TemplateData";
import {IFileFactory, RootFileFactory} from "./classLibrary/RootFileFactory";
import {FileWriter} from "./classLibrary/FileWriter";
import {Installer} from "./classLibrary/Installer";
import fse from "fs-extra";
import fetch, {Response} from "node-fetch"
import {GroupData} from "./classLibrary/GroupData";
import rimraf = require("rimraf");

async function UpdateEverything(dep): Promise<string> {
	const sure = await dep.autoInquirer.InquirePredicate(`Update all templates to the latest version? This cannot be undone.`);
	if (!sure) return "User cancelled";
	let root = path.resolve(__dirname, '../templates');
	let g: Group = new Group(dep.core, dep.objex, root, dep.util);
	const groups: string[] = g.ListAsArray().Map(([_, v]) => v);
	for (const group of groups) {
		await UpdateTemplatesInGroup(dep, group, false);
	}
	return "Completed updating all templates!";
}

async function UpdateTemplatesInGroup(dep: Dependency, group: string, confirm = true): Promise<string> {
	let root = path.resolve(__dirname, '../templates');
	let g: Group = new Group(dep.core, dep.objex, root, dep.util);
	
	//Check if group exist locally
	if (!g.Exist(group)) return chalk.red(`Group ${group} does not exist!`);
	
	// Confirm if user wants to upgrade
	if (confirm) {
		const sure = await dep.autoInquirer.InquirePredicate(`Update all templates from Group ${group} to the latest version? This cannot be undone.`);
		if (!sure) return "User cancelled";
	}
	
	//Extract data and update each template
	const data: GroupData = g.ObtainGroupData(group);
	for (const key in data.templates) {
		if (data.templates.hasOwnProperty(key)) {
			const [t, s]: [string, boolean] = await UpdateTemplate(dep, key, group, false);
			if (s) {
				console.log(t);
			} else {
				console.log(chalk.red(`Failed updating template ${key}:`));
				console.log(t);
			}
			
		}
	}
	return "Done updating templates!";
}

async function UpdateTemplate(dep: Dependency, key: string, group: string, confirm: boolean = true): Promise<[string, boolean]> {
	// check with server whether key exist
	const exist = await dep.api.TemplateExist(key);
	if (!exist) return [chalk.red(`Template ${key} not longer exist!`), false];
	
	// Create a reflection of file system for template using Template object.
	const r: TemplateResponse = await dep.api.GetTemplateData(key);
	
	// Ping endpoint to check if repository exist
	const resp: Response = await fetch(r.repository, {method: "HEAD"});
	if (resp.status !== 200) return [chalk.red("Repository does not exist! Please contact the owner of the template"), false];
	
	const g: Group = new Group(dep.core, dep.objex, path.resolve(__dirname, '../templates'), dep.util);
	//Reject if group does not exist
	if (!g.Exist(group)) return [chalk.red(`Group ${chalk.cyanBright(key)} does not exist!`), false];
	
	// Reject if template does not exist within group
	const template: Template = new Template(group, key, r.display_name, r.repository, g);
	// if (!template.Exist()) return chalk.red(`Template ${chalk.cyanBright(key)} does not exist within Group ${chalk.cyanBright(group)}`);
	
	
	// Confirm if user wants to upgrade
	if (confirm) {
		const sure = await dep.autoInquirer.InquirePredicate(`Update ${key} from Group ${group} to the latest version? This cannot be undone.`);
		if (!sure) return ["User cancelled", false];
	}
	
	// Delete current entry
	const old = template.Target + "_old";
	const oldExist = fse.existsSync(old);
	if (oldExist) rimraf.sync(old);
	await fse.move(template.Target, old);
	
	try {
		// Attempt
		const fileFactory: IFileFactory = new RootFileFactory(dep.core, __dirname, path.relative(__dirname, process.cwd()), template.Template);
		const writer: FileWriter = new FileWriter(dep.util);
		const installer: Installer = new Installer(dep.core, fileFactory, dep.util, writer);
		const string = await installer.Install(template.Link, false);
		if (string !== "Installation Completed") throw string;
		if (template.Exist()) {
			const data = template.TemplateData;
			const verify = data.key === template.key && template.name == data.name && template.link === data.repo;
			if (verify) {
				const g = chalk.greenBright;
				const c = chalk.cyanBright;
				rimraf.sync(old);
				return [`${g("Successfully updated Template")} ${c(template.name)} ${g("in Group")} ${c(template.group)}`, true];
			}
		}
		const red = chalk.red;
		const cyan = chalk.cyan;
		throw red("Failed to upgrade Template ") + cyan(template.name) + red(" in Group ") + cyan(template.group) +
		red(` possibly due to the following reason
\t- The target folder does not exist
\t- The target git repository does not exist
\t- The target folder or repository does not contain [cyan.config.js] in the root folder
\t- The target folder or repository does not contain [cyan.json] in the root folder
\t- The data in the target repository's [cyan.json] does not match with server's
`)
	} catch (e) {
		//Rollback
		rimraf.sync(template.Target);
		await fse.move(old, template.Target);
		return [e, false];
	}
}

export {UpdateTemplate, UpdateTemplatesInGroup, UpdateEverything}
