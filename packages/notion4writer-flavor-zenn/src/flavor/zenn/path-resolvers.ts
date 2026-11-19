import { BasePathResolvers } from '@hankei6km/notion4writer/utils'

export class ZennPathResolvers extends BasePathResolvers {
    pageFileName(dir: string, slug: string, ext: string): [string[], string] {
        return [[dir, slug], ext]
    }

    pageImageDirName(dir: string, slug: string): string[] {
        return [dir, slug]
    }

    pageImageFileName(dir: string, slug: string, index: number, digest: string, ext: string): [string[], string] {
        // BaseSlug.toSlug()がpath.sepを含まない文字列を返す前提。
        return [[dir, slug, `${slug}-${index}-${digest}`], ext]
    }

    pageImageSrc(_url: string, dir: string, slug: string, index: number, digest: string, ext: string): [string[], string] {
        // BaseSlug.toSlug()がpath.sepを含まない文字列を返す前提。
        return [[dir, slug, `${slug}-${index}-${digest}`], ext]
    }

}
