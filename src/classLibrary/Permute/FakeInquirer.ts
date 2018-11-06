import {DocQuestions, Documentation, IAutoInquire, License} from "../TargetUtil/CyanResponse";

class FakeInquirer implements IAutoInquire {
	
	private realInquirer: IAutoInquire;
	
	constructor(realInquirer: IAutoInquire) {
		this.realInquirer = realInquirer;
	}
	
	InquireAsCheckBox(flags: object, question: string): Promise<object> {
		return this.realInquirer.InquireAsCheckBox(flags, question);
	}
	
	InquireAsList(flags: object, question: string): Promise<object> {
		return this.realInquirer.InquireAsList(flags, question);
	}
	
	InquireAsPredicate(flags: object): Promise<object> {
		return this.realInquirer.InquireAsPredicate(flags);
	}
	
	InquireDocument(docList: DocQuestions): Promise<Documentation> {
		return this.realInquirer.InquireDocument(docList);
	}
	
	InquireInput(object: object): Promise<object> {
		return this.realInquirer.InquireInput(object);
	}
	
	InquireLicense(inquireAuthor?: boolean, inquireYear?: boolean): Promise<License> {
		return this.realInquirer.InquireLicense(inquireAuthor, inquireYear);
	}
	
	InquirePredicate(question: string, yes?: string, no?: string): Promise<boolean> {
		return Promise.resolve(true);
	}
}

export {FakeInquirer};