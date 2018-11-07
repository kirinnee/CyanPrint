let spawn = require('child_process').spawn;
let rimraf = require("rimraf"); 
let fs = require("fs");

//command will be the first argument
let command = process.argv[2];
//args will be the array of arguments after the commands
let args = process.argv.slice(3).map(s => s.substr(2) === "--" ? s.substr(1) : s).filter(s => s !== '-w' && s !== '-watch');
//This is a boolean as to whether --watch or -w been in the commands
let watch = process.argv.map(s => s.substr(2) === "--" ? s.substr(1) : s).filter(s => s === '-w' || s === "-watch").length > 0;

Execute(command, args, watch).then();

//The decision on what command to execute base on the arguments and whether watch exists
async function Execute(command, args, watch) {
    let coverage = args.filter(s => s === "--cover").length > 0; 
    switch (command) {
        case "wp":
            let wp = `webpack --config ./config/webpack.${args[0]}.ts`;
            if (watch) wp += " --watch";
            await run(wp);
            break;
        case "deploy":
            await run("node script test --cover");
            await run("node script wp dist");
            break;
        case "test":
            let mocha = `mocha -r ts-node/register --recursive ./test/**/*.spec.ts`;
            if (watch) mocha += " --watch-extensions ts --watch ";
            if (coverage) mocha = "nyc --nycrc-path ./config/.nycrc " + mocha; 
            if (fs.existsSync("./.nyc_output")) rimraf.sync("./.nyc_output"); 
            await run(mocha);
            break;
        case "publish":
            await run(`npm run deploy`);
            await run(`git add .`); 
            await run(`git commit -m "Preparing for next ${args[0]} version`); 
            await run(`npm version ${args[0]}`);
            await run(`npm publish`);
            break;
        default:
            console.log("Unknown command!");
            process.exit(1);
    }

}

//Executes the function as if its on the CMD. Exits the script if the external command crashes.
async function run(command) {
    if (!Array.isArray(command) && typeof command === "string") command = command.split(' ');
    else throw new Error("command is either a string or a string array");
    let c = command.shift();
    let v = command;

    let env = process.env;
    env.BROWSERSLIST_CONFIG= "./config/.browserslistrc";

    return new Promise((resolve) => spawn(c, v,
        {
            stdio: "inherit",
            shell: true,
            env: env
        })
        .on("exit", (code, signal) => {
            if (fs.existsSync("./.nyc_output")) rimraf.sync("./.nyc_output"); 
            if (code === 0) resolve();
            else {
                console.log("ExternalError:", signal);
                process.exit(1);
            }
        })
    );
}