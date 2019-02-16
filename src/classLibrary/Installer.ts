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
		core.AssertExtend();
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
			spawn("git", ["clone", `"${link}"`, `"${i.fileFactory.ToRoot}"`],
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
		/*
		 
		 I’m writing to express my wholehearted support for Ernest’s application to your university. I am the director of DAB Technology Pte Ltd,
		 a Singapore Enterprise that boast to be the sole distributor of vacuum products in Asia Pacific.
		 
		 Ernest was hired through the recommendation of my son as a Software Engineer. At first, I had doubts to hand the upgrade of a digital
		 platform to a student who has no entered university – it was an upgrade from a website made by a professional software firm. However,
		 I was pleasantly surprised by the result. Just within a couple of weeks, Ernest led his team and rolled out two new product sites and
		 eCommerce functionality, just in time for an upcoming exhibition.
		 
		 Ernest's most impressive trait is perhaps his professionalism. Shortly after the exhibition, Ernest proposed to change our technology
		 infrastructure. Immediately I inquired for the benefit of such an action, expecting answers such as security or performance benefits.
		 Instead, Ernest explained about that the current infrastructure and design is fragile and rigid. To facilitate maintenance, future
		 changes and faster test cycles, Ernest said it is a programmer's responsibility to not only make sure every line of code works, but
		 it must also be provable and easily understood by others.
		 
		 Instead of taking advantage of his technical literacy, Ernest showed high level of professionalism by striving to achieve a stable and
		 
		 
		 
		 */
	}
}