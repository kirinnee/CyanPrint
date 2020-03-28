interface FileSystemInstance {
    sourceAbsolutePath: string;
    destinationAbsolutePath: string;
    relativePath: string;
}

interface IFile extends FileSystemInstance {
    content: string;
    binary: boolean;
    buffer: Buffer;
}

interface IDirectory extends FileSystemInstance {
}

export {IFile, IDirectory, FileSystemInstance};