
# CyanPrint

CyanPrint is a scaffolding CLI for people to create templates or blueprints to scaffold commonly used 
templates and reduce boilerplate.

The template file lives within the project itself, hence your template is still testable, even workable on 
its own.

 CyanPrint is an slightly more robust version of CookieCutter, but in NPM.
 
 # Features
 - Inquirer.js to get data
 - Glob patterns to choose which file to copy
 - Replace templating code with variables in file content and file names using data obtain from user input
 - Inline flagging to decide whether the line should be removed
 - if-else block to decide which block which stay and be removed depending on user input
 - Guid regeneration
 - package.json package choices
 - NPM install after skeleton project is generated
 - Git init after skeleton project is generated
 - Installing templates from Git repositories or local folder
 - Test template generation without installing it
 - Arbitrary Shell command execution

# Existing Templates


# Using CyanPrint To Install Templates

1. Install npm or node on your machine

2. Install binary using npm
    ```shell
    $ npm i cyanprint -g
    ```
3. Execute command at target folder
    ```shell
   $ cyan create <project-folder-name>
    ```
4. Choose your group and template.
5. Follow through template choices!
6. ????
7. Profit

# Write your Template (Tutorial)

## Getting Started
1. Install CLI globally
    ```shell
    npm i -g cyanprint
    ```
