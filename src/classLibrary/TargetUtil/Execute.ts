import {Cyan, IAutoInquire, IAutoMapper, IExecute} from "./CyanResponse";
import * as path from "path";
import chalk, {Chalk} from 'chalk';
import inquirer, {Inquirer} from 'inquirer';
import {spawn} from "child_process";
import {Core} from "@kirinnee/core";


class Execute implements IExecute {
	
	readonly currentPath: string;
	private readonly core: Core;
	private readonly auto: IAutoInquire;
	private readonly mapper: IAutoMapper;
	private readonly root: string;
	private readonly folderName: string;
	
	constructor(core: Core, folderName: string, root: string, abs: string, autoInquirer: IAutoInquire, autoMapper: IAutoMapper) {
		core.AssertExtend();
		this.core = core;
		this.currentPath = path.dirname(abs);
		this.auto = autoInquirer;
		this.root = root;
		this.mapper = autoMapper;
		this.folderName = folderName;
	}
	
	async call(p: string): Promise<Cyan> {
		let full = path.resolve(this.currentPath, p);
		let rel = path.relative(this.root, full).ReplaceAll("\\\\", "/");
		let execute: IExecute = new Execute(this.core, this.folderName, this.root, full, this.auto, this.mapper);
		let Template: (nameFolder: string, c: Chalk, inq: Inquirer, autoInquire: IAutoInquire, autoMap: IAutoMapper, execute: IExecute) => Promise<Cyan> = eval(`require("${rel}")`);
		return await Template(this.folderName.ReplaceAll("\\\\", "/").split("/").Last()!, chalk, inquirer, this.auto, this.mapper, execute);
	}
	
	async run(command: string | string[]): Promise<void> {
		if (!Array.isArray(command)) command = command.split(' ');
		if (!Array.isArray(command)) throw new Error("command has to be array of string of array");
		let c: string = command.shift()!;
		let v: string[] = command;
		return new Promise<void>((resolve: () => void, reject: (e: Error) => void) =>
			spawn(c, v, {stdio: "inherit", shell: true})
				.on("exit", (code: number) => {
					if (code === 0) {
						resolve();
					} else {
						reject(new Error("External command went wrong"));
					}
				})
		);
	}
	
}

export {Execute}
