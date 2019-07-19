import {Utility} from "../Utility";
import * as inquirer from "inquirer";
import {Question} from "inquirer";
import {DocData, DocQuestions, Documentation, DocUsage, IAutoInquire, IAutoMapper, License} from "./CyanResponse";
import {Core} from "@kirinnee/core";

class AutoInquire implements IAutoInquire {
	
	readonly u: Utility;
	readonly autoMapper: IAutoMapper;
	private readonly c: Core;
	
	constructor(util: Utility, autoMapper: IAutoMapper) {
		this.u = util;
		this.c = util.c;
		this.autoMapper = autoMapper;
	}
	
	async InquirePredicate(question: string, yes: string = "Yes", no: string = "No"): Promise<boolean> {
		let answer: { [s: string]: string } = await inquirer.prompt([{
			type: "list",
			choices: [yes, no],
			name: "predicate",
			message: question
		}]);
		return answer["predicate"] === yes;
	}
	
	async InquireInput(object: object): Promise<object> {
		let map: Map<string, [string, string] | string> = this.u.FlattenMappable(object);
		let questions: Question[] = map
			.Map((key: string, value: [string, string] | string) => this.MakeInputQuestion(key, value));
		return await inquirer.prompt(questions);
	}
	
	async InquireAsCheckBox(flags: object, question: string): Promise<object> {
		let map: Map<string, string> = this.u.FlattenObject(flags);
		let questions: Question = {
			type: "checkbox",
			name: "selected",
			message: question,
			choices: map.Values()
		};
		let answers = await inquirer.prompt([questions]);
		let flagMap: Map<string, boolean> = map.MapValue((v: string) => (answers["selected"] as string[]).Has(v));
		let ret: object = {};
		flagMap.Each((k: string, v: boolean) => {
			let dot: string[] = k.split('.');
			this.SetValue(ret, dot, v);
		});
		return ret;
	}
	
	async InquireAsList(flags: object, question: string): Promise<object> {
		let map: Map<string, string> = this.u.FlattenObject(flags);
		let questions: Question = {
			type: "list",
			name: "selected",
			message: question,
			choices: map.Values()
		};
		let answers = await inquirer.prompt([questions]);
		let flapMap: Map<string, boolean> = map.MapValue((v: string) => answers["selected"] === v);
		let ret: object = {};
		flapMap.Each((k: string, v: boolean) => {
			let dot: string[] = k.split('.');
			this.SetValue(ret, dot, v);
		});
		return ret;
	}
	
	async InquireAsPredicate(flags: object): Promise<object> {
		let map: Map<string, string> = this.u.FlattenObject(flags);
		let questions: Question[] = map.Map((k: string, v: string) => this.MakePredicateQuestion(k, v));
		let answers = await inquirer.prompt(questions);
		return this.ConvertToBoolean(answers);
	}
	
	
	async InquireDocument(q: DocQuestions): Promise<Documentation> {
		let questions: object = {};
		let retUsage: DocUsage = {
			license: false,
			contributing: false,
			semVer: false,
			git: false,
			readme: false
		};
		
		let fillQuestion = function (val: boolean | undefined, key: string, question: string) {
			if (typeof val === "boolean" && val) {
				retUsage[key] = true;
			} else if (typeof val === "boolean" && !val) {
				questions[key] = question;
			}
		};
		
		fillQuestion(q.license, "license", "Open Source License");
		fillQuestion(q.contributing, "contributing", "CONTRIBUTING.MD");
		fillQuestion(q.semVer, "semVer", "Semantic Versioning");
		fillQuestion(q.git, "git", "Initialize Git Repository");
		fillQuestion(q.readme, "readme", "README.MD");
		
		let ask: boolean = false;
		for (let k in questions) {
			if (questions.hasOwnProperty(k)) {
				let q: string = questions[k];
				if (this.c.IsString(q)) {
					ask = true;
					break;
				}
			}
		}
		
		if (ask) {
			let docsToUse: object = await this.InquireAsCheckBox(questions, "Which documentation do you want to include?");
			retUsage = this.autoMapper.Overwrite(docsToUse, retUsage) as DocUsage;
		}
		
		
		let varQuestions: object = {};
		
		if (retUsage.readme || retUsage.contributing || retUsage.license || retUsage.git) varQuestions["author"] = ["kirinnee", "Please enter your name"];
		if (retUsage.readme || retUsage.contributing || retUsage.git) varQuestions["email"] = ["kirinnee@gmail.com", "Please enter your email"];
		if (retUsage.git) varQuestions["gitURL"] = ["https://github.com/kirinnee/", "Please enter your remote repository URL"];
		if (retUsage.readme) {
			varQuestions["projectName"] = ["A CyanPrint Project", "Please enter your project name"];
			varQuestions["description"] = ["A Project Made with CyanPrint", "Please enter your project description"];
		}
		let variables: DocData = await this.InquireInput(varQuestions) as DocData;
		if (retUsage.license) {
			let lic: License = await this.InquireLicense(false, true);
			variables.licenseType = lic.type;
			variables.years = lic.year;
		}
		return {
			data: variables,
			usage: retUsage
		}
		
	}
	
