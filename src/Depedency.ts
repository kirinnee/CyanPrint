import {Core} from "@kirinnee/core";
import {Utility} from "./classLibrary/Utility";
import {ApiSdk} from "./classLibrary/sdk/ApiSdk";
import {IAutoInquire, IAutoMapper} from "./classLibrary/TargetUtil/CyanResponse";
import {Objex} from "@kirinnee/objex";

interface Dependency {
	core: Core,
	objex: Objex,
	util: Utility,
	api: ApiSdk;
	autoInquirer: IAutoInquire
	autoMapper: IAutoMapper
}

export {Dependency}
