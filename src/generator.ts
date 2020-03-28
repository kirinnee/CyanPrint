import {
    Contributing,
    Cyan,
    CyanSafe,
    Git,
    Glob,
    IAutoInquire,
    IAutoMapper,
    License
} from "./classLibrary/TargetUtil/CyanResponse";
import path from "path";
import {IFileFactory, SimpleFileFactory} from "./classLibrary/RootFileFactory";
import * as fs from "fs";
import chalk, {Chalk} from "chalk";
import rimraf from "rimraf";
import {DocumentParser} from "./classLibrary/SpecialParser/DocumentParser";
import {GlobFactory} from "./classLibrary/GlobFactory";
import {ParsingStrategy} from "./classLibrary/ParsingStrategy/ParsingStrategy";
import {GuidResolver} from "./classLibrary/ParsingStrategy/GuidResolver";
import {IfElseResolver} from "./classLibrary/ParsingStrategy/IfElseResolver";
import {InverseIfElseResolver} from "./classLibrary/ParsingStrategy/InverseIfElseResolver";
import {InlineFlagResolver} from "./classLibrary/ParsingStrategy/InlineFlagResolver";
import {InverseInlineFlagResolver} from "./classLibrary/ParsingStrategy/InverseInlineFlagResolver";
import {VariableResolver} from "./classLibrary/ParsingStrategy/VariableResolver";
import {MoveResolver} from "./classLibrary/ParsingStrategy/MoveResolver";
import {PackageResolver} from "./classLibrary/ParsingStrategy/PackageResolver";
import {Parser} from "./classLibrary/Parser";
import {LicenseResolver} from "./classLibrary/SpecialParser/LicenseResolver";
import {ContributingResolver} from "./classLibrary/SpecialParser/ContributingParser";
import {FileSystemInstance} from "./classLibrary/File";
import {FileWriter} from "./classLibrary/FileWriter";
import {Execute} from "./classLibrary/TargetUtil/Execute";
import {CyanParser} from "./classLibrary/SpecialParser/CyanParser";
import inquirer, {Inquirer} from "inquirer";
import {spawn} from "child_process";
import {Dependency} from "./Depedency";
import {GuidGenerator} from "./classLibrary/GuidGenerator";


export async function GenerateTemplate(dep: Dependency, templatePath: string, folderName: string, settings: CyanSafe, copyNode: boolean): Promise<string> {

    //Generate baseline file fileFactory with To and From reading settled
    let to: string = path.resolve(process.cwd(), folderName);
    let fileFactory: IFileFactory = new SimpleFileFactory(dep.core, templatePath, to);

    //Check if the target path is empty
    if (fs.existsSync(to)) {
        let del = await dep.autoInquirer.InquirePredicate("There is an existing folder " + chalk.yellowBright(folderName) + ", do you want do delete that folder and proceed?");
        if (!del) return chalk.redBright("Template creation has been halted");
        console.log(chalk.cyanBright("Please wait..."));
        rimraf.sync(to);
        console.log(chalk.greenBright("Deletion has been completed!"));
    }

    //Setup DocumentParser for future usage
    let docParser: DocumentParser = new DocumentParser(settings.docs);


    console.log(chalk.cyanBright("Preparing template, please wait..."));
    //Setup GlobFactory to read streams
    let globFactory: GlobFactory = new GlobFactory(dep.util, fileFactory);



    //Create all relevant parsing strategy
    let strategies: ParsingStrategy[] = [
        new GuidResolver(dep.core, new GuidGenerator(dep.core)),
        new IfElseResolver(dep.util),
        new InverseIfElseResolver(dep.util),
        new InlineFlagResolver(dep.util, settings.comments),
        new InverseInlineFlagResolver(dep.util, settings.comments),
        new VariableResolver(dep.util),
        new MoveResolver(dep.util),
        new PackageResolver(dep.util)
    ];

    let parser: Parser = new Parser(dep.util, strategies, settings);

    //Special Parsing Strategies
    let licenseParser: LicenseResolver = new LicenseResolver(new VariableResolver(dep.util));
    let contributingParser: ContributingResolver = new ContributingResolver(dep.core);

    console.log(chalk.greenBright("Preparation done!"));
    console.log(chalk.cyanBright("Performing variable and flag scans..."));


    //Obtain all globs
    let files: FileSystemInstance[] = settings.globs.Map((g: Glob) => globFactory.GenerateFiles(g.root, g.pattern, g.ignore)).Flatten();
    if (!copyNode) files = files.Where((f: FileSystemInstance) => !f.sourceAbsolutePath.includes("node_modules"));

    //remove package.lock
    files = files.Where(f => f.sourceAbsolutePath.ReplaceAll("\\\\", "/").split("/").Last()! !== "package-lock.json")
        .Where(f => f.sourceAbsolutePath.ReplaceAll("\\\\", "/").split("/").Last()! !== "yarn.lock");


    //Add in the cyan.docs flag
    settings.flags = dep.autoMapper.JoinObjects(settings.flags, docParser.GetAllFlags());
    settings.variable = dep.autoMapper.JoinObjects(settings.variable, docParser.GetVariables());

    //Set the folder name in
    let fn: object = {cyan: {folder: {name: folderName.ReplaceAll("\\\\", "/").split("/").Last()!}}};
    settings.variable = dep.autoMapper.JoinObjects(settings.variable, fn);

    //Generate flag counting data structures
    parser.CountFiles(files);

    //files all the name that are removed before starting to read
    files = parser.ParseFiles(files);

    //Read file asynchronously
    files = await globFactory.ReadFiles(files);

    //Add license if document parser found one
    let license: License | undefined = docParser.GetLicense();
    if (license) files.push(licenseParser.ResolveLicense(license, path.resolve(to, "LICENSE.MD")));
    //Add Contributing if found one
    let contributing: Contributing | undefined = docParser.GetContributing();
    if (contributing) files.push(contributingParser.ResolveContributing(contributing, path.resolve(to, "CONTRIBUTING.MD")));

    let ok: boolean = parser.CountOccurence(files);

    if (!ok) {
        let answers: boolean = await dep.autoInquirer.InquirePredicate("There were variables missing from the template file, are you sure you want to continue?");
        if (!answers) return "The template generation has been cancelled";
        console.log(chalk.greenBright("Ignoring warning..."));
    }

    //Parse Templates
    files = parser.ParseContent(files);

    //Generate warning of possible code
    parser.CountPossibleRemains(files);


    console.log(chalk.cyanBright("Generating template..."));

    //Asynchronous write to target directory
    let writer: FileWriter = new FileWriter(dep.util);
    await writer.AWriteFile(files);

    // Run commands user have supplied
    if (settings.commands.length != 0) {
        for (const command of settings.commands) {
            await ExecuteCommandSimple(command.cmd[0], command.cmd.Skip(1) || [], command.dir);
        }
    }

    // RUN NPM
    if (settings.npm) {
        console.log(chalk.cyanBright("Installing NPM modules"));
        let reply = "";
        let hasYarn = await ExecuteCommandSimple("yarn", ["-v"], "", true);
        if (hasYarn) {
            console.info(chalk.greenBright("Yarn Detected... Using yarn!"));
            reply = await ExecuteCommand("yarn", ["--prefer-offline"], "Installed NPM Modules", folderName, settings.npm);
            if (reply == 'error') {
                reply = await ExecuteCommand("yarn", [], "Installed NPM Modules", folderName, settings.npm);
            }
        } else {
            reply = await ExecuteCommand("npm", ["i"], "Installed NPM Modules", folderName, settings.npm);
        }
        console.log(reply);
    }
    let git: Git = docParser.GetGit()!;
    if (git) {
        await ExecuteCommandSimple("git", ["init"], folderName);
        await ExecuteCommandSimple("git", ["config", "user.name", git.username], folderName);
        await ExecuteCommandSimple("git", ["config", "user.email", git.email], folderName);
        await ExecuteCommandSimple("git", ["rm", "-rf", "--cached", "."]);
        await ExecuteCommandSimple("git", ["add", "."], folderName);
        let reply = await ExecuteCommand("git", ["commit", "-m", '"Initial Commit~"'], "Initialized Git repository!", folderName);
        console.log(reply);

        if (git.remote != null) {
            let useRemote: boolean = await dep.autoInquirer.InquirePredicate("Do you want to set your remote 'origin' to " + chalk.yellowBright(git.remote) + " and immediately push to origin?");
            if (useRemote) {
                await ExecuteCommandSimple("git", ["remote", "add", "origin", git.remote], folderName);
                let reply: string = await ExecuteCommand("git", ["push", "origin", "--all"], "Added and pushed to remote repository", folderName);
                console.log(reply);
            }
        }
    }
    return chalk.greenBright("Complete~!!");
}

