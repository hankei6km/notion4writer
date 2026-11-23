export abstract class BaseFiles<TChunk extends string | Uint8Array = string | Uint8Array> {
    // path
    abstract fileExt(url: string): string
    abstract fileNameDigest(url: string, abbrev?: number): string
    abstract relativePath(path: string): string
    abstract pageFileName(pathExt: [string[], string]): string
    abstract imageFilePath(pathExt: [string[], string]): string
    abstract imageSrcPath(pathExt: [string[], string]): string
    // fs
    abstract setupDir(dir: string[], base?: string): Promise<string>
    abstract imageFileList(dir: string[]): Promise<string[]>
    abstract removeFilePath(filePath: string): Promise<void>
    // io
    abstract write(name: string, data: AsyncIterable<TChunk>): Promise<void>
}

