import inquirer from 'inquirer';
import path from "path";
import {Group} from "./classLibrary/Group";
import glob from 'glob';
import {AutoInquire} from "./classLibrary/TargetUtil/AutoInquire";
import {Utility} from "./classLibrary/Utility";
import {CyanSafe, IAutoInquire, IAutoMapper} from "./classLibrary/TargetUtil/CyanResponse";
import {AutoMapper} from "./classLibrary/TargetUtil/AutoMapper";
import {GenerateTemplate, Interrogate} from "./generator";

export async function Create(utility: Utility, folderName: string): Promise<string> {
	
	let root = path.resolve(__dirname, '../templates');
	let group: Group = new Group(utility.c, root);
	
	let map: Map<string, string> = group.ListAsArray()
		.AsValue((k: string) => k.ReplaceAll('-', ' ').ReplaceAll('_', ' '));
	
	let answers: any = await inquirer.prompt([
		{
			type: "list",
			message: "Please choose the template Group you want to use",
			name: "group",
			choices: map.Keys()
		}
	]);
	
	
	return await CreateTemplates(utility, map.get(answers["group"])!, folderName);
}

async function CreateTemplates(utility: Utility, group: string, folderName: string): Promise<string> {
	
	//Find path to folder
	let root = path.resolve(__dirname, '../templates/' + group);
	
	//Map each template to a non - or non _ version to prompt question, asking which template to use
	let templates: Map<string, string> = glob.sync(path.resolve(root, "*/cyan.config.js"))
		.Map(p => path.dirname(p as string).split("/").pop()!)
		.AsValue((k: string) =>
			k.ReplaceAll('-', ' ').ReplaceAll('_', ' ')
		);
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
	
	let autoMapper: IAutoMapper = new AutoMapper(utility);
	let autoInquire: IAutoInquire = new AutoInquire(utility, autoMapper);
	let settings: CyanSafe = await Interrogate(utility, __dirname, templatePath, folderName, autoInquire, autoMapper);
	return GenerateTemplate(utility, templatePath, folderName, settings, autoMapper, autoInquire, true);
}

