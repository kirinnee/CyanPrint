import {Chalk} from "chalk";
import {Inquirer} from "inquirer";
import {Cyan, DocQuestions, Documentation, Glob, IAutoInquire} from "./Typings";

export = async function (folderName: string, chalk: Chalk, inquirer: Inquirer, autoInquirer: IAutoInquire): Promise<Cyan> {
	let answers: any = await inquirer.prompt([
		{
			type: "list",
			name: "predicate",
			choices: ["Typescript", "Javascript"],
			message: "What language do you want the cyan.config file to be in? (This only affects the templater, not the actual template!)"
		}
	]);
	let glob: Glob[] = [];
	
	let isTypescript: boolean = answers.predicate === "Typescript";
	
	if (isTypescript) {
		glob.push({root: "./Template/typescript", pattern: "**/*.*", ignore: ""});
	} else {
		glob.push({root: "./Template/javascript", pattern: "**/*.*", ignore: ""});
	}
	glob.push({root: "./Template/common", pattern: "**/*.*", ignore: ""});
	
	let doc: DocQuestions = {license: false, git: true, readme: true, contributing: false, semVer: false};
	let docs: Documentation = await autoInquirer.InquireDocument(doc);
	
	let npm: any = await autoInquirer.InquireInput({"package-name": ["cyanprint-template-name", "Please enter a unique key of the cyanprint template"]});
	npm.git = docs.data.gitURL;
	
	const flags: any = {
		gitignore: true,
		gitlab: false
	};
	
	flags.gitlab = await autoInquirer.InquirePredicate("Do you want to use GitLab CI?");
	
	return {
		globs: glob,
		variable: npm,
		npm: isTypescript,
		flags,
		docs,
		comments: ["//"]
	} as Cyan;
}
