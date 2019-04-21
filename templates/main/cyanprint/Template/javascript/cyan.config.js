module.exports = async function (folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {
    console.log(folderName, chalk, inquirer, autoInquirer, autoMapper, execute);
    return {
        globs: {root: "./Template", pattern: "**/*.*", ignore: ""},
    };
};