// Executes the cyan.config.js
export async function Interrogate(dep: Dependency, autoInquirer: IAutoInquire, templatePath: string, folderName: string): Promise<CyanSafe> {
    //Gets relative path to configure file of the selected template
    let configFile = path.resolve(templatePath, "./cyan.config.js");
    let relConfigPath: string = path.relative(__dirname, configFile);

    let execute: Execute = new Execute(dep.core, folderName, __dirname, configFile, autoInquirer, dep.autoMapper);
    let cyanSafe: CyanParser = new CyanParser(dep.core);

    //Get Template generating functions
    let Template: (nameFolder: string, c: Chalk, inq: Inquirer, autoInquire: IAutoInquire, autoMap: IAutoMapper, execute: Execute) => Promise<Cyan>
        = eval(`require("${relConfigPath.ReplaceAll("\\\\", "/")}")`);
    let rawSettings: Cyan = await Template(folderName.ReplaceAll("\\\\", "/").split('/').Last()!, chalk, inquirer, autoInquirer, dep.autoMapper, execute);
    // Escape and normalize raw settings to "safe"
    return cyanSafe.Save(rawSettings);
}

export async function ExecuteCommandSimple(command: string, variables: string[], cd?: string, ignore: boolean = false): Promise<boolean> {
    let p = cd != null ? path.resolve(process.cwd(), cd) : process.cwd();

    console.log(p);
    return await new Promise<boolean>(function (resolve) {
        spawn(command, variables, {
            stdio: ignore ? "ignore" : "inherit",
            shell: true,
            cwd: p
        })
            .on("exit", (code: number) => {
                console.info(`${command} ${variables.join(' ')} ${cd ? 'at ' + cd : ''} with code ${code}`);
                if (code === 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .on("error", err => console.info(err));
    });
}

async function ExecuteCommand(command: string, variables: string[], done: string, cd?: string, cdExt?: string): Promise<string> {
    cdExt = cdExt || ".";
    let p = cd != null ? path.resolve(process.cwd(), cd, cdExt) : process.cwd();
    return await new Promise<string>(function (resolve: (s: string) => void) {
        spawn(command, variables, {stdio: "inherit", shell: true, cwd: p})
            .on("exit", (code: number) => {
                if (code == 0) {
                    resolve(chalk.greenBright(done));
                } else {
                    resolve('error');
                }
            });
    });
}
