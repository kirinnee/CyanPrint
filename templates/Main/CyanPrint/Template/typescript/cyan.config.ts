import {Chalk} from "chalk";
import {Inquirer} from "inquirer";
import {Cyan, IAutoInquire, IAutoMapper, IExecute,} from "./Typings";

export = async function (folderName: string, chalk: Chalk, inquirer: Inquirer, autoInquirer: IAutoInquire, autoMap: IAutoMapper, execute: IExecute): Promise<Cyan> {
	console.log(folderName, chalk, inquirer, autoInquirer, autoMap, execute);
	return {
		globs: {root: "./Template", pattern: "**/*.*", ignore: ""},
	} as Cyan;
}
