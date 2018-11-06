import {Utility} from "../Utility";
import {IAutoMapper} from "./CyanResponse";

class AutoMapper implements IAutoMapper {
	
	private readonly util: Utility;
	
	constructor(util: Utility) {
		this.util = util;
	}
	
	/**
	 * Join multiple object into a single object
	 * @param b - any amount of objects
	 * @constructor
	 */
	JoinObjects(...b: object[]): object {
		let ret: any = {};
		b.Each((o: any) => {
			for (let k in o) {
				if (o.hasOwnProperty(k)) {
					if (typeof ret[k] === "object") {
						ret[k] = this.JoinObjects(o[k], ret[k]);
					} else {
						ret[k] = o[k];
					}
				}
			}
		});
		return ret;
	}
	
	ReverseLoopUp(map: object, flags: object): string {
		let flagsMap = this.util.FlattenFlagObject(flags);
		let mapMap = this.util.FlattenObject(map);
		let keyArr: string[] = flagsMap.Where((k: string, v: boolean) => v).Keys();
		let key: string = keyArr[0];
		return mapMap.get(key)!;
	}
	
	Overwrite(from: any, to: any): object {
		for (let k in from) {
			if (from.hasOwnProperty(k)) {
				if (typeof to[k] === "object") {
					to[k] = this.Overwrite(from[k], to[k]);
				} else {
					to[k] = from[k];
				}
			}
		}
		return to;
	}
	
}

export {AutoMapper}