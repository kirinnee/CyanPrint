import {Dependency} from "./Depedency";
import {Group} from "./classLibrary/Group";
import path from "path";
import chalk from "chalk";
import {Template} from "./classLibrary/Template";
import rimraf = require("rimraf");

async function RemoveTemplate(dep: Dependency, key: string, group: string): Promise<string> {
	const g: Group = new Group(dep.core, dep.objex, path.resolve(__dirname, '../templates'), dep.util);
	if (!g.Exist(group)) return chalk.red(`Group ${chalk.cyanBright(key)} does not exist!`);
	const template: Template = new Template(group, key, "", "", g);
	if (!template.Exist()) return chalk.red(`Template ${chalk.cyanBright(key)} does not exist within Group ${chalk.cyanBright(group)}`);
	const sure = await dep.autoInquirer.InquirePredicate(`Are you sure you want to remove ${key} from Group ${group}? This cannot be undone.`);
	if (!sure) return "User cancelled";
	rimraf.sync(template.Target);
	template.DeleteGroupEntry();
	return chalk.greenBright("Template successfully deleted");
}

export {RemoveTemplate}
