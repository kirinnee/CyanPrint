import {should} from 'chai';
import {Core, Kore} from "@kirinnee/core";
import {EmailValid, KeyValid, NameValid} from "../src/push";

should();
let core: Core = new Kore();
core.ExtendPrimitives();

describe("Push Validation", () => {
	describe("email", () => {
		it("should allow email format", () => {
			EmailValid("ernest@gmail.com").should.be.true;
		});
		
		it("should return false if empty before @ sign", () => {
			EmailValid("@gmail.com").should.be.false;
		});
		
		it("should return false if no @ sign is found", () => {
			EmailValid("gmail.com").should.be.false;
		});
		
		it("should return false if nothing is behind @ sign", () => {
			EmailValid("ernest@").should.be.false;
		});
	});
	
	describe("key", () => {
		it("should allow values that are alphanumeric lower and spaces", () => {
			KeyValid('a').should.be.true;
			KeyValid('azurekey').should.be.true;
			KeyValid('azure_key').should.be.true;
			KeyValid('azure_key_11').should.be.true;
		});
		
		it("should not allow it to start with numeric value", () => {
			KeyValid('1').should.be.false;
			KeyValid('2key').should.be.false;
		});
		
		it('should not allow special characters', () => {
			KeyValid('azure*key').should.be.false;
			KeyValid('azurekey!').should.be.false;
		});
		
		it('should not allow - ', () => {
			KeyValid('azure-key').should.be.false;
			KeyValid('azure-1').should.be.false;
		});
		
		it('should not allow upper-case', () => {
			KeyValid('Azure_key').should.be.false;
			KeyValid('azureKey').should.be.false;
		});
	});
	
	describe("name", () => {
		it('should allow alphabet, numbers, spaces, dash, underscore and spaces', function () {
			NameValid("Some Cool Name").should.be.true;
			NameValid("Very Cold Name").should.be.true;
			NameValid("under_score_case").should.be.true;
			NameValid("Dash-case").should.be.true;
			NameValid("with-1-2-numbers").should.be.true;
		});
		
		it("should not start with number", () => {
			NameValid('1-starts-with-number').should.be.false;
			NameValid('1key').should.be.false;
		});
		
		it('should not contain special character', () => {
			NameValid('Kira*').should.be.false;
			NameValid('Hey!').should.be.false;
			NameValid('comma,comma').should.be.false;
		});
		
		it('should not allow name 2 character or shorter', () => {
			NameValid('hi').should.be.false;
			NameValid('Ab').should.be.false;
		});
	});
});

