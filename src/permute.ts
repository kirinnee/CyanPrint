import {GitSimulator} from "./classLibrary/GitSimulator";
import chalk from "chalk";
import {CyanSafe, IAutoInquire} from "./classLibrary/TargetUtil/CyanResponse";
import * as path from "path";
import {ExecuteCommandSimple, GenerateTemplate, Interrogate} from "./generator";
import {FakeInquirer} from "./classLibrary/Permute/FakeInquirer";
import {InquirerSpy} from "./classLibrary/Permute/InquirerSpy";
import {IPermuteManager, PermuteManager} from "./classLibrary/Permute/PermuteManager";
import {Bar} from "cli-progress";
import {GuidResolver} from "./classLibrary/ParsingStrategy/GuidResolver";
import * as fs from "fs";
import * as rimraf from "rimraf";
import {Dependency} from "./Depedency";

async function Concurrent<R>(array: any[], a: ((e) => Promise<R>)): Promise<R[]> {
	let prom: Promise<R>[] = [];
	array.Each(e => {
			let x = new Promise<R>(function (resolve) {
				a(e).then(function (r: R) {
					resolve(r);
				});
			});
			prom.push(x);
		}
	);
	return Promise.all(prom);
}


export async function Permute(dep: Dependency, git: boolean, copyNode: boolean, from: string, to: string): Promise<string> {
	let f: string = path.resolve(process.cwd(), from);
	if (git) {
		let gitSimulate: GitSimulator = new GitSimulator(dep.core);
		f = await gitSimulate.SimulateGit(process.cwd(), from);
		console.log(chalk.blueBright(f));
	}
	let ret = "";
	try {
		let fakeInquire: IAutoInquire = new FakeInquirer(dep.autoInquirer);
		let cyanSafe: { key: string, val: CyanSafe }[] = await Spy(dep, f, to);

		console.info(chalk.greenBright("Completed getting all permutations!"));
		let folders: string[] = cyanSafe.Map(c => path.join(c.key, c.val.npm || ""));

		cyanSafe.Each(c => c.val.docs.usage.git = false).Each(c => delete c.val.npm);

		let logs: string[] = await Concurrent(cyanSafe, (c: { key: string, val: CyanSafe }) => StealLogs(dep, f, c, fakeInquire, copyNode));
		let JSONLog: string = path.resolve(process.cwd(), to, "logs.json");
		let dest: string = path.resolve(process.cwd(), to, "logs.txt");
		dep.util.SafeWriteFile(dest, logs.join("\n\n"), false);
		let obj: Map<string, boolean[]>[] = cyanSafe
			.Map(e => e.val.flags)
			.Each(e => delete e["cyan.docs"])
			.Map(e => e.AsMap() as Map<string, boolean>)
			.Map((e: Map<string, boolean>) => e.MapValue(v => dep.core.WrapArray<boolean>(v) as boolean[]));

		dep.util.SafeWriteFile(JSONLog, JSON.stringify(
			obj.Reduce((a, b) => {
				let values: boolean[][] = a.Values().Map((e, i) => e.concat(b.Values()[i]));
				return a.Keys().Merge(values);
			}).AsObject()
		), false);
		let hasYarn = await ExecuteCommandSimple("yarn", ["-v"], "", true);
		if (hasYarn) {
			let s: boolean[] = await Concurrent(folders, (e => ExecuteCommandSimple("yarn", ["--prefer-offline"], e, true)));
			console.log(s);
		} else {
			let s: boolean[] = await Concurrent(folders, (e => ExecuteCommandSimple("npm", ["i"], e)));
			console.log(s);
		}
		
		ret = "Completed!";
	} catch (e) {
		ret = chalk.redBright(e);
	}
	if (git) {
		rimraf.sync(f);
	}
	return ret;
}

async function StealLogs(dep: Dependency, templatePath: string, settings: { key: string, val: CyanSafe }, autoInquire: IAutoInquire, copyNode: boolean): Promise<string> {
	let logger = console.log;
	let logs: string = "\n\n==== start ====\n\n";
	
	Bar.prototype.start = function () {};
	Bar.prototype.update = function () {};
	Bar.prototype.stop = function () {};
	Bar.prototype.getTotal = function () {};
	
	console.log = function (...args: any[]): any {
		
		//logger.apply(console, args);
		
		logs += (JSON.stringify(args) + "\n").Without([
			"\\u001b",
			"[91m",
			"[92m",
			"[93m",
			"[31m",
			"[39m",
			"[96m"
		]);
		logs += "\n";

	};

	let dest: string = settings.key;
	await GenerateTemplate(dep, templatePath, dest, settings.val, copyNode);
	logs += "\n==== end ====\n\n";
	let logFile: string = path.resolve(process.cwd(), dest, "cyanprint_logs.txt");
	let cyanDiagram: string = path.resolve(process.cwd(), dest, "cyanprint_tree.json");
	dep.util.SafeWriteFile(logFile, logs, false);
	dep.util.SafeWriteFile(cyanDiagram, JSON.stringify(settings.val, null, 4), false);
	console.log = logger;
	return logs;
}

async function Spy(dep: Dependency, f: string, to: string): Promise<{ key: string, val: CyanSafe }[]> {
	let permute: IPermuteManager = new PermuteManager(dep.core);
	let spyInquire: IAutoInquire = new InquirerSpy(dep.util, permute);
	
	let ret: { key: string, val: CyanSafe }[] = [];
	
	let flag = false;
	let count: number = 0;
	while (!permute.Completed() || !flag) {
		if (!flag) {
			permute.Start(true);
			flag = true;
		} else {
			permute.Start();
		}
		let guid: GuidResolver = new GuidResolver(dep.core);
		let dest: string = path.join(to, findPath(to, guid));
		let cyan: CyanSafe = await Interrogate(dep, spyInquire, f, dest);
		permute.End();
		ret.push({key: dest, val: cyan});
		count++;
	}
	console.log("Number of Permutations: " + count);
	return ret;
}

function findPath(to: string, guid: GuidResolver): string {
	let ret = guid.GenerateGuid();
	let check = path.resolve(process.cwd(), to, ret);
	if (fs.existsSync(check)) {
		return findPath(to, guid);
	}
	return ret;
}
