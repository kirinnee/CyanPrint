import {Contributing, Documentation, Git, License} from "../TargetUtil/CyanResponse";

class DocumentParser {
	
	private readonly doc: Documentation;
	
	constructor(doc: Documentation) {
		this.doc = doc;
	}
	
	GetLicense(): License | undefined {
		if (this.doc.usage.license) {
			return {
				author: this.doc.data.author!,
				type: this.doc.data.licenseType!,
				year: this.doc.data.years,
			} as License;
		}
		return undefined;
	}
	
	GetGit(): Git | undefined {
		if (this.doc.usage.git) {
			return {
				username: this.doc.data.author!,
				email: this.doc.data.email!,
				remote: this.doc.data.gitURL!
			}as Git;
		}
		return undefined;
	}
	
	
	GetContributing(): Contributing | undefined {
		if (this.doc.usage.contributing) {
			return {
				author: this.doc.data.author!,
				email: this.doc.data.email!,
			} as Contributing;
		}
		return undefined;
		
	}
	
	GetVariables(): object {
		let cyanDocs: object = {
			name: this.doc.data.projectName,
			author: this.doc.data.author,
			email: this.doc.data.email,
			description: this.doc.data.description,
			license: this.doc.data.licenseType
		};
		for (let k in cyanDocs) {
			if (cyanDocs.hasOwnProperty(k)) {
				if (cyanDocs[k] == null) {
					delete cyanDocs[k];
				}
			}
		}
		return {cyan: {docs: cyanDocs}}
	}
	
	GetAllFlags(): object {
		return {
			cyan: {
				docs: {
					readme: this.doc.usage.readme,
					semver: this.doc.usage.semVer,
					contributing: this.doc.usage.contributing,
					license: this.doc.usage.license,
					git: this.doc.usage.git
				}
			}
		}
	}
	
	
}

export {DocumentParser}