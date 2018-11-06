module.exports = async function (name, chalk, inquirer, autoInquirer, autoMap, execute) {

    let flags = {
        packages: {
            chai: true,
            mocha: true
        },
        move: {
            "@kirinnee/core": false
        },
        color: {
            green: false,
            black: false,
            blue: false
        },
        fileOne: false,
        fileTwo: false,
        fileThree: false
    };

    let move = await autoInquirer.InquirePredicate("Do you want to move kirinnee?");
    flags.move["@kirinnee/core"] = move;

    if (move) {
        let color = {
            color: {
                green: "Green",
                black: "Black",
                blue: "Blue"
            },
        };
        color = await autoInquirer.InquireAsList(color, "Which color do you want?");
        flags = autoMap.Overwrite(color, flags);
    }

    let files = {
        fileOne: "1",
        fileTwo: "2",
        fileThree: "3"
    };
    files = await autoInquirer.InquireAsCheckBox(files, "Which files do you want?");

    flags = autoMap.Overwrite(files, flags);


    //console.log(name, chalk, inquirer, autoInquirer, autoMap, execute);
    return {
        globs: {root: ".", pattern: "**/*.*", ignore: ""},
        npm: name,
        docs: {
            data: {
                author: "kirinnee",
                email: "kirinnee97@gmail.com",
                licenseType: "MIT",
                years: "2018",
                projectName: "SampleProject",
                description: "A Sample Project"
            },
            usage: {
                semVer: true,
                contributing: true,
                readme: true,
                git: false,
                license: true
            }
        },
        variable: {
            varOne: "1",
            varTwo: "2",
            objOne: {
                varOne: "11",
                varTwo: "12"
            }
        },
        flags: flags
    }
};