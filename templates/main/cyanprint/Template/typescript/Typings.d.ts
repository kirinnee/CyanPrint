interface IAutoMapper {
	/**
	 * Overwrite the to object's value with the from object's value
	 * @param from - the from object
	 * @param to - the to object
	 * @constructor
	 */
	Overwrite(from: object, to: object): object
	
	/**
	 * Join multiple object into a single object
	 * @param b - any amount of objects
	 * @constructor
	 */
	JoinObjects(...b: object[]): object;
	
	/**
	 * Finds the first flag that is true in the flag object, and using that flag key, find the value in the map object
	 * @param map - the map of string to string
	 * @param flags - the flag map of string top boolean
	 * @constructor
	 */
	ReverseLoopUp(map: object, flags: object): string;
}

interface IAutoInquire {
	
	/**
	 * Ask a yes-no question, returns a boolean after user answers.
	 * @param question the question to ask
	 * @param yes The Yes answer, if not filled, will default to "Yes"
	 * @param no the No answer, if not filled will default to "No"
	 * @constructor
	 */
	InquirePredicate(question: string, yes?: string, no?: string): Promise<boolean>;
	
	/**
	 * Choose to inquire which documents the user need
	 * @param docList - the documents they need
	 * @constructor
	 */
	InquireDocument(docList: DocQuestions): Promise<Documentation>;
	
	/**
	 * To ask for license, return a license object
	 * @param inquireAuthor whether to as for author for license
	 * @param inquireYear whether to ask for year for license
	 * @constructor
	 */
	InquireLicense(inquireAuthor?: boolean, inquireYear?: boolean): Promise<License>;
	
	/**
	 * Converts a object of key -> string or [string,string] mapping into a series of questions,
	 * using the key as the question (unless the value is an array of two strings, in that case,
	 * it will use the 2nd value of the array) and the value (first value of array) as the default
	 * value, and return an object with answers from the user
	 * @param object the key -> string object
	 * @constructor
	 */
	InquireInput(object: object): Promise<object>;
	
	/**
	 * Converts a object with string -> string into a checkbox question. The options which are
	 * checked will become true, while the rest will be false.
	 * @param flags - the string->string object to be converted to string->boolean object after the prompt
	 * @param question - the question to ask the user
	 * @constructor
	 */
	InquireAsCheckBox(flags: object, question: string): Promise<object>;
	
	/**
	 * Converts object with string -> string into a MCQ. The only option selected will become have value of
	 * true, while every other field will have a false value.
	 * @param flags - the string->string object to be converted to string->boolean object after the prompt
	 * @param question - the question to ask the user
	 * @constructor
	 */
	InquireAsList(flags: object, question: string): Promise<object>;
	
	/**
	 * Uses each flag value in the flag object as a yes or no question, and convert the value to true
	 * if user answers yes, and false if no
	 * @param flags - the string->string object to be converted to string->boolean object after the prompt
	 * @constructor
	 */
	InquireAsPredicate(flags: object): Promise<object>;
}

interface Cyan {
	globs: Glob[] | Glob,
	variable?: object,
	flags?: object,
	guid?: string[],
	npm?: boolean | string;
	docs?: Documentation;
	comments?: string[] | string;
}

interface CyanSafe {
	globs: Glob[],
	variable: object;
	flags: object;
	guid: string[],
	npm: string | null;
	docs: Documentation,
	comments?: string[]
}

interface DocData {
	author?: string;
	email?: string;
	gitURL?: string;
	licenseType?: string;
	years?: string;
	projectName?: string;
	description?: string;
}

interface DocUsage {
	semVer: boolean;
	contributing: boolean;
	readme: boolean;
	git: boolean;
	license: boolean;
}

interface DocQuestions {
	semVer?: boolean;
	contributing?: boolean;
	readme?: boolean;
	git?: boolean;
	license?: boolean;
}

interface Documentation {
	data: DocData;
	usage: DocUsage;
}

interface Git {
	username: string;
	email: string;
	remote: string;
}

interface Glob {
	root: string,
	pattern: string,
	ignore: string | string[]
}

interface Contributing {
	author: string;
	email: string;
}

interface License {
	type: "GPL-3.0" | "MIT" | "ISC" | "Apache-2.0",
	author: string;
	year: string;
}

interface IExecute {
	
	/**
	 * Call another file that exports a cyan.config function,
	 * @param p the path to the file, relative to this file
	 */
	call(p: string): Promise<Cyan>;
	
	/**
	 * Execute a shell command
	 * @param p Executes a shell command
	 */
	run(p: string): Promise<void>;
}

export {
	Git,
	Glob,
	Cyan,
	DocUsage,
	DocData,
	DocQuestions,
	Documentation,
	Contributing,
	CyanSafe,
	License,
	IAutoInquire,
	IAutoMapper,
	IExecute
};