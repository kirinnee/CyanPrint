import {Utility} from "../src/classLibrary/Utility";
import {Core, Kore, SortType} from "@kirinnee/core";
import {should} from 'chai';

should();

let core: Core = new Kore();
core.ExtendPrimitives();

let u: Utility = new Utility(core);
describe("Utility", () => {
	
	describe("Flatten String pair", () => {
		it("should flatten string pairs with multiple tiers", () => {
			let testSubject: object = {
				index: ["hello", "how are you?"],
				unbelievable: ["yup", "morning"],
				testFace: {
					test: ["test", "tick tock"],
					face: ["face", "la la la la"],
				},
				try: {
					really: {
						hard: ["to", "Hello"],
						get: {
							this: ["to work", "how are you?"]
						}
					}
				},
				package: {
					"@types/kirinnee": ["no!", "sleeping"]
				}
			};
			
			let expected = new Map<string, [string, string]>([
				["index", ["hello", "how are you?"]],
				["unbelievable", ["yup", "morning"]],
				["testFace.test", ["test", "tick tock"]],
				["testFace.face", ["face", "la la la la"]],
				["try.really.hard", ["to", "Hello"]],
				["try.really.get.this", ["to work", "how are you?"]],
				["package.@types/kirinnee", ["no!", "sleeping"]]
			]).SortByKey(SortType.AtoZ);
			
			let actual: Map<string, string | [string, string]> = u.FlattenMappable(testSubject).SortByKey(SortType.AtoZ);
			
			actual.Arr().should.deep.equal(expected.Arr());
		});
		
	});
	
	describe("Flatten Object", () => {
		it("should flatten object with multiple tiers", () => {
			let testSubject: object = {
				index: "hello",
				unbelievable: "yup",
				testFace: {
					test: "test",
					face: "face",
				},
				try: {
					really: {
						hard: "to",
						get: {
							this: "to work"
						}
					}
				},
				package: {
					"@types/kirinnee": "no!"
				}
			};
			
			let expected = new Map<string, string>([
				["index", "hello"],
				["unbelievable", "yup"],
				["testFace.test", "test"],
				["testFace.face", "face"],
				["try.really.hard", "to"],
				["try.really.get.this", "to work"],
				["package.@types/kirinnee", "no!"]
			]).SortByKey(SortType.AtoZ);
			
			let actual: Map<string, string> = u.FlattenObject(testSubject).SortByKey(SortType.AtoZ);
			
			actual.Arr().should.deep.equal(expected.Arr());
		});
		
	});
	
	describe("Flatten Flag Object", () => {
		
		it("should flatten object wit true false value into a map", () => {
			let testSubject: object = {
				index: true,
				unbelievable: true,
				testFace: {
					test: false,
					face: false,
				},
				try: {
					really: {
						hard: true,
						get: {
							this: false
						}
					}
				},
				package: {
					"@types/kirinnee": true
				}
			};
			
			let expected: [string, boolean][] = [
				["index", true],
				["unbelievable", true],
				["testFace.test", false],
				["testFace.face", false],
				["try.really.hard", true],
				["try.really.get.this", false],
				["package.@types/kirinnee", true]
			];
			expected = expected.Sort(SortType.AtoZ, (s: [string, boolean]) => s["0"]);
			let actual: [string, boolean][] =
				u.FlattenFlagObject(testSubject).Arr()
					.Sort(SortType.AtoZ, (s: [string, boolean]) => s["0"]);
			expected.should.deep.equal(actual);
			
		});
		
	});
});
