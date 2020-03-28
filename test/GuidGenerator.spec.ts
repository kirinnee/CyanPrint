import {should} from 'chai';
import {Core, Kore} from '@kirinnee/core'
import {GuidGenerator} from "../src/classLibrary/GuidGenerator";

should();


let core: Core = new Kore();
core.ExtendPrimitives();

const gg = new GuidGenerator(core);

describe("GuidGenerator", () => {
    describe("GenerateGuid", () => {
		it("should generate new guid", () => {
			let testSubject = gg.GenerateGuid();
			gg.IsGuid(testSubject).should.be.true;
		});
    });
});