2. Generate a template to make a template! (#meta)
    ```shell
    cyan create first-CyanPrint
    ```
3. Choose the Template group `Main` by pressing Enter (If that is your only group).
4. Choose the Template the template 'CyanPrint Template', which is installed by default.
5. This tutorial will be done in Javascript instead of Typescript, so choose the Javascript option!
6. Add which every documentation you want, this is only useful when you want to publish a template to github or any git host
7. Wait for the template to be generated

## Basic Concepts
CyanPrint replaces file, folder and content that has snippets of `var~name~` with user input, 
allowing developers to make templates that live within their code. 

This allow templates to be able to live on git, while also being friendly and test-able despite being a 
template.  

## Your first awesome CyanPrint

### Variable Replacement
In this tutorial, we will try to template the file base on the user's **name**, his/her **organization name** and 
his/her **email**.

1. In the folder `first-CyanPrint`, you should have the following file structure:
    ```shell
     first-CyanPrint
     |- cyan.config.js
     |- /Template
        |- .gitignore
    ```

2. Within the `Template` folder, create a new txt file called `var~name.person~.txt`
    
    The template snippet `var~name.person~` will be replaced by the value of `name.person`
    ```bash
    $ cd first-CyanPrint
    $ cd Template
    $ touch var~name.person~.txt
    ````

3. Open `var~name.person~.txt` and put in the following content:
    ```
    Hello var~name.person~ from var~name.organization~!
    Your email is var~email~
    ```
    The variables `var~name.person~`, `var~name.organization~` and `var~email~` will be replaced by
    the values of `name.person`, `name.organization` and `email` respectively.
    
4. Now we edit the `cyan.config.js` file to as the user for input, and replace the **name**, 
**organization name** and **email** in the file, and also rename the file to the person's name.
    
    This is done by setting the values of the variables `name.person`, `name.organization` and `email`.
    
    `cyan.config.js`
    ```javascript
    module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {       
       return {
            globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
            variable: {
                name:{
                    person: "bob", //put the default value for name instead of bob
                    organization: "none" //put the default value for organization name instead of none
                },
                email: "bob@gmail.com" //put the default value for email instead of bob@gmail.com
            }
        };
    };
    ```
    
 5. Test to see whether your template works
    
    Go the folder **1 level higher than your root folder** and start your bash or shell terminal there or simply: 
    ```bash
    $ cd ../../
    ```
    Folder structure now: 
    ```
    ??????? <---- you should be here (your terminal)
    |- /first-CyanPrint
       |- cyan.config.js
       |- /Template
          |- .gitignore
          |- var~name.person~.txt
       
    ```
 6. Test out your first template! The try command is for you to test your template before publishing/installing them
    ```shell
    $ cyan try first-CyanPrint awesome-project
    ```
    
    This installs your template in the folder called awesome-project on the same folder level 
    as your first-CyanPrint folder
    
    You should expect to have the following file structure (if your used my values):
    ```
     ??????? <---- you should be here (your terminal)
        |- /first-CyanPrint
           |- cyan.config.js
           |- /Template
              |- .gitignore
              |- var~name.person~.txt
        |- /awesome-project
           |- .gitignore
           |- kirinee.txt
    ```
    and the content of `bob.txt` (or whatever name you put in the `cyan.config`):
    ```
    Hello kirinee from none!
    Your email is kirinee97@gmail.com
    ```
7. Congratulations, your made your first CyanPrint!

### Inline Flags in Content
Inline flags are boolean values where you can choose to remove files, folders or lines of code if 
the flag evaluate to false, and the snippet removed if evaluated to true.

The flag snippet is in the form of `flag~flagname~`, where `flagname` is the flag field's name

Continuing from the examples above change the following files:
`/Template/var~person.name~.txt`
```
Hello var~name.person~ from var~name.organization~!
Your email is var~email~
Your ID is 024e7415-a88e-4a03-9b67-3d769aebf66f flag~show.id~
```
`cyan.config.js`
```javascript
module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {
    return {
        globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
        variable: {
             name:{
                 person: "bob", 
                 organization: "none" 
             },
             email: "bob@gmail.com"
        },
        flags: {
            show:{
                id: true
            }
        }
    };
};
```
All flags should exist within `flags` of the returned object. 

Try the above code out!
```shell
$ cyan try first-CyanPrint template
```
The newly generated `kirinee.txt` should have the following content:
```
Hello var~name.person~ from var~name.organization~!
Your email is var~email~
Your ID is 024e7415-a88e-4a03-9b67-3d769aebf66f 
```

Now change the flag to false

`cyan.config.js`
```javascript
module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {
    return {
        globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
        variable: {
             name:{
                 person: "bob", 
                 organization: "none" 
             },
             email: "bob@gmail.com"
        },
        flags: {
            show:{
                id: false
            }
        }
    };
};
```
Try it out!
```shell
$ cyan try first-CyanPrint template
```
The newly generated `kirinee.txt` should have the Guid line removed:
```
Hello var~name.person~ from var~name.organization~!
Your email is var~email~
```

### Inline Flag in files and folders
You can input flags in folders and file names. Folders with the flags evaluated to false will 
have their whole folder deleted and files with flags evaluated to false will the whole file deleted.

Added the following files to your folder structure:
```
??????? <---- you should be here (your terminal)
   |- /first-CyanPrint
      |- cyan.config.js
      |- /Template
         |- .gitignore
         |- var~name.person~.txt
         |- /flag~production~prod
            |- flag~server.one~Server1.txt
            |- flag~server.two~Server2.txt
         |- /flag~development~dev
            |- flag~server.one~Server1.txt
            |- flag~server.two~Server2.txt
```
And add the following flags to your flag object:

`cyan.config.js`
```javascript
module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {
    return {
        globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
        variable: {
             name:{
                 person: "bob", 
                 organization: "none" 
             },
             email: "bob@gmail.com"
        },
        flags: {
            show:{
                id: false
            },
            production: true,
            development: false,
            server:{
                one: true,
                two: false
            }
        }
    };
};
```
Try it out!
```shell
$ cyan try first-CyanPrint template
```
The folder `developement` and the file `Server2.txt` should have been removed, your resulting 
folder structure should be:
```
??????? <---- you should be here (your terminal)
   |- /first-CyanPrint
      |- cyan.config.js
      |- /Template
         |- .gitignore
         |- bob.txt
         |- /prod
            |- Server1.txt
```

### If-End Block
Flags can also be use to make if-else block. 

Using the previous `cyan.config.js`, we can use if-end block to choose which part
lives based on the flag's value.

Change your `var~name.person~.txt` file content to the following:
```
Hello var~name.person~ from var~name.organization~!
Your email is var~email~
Your ID is 024e7415-a88e-4a03-9b67-3d769aebf66f flag~show.id~

if~production~
Production line 1
Production line 2
Production line 3
end~production~
```

Now, try executing (note, the production flag is now **true**)
```shell
$ cyan try first-CyanPrint template
```
The generated file should have these content

`bob.txt`
```
Hello bob from none!
Your email bob@gmail.com

Production line 1
Production line 2
Production line 3
```

Now, turn off the production flag

`cyan.config.js`
```javascript
module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {
    return {
        globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
        variable: {
             name:{
                 person: "bob", 
                 organization: "none" 
             },
             email: "bob@gmail.com"
        },
        flags: {
            show:{
                id: false
            },
            production: false,
            development: false,
            server:{
                one: true,
                two: false
            }
        }
    };
};
```

And execute the try command again

```shell
$ cyan try first-CyanPrint template
```

The it should remove the block if-end block

`bob.txt`
```
Hello bob from none!
Your email bob@gmail.com

```

####Caveats
Do not alternate your if-end block, or have nested if-end block of 
the same flag! 

NO:
```
if~a~
if~a~
end~a~
end~a~
```
NO:
```
if~a~
if~b~
end~a~
end~b~
```
YES:
```
if~a~
if~b~
end~b~
end~a~
```

### Guid Generation

Cyan offers guid generation by replacing existing GUIDs with newly generated guid every time the template is generated.
You can choose which GUID to be replaced by simply added the GUID into the GUID array.

`cyan.config.js`
```javascript
module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {
    return {
        globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
        variable: {
             name:{
                 person: "bob", 
                 organization: "none" 
             },
             email: "bob@gmail.com"
        },
        flags: {
            show:{
                id: false
            },
            production: false,
            development: false,
            server:{
                one: true,
                two: false
            }
        },
        guid: ["024e7415-a88e-4a03-9b67-3d769aebf66f"]
    };
};
```

Added the GUID we want to change (the one in `var~name.person~.txt`) to the `guid` field in the return object.

**Also, remember to change the** `show.id` **to true, else we cannot see the newly generated id**

Try it out:
```shell
$ cyan try first-CyanPrint template
```
The GUID in `bob.txt` should have been replaced.

**Do note that GUID looks for both *ONLY* fully-uppercased and fully-lowercased GUID to replace**

### NPM package.json Flags
CyanPrint has first-class support for NPM's package.json. 

Within the flag object, all fields under the `packages` field will be taken as a name of a package. 

Packages with true (whether in `devDependencies` or `depedencies`) will remain, whilst those that are evaluated
to be false will be removed. Do not CyanPrint will not add entry if it originally does not exist, and the flag is true.

#### Example (Continuing from above)
Add `package.json` to Template folder with the following content:
```json
{
  "name": "cyanprint",
  "version": "1.0.0",
  "devDependencies": {
      "chai": "^4.1.2",
      "mocha": "^5.2.0",
      "@types/chai": "^4.1.5"
  },
  "dependencies": {
      "commander": "^2.18.0",
      "glob": "^7.1.3"
  }
}
```

Now, change the cyanprint to set `chai` and `@types/chai` to false,
while leaving `commander` to true. Those not listed in flags will not be affected.

`cyan.config.js`
```javascript
module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {
    return {
        globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
        variable: {
             name:{
                 person: "bob", 
                 organization: "none" 
             },
             email: "bob@gmail.com"
        },
        flags: {
            packages:{
                chai: false,
                "@types/chai": false,
                commander: true  
            },
            show:{
                id: false
            },
            production: false,
            development: false,
            server:{
                one: true,
                two: false
            }
        },
        guid: ["024e7415-a88e-4a03-9b67-3d769aebf66f"]
    };
};
```

We have added the packages object with the relevant boolean values under the `flag` field in the return object.

Now we try it out:
```shell
$ cyan try first-CyanPrint template
```

The `package.json` that is generated will have the correct packages with false flag released:

`package.json`
```json
{
  "name": "cyanprint",
  "version": "1.0.0",
  "devDependencies": {
      "mocha": "^5.2.0"
  },
  "dependencies": {
      "commander": "^2.18.0",
      "glob": "^7.1.3"
  }
}
```

### Auto NPM Install
If your template requires `npm i` to be ran after the template is generated, simply add a npm flag to true
in the return object of the async function you export in `cyan.config.js`

`cyan.config.js`
```
module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {
    return {
        globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
        variable: {
             name:{
                 person: "bob", 
                 organization: "none" 
             },
             email: "bob@gmail.com"
        },
        flags: {
            packages:{
                chai: false,
                "@types/chai": false,
                commander: true  
            },
            show:{
                id: false
            },
            production: false,
            development: false,
            server:{
                one: true,
                two: false
            }
        },
        guid: ["024e7415-a88e-4a03-9b67-3d769aebf66f"],
        npm: true
    };
};
```

This would run `npm i` after the template has been generated

## AutoInquiring Variable Inputs
 
 ### Introduction
 As the previous example has shown, it is possible replace file, folder and content with small
 snippets of code inside. However, to make this viable, we should ask the user on what they want 
 to replace the variable with. 
 
 CyanPrint uses [Inquirer](https://github.com/SBoudrias/Inquirer.js) and [Chalk](https://github.com/chalk/chalk) 
 underneath to produce interactive questions with the user and getting values, to decide what values to put.
 
 We have our own API, but if it is not flexible enough, you can still use inquirer and chalk:
 
 You can invoke their methods by using the first two argument of the async function exported. Please read their documentation
 on how to use their methods to obtain value.
 
 ```javascript
module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {       
    //Use chalk
    console.log(chalk.redBright("Red Words"));
    //Use inquirer
    let answers = await inquirer.prompt([]);
    return {
        globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
        variable: {
            name:{
                person: "bob", //put the default value for name instead of bob
                organization: "none" //put the default value for organization name instead of none
            },
            email: "bob@gmail.com" //put the default value for email instead of bob@gmail.com
        }
    };
};
```

**As mentioned above**, CyanPrint has a inbuilt API for inquiring variables, and 
it can be invoked via the **autoInquirer** object. 

### Usage 

#### Variable as Input
We will now use **autoInquirer** to inquire the three basic values from the user.

In your `cyan.config.js`, change it to the content below:
```javascript
module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {
    let inputs =  {
         name:{
             person: "bob", //put the default value for name instead of bob
             organization: "none" //put the default value for organization name instead of none
         },
         email: "bob@gmail.com" //put the default value for email instead of bob@gmail.com
    };
    
    inputs = await autoInquirer.InquireInput(inputs); 
     
    return {
        globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
        variable: inputs
    };
};
```
This requests the user to input a value for each field (`name.organization`), and if no input was detected
it will default the be value that was first set (`none`).

Try it out! 
```shell
$ cyan try first-CyanPrint template
```
#### Custom Questions for fields
As you would realize from the previous example, each field will be asked as their field name, but
capitalized and the dot replace with spaces. `name.organization` -> `Name Organization`.

Sometimes, you want to have a more detailed question. You can do this very simply by changing the 
default value from a string to an array of 2 string, the second being the question.

```javascript
module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {       
 
    let inputs =  {
         name:{
             person: "bob", 
             organization: ["none", "Please enter the name of your Organization"] 
         },
         email: "bob@gmail.com"
    };
    
    inputs = await autoInquirer.InquireInput(inputs); 
     
    return {
        globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
        variable: inputs
    };
};
```

Now, the default value for the field `name.organization` is `none` and the question asked is 
`Please enter the name of your Organization`. 

Try it out! 
```shell
$ cyan try first-CyanPrint template
```
#### Inquire Flag Object as Checkbox
You can ask for flag Objects as a list of checkboxes. Each flag
will be presented as a checkbox, and it will return true if the user checked it
and false if the user did not check it. You can get a feel on how it looks like [here](https://github.com/SBoudrias/Inquirer.js#checkbox---type-checkbox).

```javascript
   module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {       

        let flags = {
            unitTest: "Unit Test",
            e2eTest: "E2E",
            packages: {
                "chai": "Use Chai",
                mocha: "Use Mocha"
            } 
        };
        
        flags = await autoInquirer.InquireAsCheckBox(flags, "Which of these do you want to use?");
        /* sample of return result for flag after await:
            {
                unitTest: true,
                e2eTest: false,
                packages:{
                    chai: true,
                    mocha: true
                }
            }
         */
        return {
            globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
            flags: flags
        };
   };
```

#### Inquire Flag Object as Single-Answered MCQ
You can ask for flag Objects as a Multiple Choice Question with a single answer. 
The user will choose from a list, where each option is the original value of the flag object (which
will become a boolean after)

```javascript
   module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {       

        let flags = {
            ts: "Typescript",
            js: "Javascript",
            flow: "Flow"
        }
        
        flags = await autoInquirer.InquireAsList(flags, "Please choose which language to use");
        /* sample of return result for flag after await:
            {
                ts:true,
                js:false,
                flow:false
            }
         */
        return {
            globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
            flags: flags
        };
   };
```

### Inquire Flag Object as series of Yes-No
This will get the value for each flag object as a Yes-No Question. 
The question that will be displayed will the value of the flag object, which will
be turned into boolean after the question has been answered

```javascript
   module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {       

        let flags = {
            unitTest: "Do you want Unit Test Framework?",
            e2eTest: "Do you want E2E Test Framework?",
            packages: {
                "chai": "Do you want to use Chai?",
                mocha: "Do you want to use Mocha?"
            } 
        }
        
        flags = await autoInquirer.InquireAsPredicate(flags);
        /* sample of return result for flag after await:
            {
                unitTest: true,
                e2eTest: false,
                packages:{
                    chai: true,
                    mocha: true
                }
            }
         */
        return {
            globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
            flags: flags
        };
   };
```

### Using of Documentation
Documentation is a in-built API to simplify generation of basic documentation and Initialization of
Git repository. It is very basic, so if you have complex rules, please do not use this.

Documentation comes with the following choices presented to the user. 
- README.MD
- CONTRIBUTING.MD
- One of the 4 Licenses:
    - MIT
    - Apache License 2.0
    - ISC 
    - GNU Public License 3.0
- Git Repository
- SemVer

Simply offer the choice via autoInquire, and return the object as docs:
`cyan.config.js`
```javascript
   module.exports = async function(folderName, chalk, inquirer, autoInquirer, autoMapper, execute) {       
        
        let usage = {license: true,readme:true,git:true};
    
       let docs = await autoInquirer.InquireDocument(usage);
        
       return {
           globs: {root:"./Template",pattern: "**/*.*", ignore: ""},
           docs: docs,
           varaible: {}
       };
   };
```
This will present a checkbox of license, readme and git to the user, and if they check it, it will generate the 
following documents for them. Do note that README will not be generated, you will have a have a 
`flag~cyan.docs.readme~README.MD` file for CyanPrint to decide whether to copy over.

You can access the values of the documentation throughout your project, if you requested for it :

| Variable Name    	            | Variable Value	|
|----------------------------	|--------------------	|
| var~cyan.docs.author~      	| Author Value       	|
| var~cyan.docs.email~       	| Email Value        	|
| var~cyan.docs.description~ 	| Description Value  	|
| var~cyan.docs.license~     	| License Value      	|
| var~cyan.docs.name~        	| Project name value 	|

| Flags                        	| Flag Value                   	|
|------------------------------	|------------------------------	|
| flag~cyan.docs.readme~       	| Whether README is used       	|
| flag~cyan.docs.semver~       	|  Whether SemVer is used      	|
| flag~cyan.docs.git~          	| Whether Git is used          	|
| flag~cyan.docs.contributing~ 	| Whether Contributing is used 	|
| flag~cyan.docs.license~      	| Whether License is used      	|



## Installing your first template
 1. the folder **1 level higher than your root folder** and start your bash or shell terminal. 
    ```shell
    $ cyan install ./first-CyanPrint <group>
    ```
 2. Wait for the installation to complete. Note that **group** can be left blank. 
 It will install into the **Main** group.
 
    For more details on how **groups** work, read them [here](#groups)
 3. Now you can use the template anywhere by running `cyan create <appname>` and it will appear as a option 
 in the group you installed to
 
 ## Publish to git
 1. Simply publish the whole folder as a git repository
 2. Install directly from the git repository:
    ```shell
    $ cyan install <git repository> <group>
    ```
 3. Wait for the installation to complete. Note that **group** can be left blank. 
It will install into the **Main** group.

    For more details on how **groups** work, read them [here](#groups)
    
 4. Use the template anywhere on your local machine by running `cyan create <appname>` and it will appear as a option 
 in the group you installed to
 
# Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.MD) for details on our code of conduct, and the process for submitting pull requests to us.

# Versioning
We use [SemVer](https://semver.org/) for versioning. For the versions available, see the tags on this repository.

# Authors
* bob

# License
This project is licensed under the MIT - see the [LICENSE.md](LICENSE.MD) file for details