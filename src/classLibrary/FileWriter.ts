import {Utility} from "./Utility";
import {FileSystemInstance, IFile} from "./File";
import {Bar, Presets} from "cli-progress";

class FileWriter {
	
	readonly util: Utility;
	
	constructor(util: Utility) {
		this.util = util;
	}
	
	WriteFiles(files: FileSystemInstance[]) {
		files.Each((f: FileSystemInstance) => {
			if (f["content"] != null) {
				let file: IFile = f as IFile;
				this.util.SafeWriteFile(file.destinationAbsolutePath, file.content);
			} else {
				this.util.SafeCreateDirectory(f.destinationAbsolutePath);
			}
		});
	}
	
	async AWriteFile(files: FileSystemInstance[]) {
		
		let bar: Bar = new Bar({}, Presets.shades_grey);
		let counter: number = 0;
		bar.start(files.length, 0);
		let promises: Promise<void>[] = [];
		files.Each((f: FileSystemInstance) => {
			if (f["content"] != null) {
				let file: IFile = f as IFile;
				promises.push(this.util.ASafeWriteFile(file.destinationAbsolutePath, file.content, function () {
					counter++;
					bar.update(counter);
					if (counter >= bar.getTotal()) {
						bar.stop();
					}
				}));
			} else {
				promises.push(this.util.ASafeCreateDirectory(f.destinationAbsolutePath, function () {
					counter++;
					bar.update(counter);
					if (counter >= bar.getTotal()) {
						bar.stop();
					}
				}));
			}
		});
		return await Promise.all(promises);
	}
	
}

export {FileWriter}