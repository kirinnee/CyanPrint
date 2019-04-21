import inquirer from 'inquirer';
import path from "path";
import {Group} from "./classLibrary/Group";
import {CyanSafe} from "./classLibrary/TargetUtil/CyanResponse";
import {GenerateTemplate, Interrogate} from "./generator";
import {Dependency} from "./Depedency";

export async function Create(dep: Dependency, folderName: string): Promise<string> {
	
	let root = path.resolve(__dirname, '../templates');
	let group: Group = new Group(dep.core, dep.objex, root, dep.util);
	
	let map: Map<string, string> = new Map(group.ListAsArray());
	
	let answers: any = await inquirer.prompt([
		{
			type: "list",
			message: "Please choose the template Group you want to use",
			name: "group",
			choices: map.Keys()
		}
	]);
	return await CreateTemplates(dep, group, map.get(answers["group"])!, folderName);
}

async function CreateTemplates(dep: Dependency, g: Group, group: string, folderName: string): Promise<string> {
	
	//Find path to folder
	let root = path.resolve(__dirname, '../templates/', group);
	
	// Obtain template list from config file
	const templates: Map<string, string>
		= new Map(g.ListTemplate(group).Map(([k, v]) => [v, k] as [string, string]));
	
	//Put up a list to see which question to return
	let answers: any = await inquirer.prompt([
		{
			type: "list",
			message: "Please choose the template to use",
			name: "template",
			choices: templates.Keys()
		}
	]);
	//Put up a template to see what to use
	let templatePath = path.resolve(root, templates.get(answers["template"])!);
	
	let settings: CyanSafe = await Interrogate(dep, dep.autoInquirer, templatePath, folderName);
	return GenerateTemplate(dep, templatePath, folderName, settings, true);
}

