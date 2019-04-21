import {GitSimulator} from "./classLibrary/GitSimulator";
import chalk from "chalk";
import * as path from "path";
import {GenerateTemplate, Interrogate} from "./generator";
import * as rimraf from "rimraf";
import {Dependency} from "./Depedency";


export async function Try(dep: Dependency, from: string, to: string, git: boolean, copyNode: boolean): Promise<string> {
	let f: string = path.resolve(process.cwd(), from);
	if (git) {
		let gitSimulate: GitSimulator = new GitSimulator(dep.core);
		f = await gitSimulate.SimulateGit(process.cwd(), from);
		console.log(chalk.blueBright(f));
	}
	let ret = "";
	try {
		let cyanSafe = await Interrogate(dep, dep.autoInquirer, f, to);
		
		let logger = console.log;
		console.log = function (...args) {
			logger.apply(console, args);
		};
		
		ret = await GenerateTemplate(dep, f, to, cyanSafe, copyNode);
		
	} catch (e) {
		ret = chalk.redBright(e);
	}
	if (git) {
		rimraf.sync(f);
	}
	return ret;
}
