import {Cyan, CyanSafe} from "../TargetUtil/CyanResponse";

class CyanParser {
	
	constructor() {}
	
	Save(cyan: Cyan): CyanSafe {
		let def: CyanSafe = {
			docs: {
				data: {},
				usage: {license: false, git: false, readme: false, contributing: false, semVer: false}
			},
			npm: null,
			globs: [],
			variable: {},
			flags: {},
			guid: []
		};
		if (cyan.docs != null) def.docs = cyan.docs;
		if (cyan.npm != null) {
			if (typeof cyan.npm === "string") {
				def.npm = cyan.npm;
			} else {
				def.npm = "./";
			}
		}
		if (cyan.globs != null) {
			if (Array.isArray(cyan.globs)) {
				def.globs = cyan.globs;
			} else {
				def.globs = [cyan.globs];
			}
		}
		if (cyan.variable != null) def.variable = cyan.variable;
		if (cyan.flags != null) def.flags = cyan.flags;
		if (cyan.comments != null) {
			if (Array.isArray(cyan.comments)) {
				def.comments = cyan.comments
			} else {
				def.comments = [cyan.comments]
			}
		}
		return def;
	}
	
}

export {CyanParser};