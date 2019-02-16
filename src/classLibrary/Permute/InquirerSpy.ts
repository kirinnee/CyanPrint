import {DocData, DocQuestions, Documentation, DocUsage, IAutoInquire, License} from "../TargetUtil/CyanResponse";
import {Utility} from "../Utility";
import {IPermuteManager} from "./PermuteManager";

const enum Permutes {
	ALL = 1,
	NONE = 2,
	RANDOM = 3
}

class InquirerSpy implements IAutoInquire {
	
	private u: Utility;
	private p: IPermuteManager;
	
	constructor(util: Utility, permute: IPermuteManager) {
		this.u = util;
		this.p = permute;
	}
	
	InquireAsCheckBox(flags: object, question: string): Promise<object> {
		let choices: Map<string, string> = this.u.FlattenObject(flags);
		//let key: string = choices.Keys().Random()!;
		let v = this.u.MapToObject(choices.MapValue(() => true));
		return Promise.resolve(v);
		// let choice: 1 | 2  = this.p.GetChoice([1, 2]) as 1 | 2;
		// let ret: object = this.MakeChoice(flags, choice);
		// //console.log( this.u.FlattenFlagObject(ret).Arr().Where(e => e[1]).Map(e=>e[0]));
		//
		// return Promise.resolve(ret);
	}
	
	InquireAsList(flags: object, question: string): Promise<object> {
		let choice: number = this.p.GetChoice(this.u.FlattenObject(flags).Values().Map((e, i) => i));
		let kp: [string, boolean][] = this.u.FlattenObject(flags).Arr().Map((e, i) => [e[0], i === choice] as [string, boolean]);
		let ret: object = this.u.MapToObject(new Map(kp));
		//console.log(kp.Where(e => e[1]).Map(e=>e[0]));
		return Promise.resolve(ret);
	}
	
	InquireAsPredicate(flags: object): Promise<object> {
		let choices: Map<string, string> = this.u.FlattenObject(flags);
		let key: string = choices.Keys().Random()!;
		let v = this.u.MapToObject(choices.MapValue((v, k) => k === key));
		return Promise.resolve(v);
		// let choice: 1|2 = this.p.GetChoice([1,2]) as 1|2;
		// let ret:object = this.MakeChoice(flags, choice);
		// //console.log( this.u.FlattenFlagObject(ret).Arr().Where(e => e[1]).Map(e=>e[0]));
		// return Promise.resolve(ret);
	}
	
	InquireDocument(docList: DocQuestions): Promise<Documentation> {
		let usage: DocUsage = {
			semVer: true,
			contributing: true,
			readme: true,
			git: true,
			license: true
		};
		
		let data: DocData = {
			author: "kirinnee97",
			email: "kirinnee97@gmail.com",
			gitURL: "https://github.com/kirinnee",
			licenseType: "MIT",
			years: "2018",
			projectName: "CyanPrintPermuateTest",
			description: "Permutation Test"
		};
		
		return Promise.resolve({
			data: data,
			usage: usage
		} as Documentation);
	}
	
	InquireInput(object: object): Promise<object> {
		return Promise.resolve(this.SetDefault(object));
	}
	
	
	InquireLicense(inquireAuthor?: boolean, inquireYear?: boolean): Promise<License> {
		return Promise.resolve({
			type: "MIT",
			author: "kirinnee97@gmail.com",
			year: "2018"
		} as License);
	}
	
	InquirePredicate(question: string, yes: string = "Yes", no: string = "No"): Promise<boolean> {
		let choices: boolean = this.p.GetChoice([0, 1]) === 0;
		//console.log( choices ? yes : no);
		return Promise.resolve(choices);
	}
	
	MakeChoice(obj: object, type: Permutes): object {
		let choices: Map<string, string> = this.u.FlattenObject(obj);
		switch (type) {
			case Permutes.ALL:
				return this.u.MapToObject(choices.MapValue(() => true));
			case Permutes.NONE:
				return this.u.MapToObject(choices.MapValue(() => false));
			case Permutes.RANDOM:
				let key: string = choices.Keys().Random()!;
				return this.u.MapToObject(choices.MapValue((v, k) => k === key));
		}
	}
	
	private SetDefault(input: object): object {
		let ret: any = {};
		for (let k in input) {
			if (input.hasOwnProperty(k)) {
				let val: string | [string, string] | object = input[k];
				if (typeof val === "string") {
					ret[k] = val;
				} else if (typeof val === "object") {
					if (this.u.c.IsArray(val) && (val as string[]).length === 2) {
						ret[k] = val[0];
					} else {
						ret[k] = this.SetDefault(val);
					}
				}
			}
		}
		return ret as object;
	}
	
	
}

export {InquirerSpy};