interface FileSystemInstance {
	sourceAbsolutePath: string;
	destinationAbsolutePath: string;
	relativePath: string;
}

interface IFile extends FileSystemInstance {
	content: string;
}

interface IDirectory extends FileSystemInstance {
}

export {IFile, IDirectory, FileSystemInstance};