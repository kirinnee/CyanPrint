import {Core, Kore} from "@kirinnee/core"; 
import {Shape} from "./classLibrary/Shape";
import {Rectangle} from "./classLibrary/Rectangle";
import program from "commander"; 
import * as inquirer from "inquirer"; 
import chalk from "chalk"; 

let core:Core = new Kore();
core.ExtendPrimitives();

program
	.version("0.0.1")
	.description("CyanPrint is a scaffolding CLI for people to create templates or blueprints to scaffold commonly used ");

program.parse(process.argv);

let rect: Shape = new Rectangle(5,12);

let info:string = rect.area + " : " + rect.parameter();
print = chalk.cyan(info); 
console.log(info);

Program().then();

async function Program(){
	let answer:any  = await inquirer.prompt([
		{
			type: "input",
			message: "What's your name~?",
			name: "name"
		}
	]);
	let name:string = answer.name;
	name = name.CapitalizeWords(); 
	name = chalk.redBright(name); 
	console.log("Hello",name,"!");
	
	console.log("End of program~");
}