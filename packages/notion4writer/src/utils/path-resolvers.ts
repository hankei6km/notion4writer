export abstract class BasePathResolvers {
    //abstract pages(dir: string): string
    abstract pageFileName(dir: string, slug: string, ext: string): [string[], string]

    abstract pageImageDirName(dir: string, slug: string): string[]

    abstract pageImageFileName(dir: string, slug: string, index: number, digest: string, ext: string): [string[], string]

    abstract pageImageSrc(url: string, dir: string, slug: string, index: number, digest: string, ext: string): [string[], string]
}





