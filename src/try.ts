import {GitSimulator} from "./classLibrary/GitSimulator";
import chalk from "chalk";
import {IAutoInquire, IAutoMapper} from "./classLibrary/TargetUtil/CyanResponse";
import {AutoMapper} from "./classLibrary/TargetUtil/AutoMapper";
import {AutoInquire} from "./classLibrary/TargetUtil/AutoInquire";
import * as path from "path";
import {Utility} from "./classLibrary/Utility";
import {GenerateTemplate, Interrogate} from "./generator";
import * as rimraf from "rimraf";


export async function Try(u: Utility, from: string, to: string, git: boolean, copyNode: boolean): Promise<string> {
	let f: string = path.resolve(process.cwd(), from);
	if (git) {
		let gitSimulate: GitSimulator = new GitSimulator(u.c);
		f = await gitSimulate.SimulateGit(process.cwd(), from);
		console.log(chalk.blueBright(f));
	}
	let ret = "";
	try {
		let autoMapper: IAutoMapper = new AutoMapper(u);
		let autoInquire: IAutoInquire = new AutoInquire(u, autoMapper);
		let cyanSafe = await Interrogate(u, __dirname, f, to, autoInquire, autoMapper);
		
		let logger = console.log;
		console.log = function (...args) {
			logger.apply(console, args);
		};
		
		ret = await GenerateTemplate(u, f, to, cyanSafe, autoMapper, autoInquire, copyNode);
		
	}
	catch (e) {
		ret = chalk.redBright(e);
	}
	if (git) {
		rimraf.sync(f);
	}
	return ret;
}