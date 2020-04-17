import {Cyan, CyanSafe} from "../TargetUtil/CyanResponse";
import {Core} from "@kirinnee/core";

class CyanParser {

    private readonly core;

    constructor(core: Core) {
        this.core = core;
    }

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
            guid: [],
            commands: [],
        };

        if (cyan.docs != null) def.docs = cyan.docs;
        if (cyan.npm !== null) {
            if (typeof cyan.npm === "string") {
                def.npm = cyan.npm;
            } else if (cyan.npm === true) {
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
        if (cyan.guid != null) {
            def.guid = cyan.guid;
        }
        if (cyan.commands != null) {
            def.commands = this.core.WrapArray(cyan.commands);
        }
        return def;
    }

}

export {CyanParser};
