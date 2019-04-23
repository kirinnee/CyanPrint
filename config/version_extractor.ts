import * as fs from "fs";
import * as path from "path";


function ExtractVersion(): string {
	const packageJsonPath: string = path.resolve(__dirname, '../package.json');
	const packageJson: string = fs.readFileSync(packageJsonPath, 'utf8');
	const packageObject: any = JSON.parse(packageJson);
	return packageObject.version || "0.0.0";
}

export {ExtractVersion}
