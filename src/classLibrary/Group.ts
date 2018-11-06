import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import glob from 'glob';
import rimraf from 'rimraf';
import {Core} from "@kirinnee/core";

export class Group {
	
	private readonly templateRoot: string;
	
	constructor(core: Core, templateRoot: string) {
		if (!core.IsExtended) throw "Core needs to be extended!";
		this.templateRoot = templateRoot;
	}
	
	Create(dir: string): string {
		if (this.Exist(dir)) {
			return chalk.redBright("The Group " + chalk.yellowBright(dir) + " already exist!");
		} else {
			let full: string = path.resolve(this.templateRoot, dir);
			fs.mkdirSync(full);
			return chalk.greenBright("the Group " + chalk.yellowBright(dir) + " has been created!");
		}
	}
	
	Delete(dir: string): string {
		if (this.Exist(dir)) {
			let full: string = path.resolve(this.templateRoot, dir);
			rimraf.sync(full);
			return chalk.greenBright("the Group " + chalk.yellowBright(dir) + " has been deleted!");
		} else {
			return chalk.redBright("The Group " + chalk.yellowBright(dir) + " does not exist!");
		}
	}
	
	Exist(dir: string): boolean {
		let full: string = path.resolve(this.templateRoot, dir);
		return fs.existsSync(full);
	}
	
	ListAsArray(): string[] {
		let pattern = path.resolve(this.templateRoot, "*/");
		
		return glob.sync(pattern, {ignore: "**/*.*"})
			.Map((s: string) => s.split('/').pop()!)
			.Map((s: string) => s);
	}
	
	List(): string {
		return this.ListAsArray()
			.Map((s: string) => s.ReplaceAll('_', ' ').ReplaceAll('-', ' '))
			.Map((s: string) => chalk.blueBright(s))
			.join('\n');
	}
	
	
}

