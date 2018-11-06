import {FileSystemInstance, IFile} from "../File";
import {VariableResolver} from "../ParsingStrategy/VariableResolver";
import {Licenses} from "../Licenses";
import {License} from "../TargetUtil/CyanResponse";

class LicenseResolver {
	
	private varResolver: VariableResolver;
	
	constructor(varResolver: VariableResolver) {
		this.varResolver = varResolver;
	}
	
	GetLicense(lic: string): string {
		switch (lic) {
			case "GPL-3.0":
				return Licenses.GPL3;
			case "ISC":
				return Licenses.ISC;
			case "MIT":
				return Licenses.MIT;
			case "Apache-2.0":
				return Licenses.Apache2;
			default:
				return "";
		}
	}
	
	ResolveLicense(license: License, targetPath: string): FileSystemInstance {
		let file: IFile = {
			sourceAbsolutePath: "",
			destinationAbsolutePath: targetPath,
			relativePath: "",
			content: this.GetLicense(license.type)
		};
		let map: Map<string, string> = new Map([
			["year", license.year],
			["author", license.author]
		]);
		file = this.varResolver.ResolveFileContent(map, file) as IFile;
		return file;
	}
	
}


export {LicenseResolver}