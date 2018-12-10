import * as path from "path";
import * as fs from "fs";
import {spawn} from "child_process";
import chalk from "chalk";
import {Core} from "@kirinnee/core";
import rimraf = require("rimraf");


class GitSimulator {
	
	constructor(core: Core) {
		core.AssertExtend();
	}
	
	async SimulateGit(root: string, file: string): Promise<string> {
		//Create TempFolder
		let tempPath = this.lookForEmptyFolder(root);
		let oriPath = path.resolve(root, file);
		try {
			await this.Execute(`git clone "${oriPath}" "${tempPath}"`);
		}
		catch (e) {
			console.log(chalk.redBright(e));
			rimraf.sync(tempPath);
		}
		return tempPath;
		
	}
	
	private lookForEmptyFolder(root: string, temp: string = "~temp") {
		let folder = path.resolve(root, temp);
		if (fs.existsSync(folder)) {
			return this.lookForEmptyFolder(root, temp + (0).RandomFor(9));
		} else {
			fs.mkdirSync(folder);
			return folder;
		}
	}
	
	private async Execute(cmd: string): Promise<void> {
		let command: string[] = cmd.split(' ');
		
		let c: string = command.shift()!;
		let v: string [] = command;
		return new Promise<void>((resolve, reject) =>
			spawn(c, v, {stdio: "inherit", shell: true})
				.on("exit", (code) => {
					if (code === 0) {
						resolve();
					} else {
						reject(
							new Error("External command went wrong")
						);
					}
				})
		);
	}
	
}

export {GitSimulator};