	async InquireLicense(inquireAuthor: boolean = true, inquireYear: boolean = true): Promise<License> {
		let ap2 = "Apache License 2.0";
		let gpl3 = "GNU General Public License v3.0";
		let isc = "ISC License";
		let mit = "MIT License";
		
		//Map licenses to questions
		let map: Map<string, string> = new Map([
			[ap2, "Apache-2.0"],
			[gpl3, "GPL-3.0"],
			[isc, "ISC"],
			[mit, "MIT"]
		]);
		
		//Ask for license
		let answers: object = await inquirer.prompt([
			{
				type: "list",
				message: "Which Open Source License do you want to use?",
				name: "license",
				choices: [ap2, gpl3, isc, mit]
			}
		]);
		let type: string = map.get(answers["license"])!;
		let ret: License = {
			type: type as "GPL-3.0" | "MIT" | "ISC" | "Apache-2.0",
			author: "",
			year: ""
		};
		//Check if user wants to prompt for author and year
		let iAuthor: Question = {
			type: "input",
			message: "Who is this licensed to?",
			name: "author",
		};
		
		let iYear: Question = {
			type: "input",
			message: "Which year did the copyright start?",
			name: "year",
		};
		//List of questions
		let q: Question[] = [];
		if (inquireAuthor) q.push(iAuthor);
		if (iYear) q.push(iYear);
		
		if (q.length > 0) {
			let data: object = await inquirer.prompt(q);
			if (data["year"] != null) ret.year = data["year"];
			if (data["author"] != null) ret.year = data["author"];
		}
		
		return ret;
	}
	
	SetValue(obj: object, dot: string[], value: any) {
		if (dot.length === 1) {
			obj[dot[0]] = value;
		} else {
			if (typeof obj[dot[0]] === "undefined") {
				obj[dot[0]] = {};
			}
			this.SetValue(obj[dot[0]], dot.Skip(1), value);
		}
	}
	
	private ConvertToBoolean(answers: object): object {
		let ret: object = {};
		for (let k in answers) {
			if (answers.hasOwnProperty(k)) {
				let ans = answers[k];
				if (typeof ans === "string") {
					ret[k] = ans === "Yes";
				} else if (typeof ans === "object") {
					ret[k] = this.ConvertToBoolean(ans);
				} else {
					throw new Error("Unknown type, has to be either string or object");
				}
			}
		}
		return ret;
	}
	
	private MakePredicateQuestion(key: string, value: string): Question {
		return {
			type: "list",
			name: key,
			message: value,
			choices: ["Yes", "No"]
		} as Question;
	}
	
	private MakeInputQuestion(key: string, value: [string, string] | string): Question {
		if (typeof value === "string") {
			return {
				type: "input",
				message: key.ReplaceAll(".", " ").CapitalizeWords(),
				name: key,
				default: value
			} as Question;
		} else {
			let question = value[1];
			let def = value[0];
			return {
				type: "input",
				message: question,
				name: key,
				default: def
			} as Question;
		}
		
	}
	
}


export {AutoInquire}