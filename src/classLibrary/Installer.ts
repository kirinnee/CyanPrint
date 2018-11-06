import {GlobFactory} from "./GlobFactory";
import {Utility} from "./Utility";
import {IFileFactory} from "./RootFileFactory";
import {spawn} from 'child_process';
import {FileWriter} from "./FileWriter";
import {FileSystemInstance} from "./File";
import chalk from "chalk";
import path from "path";
import fs from "graceful-fs";
import glob from 'glob';
import rimraf from 'rimraf';
import {Core} from "@kirinnee/core";


export class Installer {
	readonly fileFactory: IFileFactory;
	readonly core: Core;
	private readonly util: Utility;
	private readonly writer: FileWriter;
	
	constructor(core: Core, fileFactory: IFileFactory, util: Utility, writer: FileWriter) {
		if (!core.IsExtended) throw new Error("Core needs to be extended!");
		this.fileFactory = fileFactory;
		this.core = core;
		this.util = util;
		this.writer = writer;
	}
	
	async Install(installationPath: string, copyNode: boolean): Promise<string> {
		if (this.IsGitLink(installationPath)) {
			return this.GitInstall(installationPath, copyNode);
		} else {
			return this.NormalInstall(installationPath, copyNode);
		}
	}
	
	private IsGitLink(link: string): boolean {
		return link.Take(8) === "https://" && path.extname(link) === ".git";
	}
	
	private async GitInstall(link: string, copyNode: boolean): Promise<string> {
		let i = this;
		let reply = await new Promise<string>(function (resolve) {
			spawn("git", ["clone", link, i.fileFactory.ToRoot],
				{
					stdio: "inherit",
					shell: true
				}).on("exit", () => {
				resolve(chalk.greenBright("Installation Completed"));
			});
		});
		if (!copyNode) {
			let pattern = path.resolve(i.fileFactory.ToRoot, "**/node_modules/");
			
			let promises: Promise<void>[] = [];
			
			glob.sync(pattern).Each((s: string) => {
				let p = new Promise<void>(function (resolve) {
					rimraf(s, function () {
						resolve();
					})
				});
				promises.push(p);
			});
			await Promise.all(promises);
		}
		rimraf.sync(path.resolve(i.fileFactory.ToRoot, ".git"));
		return reply;
	}
	
	
	private async NormalInstall(link: string, copyNode: boolean): Promise<string> {
		let targetDir = path.resolve(this.fileFactory.FromRoot, link);
		let targetFile = path.resolve(targetDir, "./cyan.config.js");
		if (!fs.existsSync(targetDir)) {
			return chalk.redBright("Cannot find path: " + targetDir);
		}
		if (!fs.existsSync(targetFile)) {
			return chalk.redBright("Cannot find cyan.config.js file in target folder: " + targetDir);
		}
		
		let glob = new GlobFactory(this.util, this.fileFactory);
		
		let fileSystemInstance = glob.GenerateFiles(link, '**/*.*')
			.Where((f: FileSystemInstance) => f.sourceAbsolutePath.Last(4) !== ".git")
			.Where((f: FileSystemInstance) => !f.sourceAbsolutePath.includes("node_modules") || copyNode)
			.Where((f: FileSystemInstance) => fs.lstatSync(f.sourceAbsolutePath).isFile() || !(path.extname(f.sourceAbsolutePath) === ".json" && f.sourceAbsolutePath.FileName() === "package-lock"));
		
		
		console.log(chalk.cyanBright("Installing... Please wait ;)"));
		
		fileSystemInstance = await glob.ReadFiles(fileSystemInstance);
		await this.writer.AWriteFile(fileSystemInstance);
		
		return chalk.greenBright("Installation Completed");
		
	}
}