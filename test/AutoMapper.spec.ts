import {should} from 'chai';
import {Core, Kore} from '@kirinnee/core'
import {AutoMapper} from "../src/classLibrary/TargetUtil/AutoMapper";
import {Utility} from "../src/classLibrary/Utility";
import {IAutoMapper} from "../src/classLibrary/TargetUtil/CyanResponse";

should();


let core: Core = new Kore();
core.ExtendPrimitives();

let u: Utility = new Utility(core);
describe("AutoMapper", () => {
	let autoMapper: IAutoMapper = new AutoMapper(u);
	describe("JoinObjects", () => {
		it("should join object properties", () => {
			let a = {"a": "a", "b": "b"};
			let b = {"c": "c", "d": "d"};
			let expected = {"a": "a", "b": "b", "c": "c", "d": "d"};
			autoMapper.JoinObjects(a, b).should.deep.equal(expected);
		});
		
		it("should recursively join objects", () => {
			let a = {"a": "a", "b": {c: "c", d: "d"}};
			let b = {"c": "c", "d": {e: "e", f: "f"}};
			let expected = {"a": "a", "b": {c: "c", d: "d"}, "c": "c", "d": {e: "e", f: "f"}};
			autoMapper.JoinObjects(a, b).should.deep.equal(expected);
		});
		
		it("should join objects with sub-objects with different parts", () => {
			let a = {a: "a", c: {a: "a"}};
			let b = {b: "b", c: {b: "b"}};
			let expected = {a: "a", b: "b", c: {a: "a", b: "b"}};
			autoMapper.JoinObjects(a, b).should.deep.equal(expected);
		})
	});
	describe("ReverseLookUp", () => {
		it("should look for the first true value in flag object in map object for key", () => {
			let map = {a: "A", b: "B", c: "C", d: {e: "E", f: "F"}};
			let flag = {a: false, b: false, c: false, d: {e: true, f: false}};
			autoMapper.ReverseLoopUp(map, flag).should.deep.equal("E");
		});
	});
	
	describe("Overwrite", () => {
		it("should overwrite the from value in the to object", () => {
			let from = {a: "A", b: "B"};
			let to = {a: "a", b: "b", c: "c", d: "d"};
			let expected = {a: "A", b: "B", c: "c", d: "d"};
			autoMapper.Overwrite(from, to).should.deep.equal(expected);
		});
		
		it("should overwrite nest values", () => {
			let to = {
				a: "A",
				b: {
					c: "C",
					d: "D"
				}
			};
			let from = {
				a: "A",
				b: {
					e: "E",
					c: {
						b: "b"
					}
				}
			};
			let expected = {
				a: "A",
				b: {
					e: "E",
					c: {
						b: "b"
					},
					d: "D"
				}
			};
			autoMapper.Overwrite(from, to).should.deep.equal(expected);
		});
	});
	
});