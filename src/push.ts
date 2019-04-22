import * as path from "path";
import fs from "graceful-fs";
import chalk from "chalk";
import {Dependency} from "./Depedency";
import {CyanTemplateData, TemplateData} from "./classLibrary/TemplateData";
import fetch, {Response} from "node-fetch";


async function PushTemplate(dep: Dependency, secret: string): Promise<string> {
	const cd: string = process.cwd();
	// verify relevant files exist
	const cyanJson = path.resolve(cd, "cyan.json");
	if (!fs.existsSync(cyanJson)) return chalk.red("cyan.json is not found in the current directory!");
	const cyanConfigJs = path.resolve(cd, "cyan.config.js");
	if (!fs.existsSync(cyanConfigJs)) return chalk.red("cyan.config.js is not found in the current directory!");
	
	const cyanData: CyanTemplateData = JSON.parse(fs.readFileSync(cyanJson, 'utf8'));
	
	if (cyanData.key == null) return chalk.red("'key' field not found in cyan.json");
	if (cyanData.name == null) return chalk.red("'name' field not found in cyan.json");
	if (cyanData.repo == null) return chalk.red("'repo' field not found in cyan.json");
	if (cyanData.readme == null) return chalk.red("'readme' field not found in cyan.json");
	if (cyanData.email == null) return chalk.red("'email' field not found in cyan.json");
	//Verify Repository
	const repoValid = await RepoValid(cyanData.repo);
	if (!repoValid) return chalk.red(`Repository provided is not valid: ${cyanData.repo}`);
	//Verify readme
	if (!ReadMeValid(cyanData.readme)) return chalk.red(`Readme provided is not valid: ${cyanData.readme}`);
	//verify key
	if (!KeyValid(cyanData.key)) return chalk.red(`Key is not valid, only allow lower alphanumeric, '_' and '-': ${cyanData.key} `);
	//verify email
	if (!EmailValid(cyanData.email)) return chalk.red(`Email format invalid: ${cyanData.email}`);
	//verify name
	if (!NameValid(cyanData.name)) return chalk.red(`Name invalid, contains illegal characters. Only alphanumeric, '_', '-' amd spaces allowed: ${cyanData.name}`);
	
	const readMePath: string = path.resolve(cd, cyanData.readme);
	const readMeBinary = fs.readFileSync(readMePath);
	const templateData: TemplateData = {
		name: cyanData.name,
		key: cyanData.key,
		repo: cyanData.repo,
		email: cyanData.email,
		readme: Buffer.from(readMeBinary).toString('base64')
	};
	try {
		await dep.api.UpdateTemplate(templateData, secret);
		return chalk.greenBright(`Successfully pushed template ${templateData.key} to remote host!`);
	} catch (e) {
		return chalk.red(JSON.stringify(e.message));
	}
}

function NameValid(name: string): boolean {
	const regex = /^[a-z][a-z0-9_\-\s]{2,}$/i;
	return regex.test(name);
}


function KeyValid(key: string): boolean {
	const regex = /^[a-z][0-9a-z_]*$/;
	return regex.test(key);
}


function EmailValid(email: string): boolean {
	const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
	return emailRegexp.test(email);
}


async function RepoValid(repo: string): Promise<boolean> {
	const resp: Response = await fetch(repo, {method: "HEAD"});
	return resp.status === 200;
}

function ReadMeValid(readme: string): boolean {
	const readMePath: string = path.resolve(process.cwd(), readme);
	return fs.existsSync(readMePath);
}

export {PushTemplate, NameValid, KeyValid, EmailValid}
