import type { Root, Element, ElementContent, RootContent } from 'hast'
import { convertElement } from 'hast-util-is-element'

import { spliceChildren } from '@hankei6km/unist-util-splice-children'
import * as folders from '@hankei6km/unist-util-splice-children/utils/folders'
import type { BaseRequester } from '../utils/requester.ts'
import type { BaseFiles } from '../utils/files.ts'
import type { BasePathResolvers } from '../utils/path-resolvers.ts'

const isFigure = convertElement('figure')
const isImg = convertElement('img')

const isImage = convertElement((node): node is Element & { tagName: 'figure', children: [Element & { tagName: 'img' }] } => {
    if (isFigure(node)) {
        if (node.children.length >= 1 && isImg(node.children[0])) {
            return true
        }
    }
    return false
})

type LocalImageListItem = {
    url: string
    path: string
}

export type LocalsImageOptions = {
    images: string
    slug: string
    pathResolvers: BasePathResolvers
    files: BaseFiles
    requester: BaseRequester
}
export class LocalImage {
    protected options: LocalsImageOptions
    protected imageList: LocalImageListItem[] = []
    constructor(options: LocalsImageOptions) {
        this.options = options
    }

    localImage(tree: Root): void {
        const options = this.options
        const abbrev = 8
        let imageIndex = 1
        return spliceChildren(tree, {
            ...folders.getCallbacks({
                folders: [{
                    label: 'image' as const,
                    check: (node, index, _children, value) => isImage(node) ? [node] : [],
                    fold: false
                }, {
                    label: 'others' as const,
                    check: (node, index, _children, value) => !isImage(node, index, value) ? [node as ElementContent] : [],
                    fold: true
                }],
            }),
            mapper: (item) => {
                if (folders.select(item, 'image')) {
                    const url = item.contents[0].children[0].properties.src as string
                    const ext = options.files.fileExt(url)
                    const filenameDigest = options.files.fileNameDigest(url, abbrev)

                    this.imageList.push({
                        url,
                        path: options.files.imageFilePath(options.pathResolvers.pageImageFileName(options.images, options.slug, imageIndex, filenameDigest, ext))
                    })
                    const imagePath = options.files.imageSrcPath(options.pathResolvers.pageImageSrc(url, options.images, options.slug, imageIndex, filenameDigest, ext))
                    item.contents[0].children[0].properties.src = imagePath
                    imageIndex++
                }
                return [item]
            }
        })
    }
    async syncImageFiles(): Promise<void> {
        const options = this.options
        const imagesDir = options.pathResolvers.pageImageDirName(options.images, options.slug)
        const currentImageList = await options.files.imageFileList(imagesDir)
        // ローカルへのダウンロード
        await options.files.setupDir(imagesDir)
        for await (const item of this.imageList) { // ソートされてないので比較は毎回全件の include で行う
            if (!(currentImageList.includes(item.path))) {
                await options.files.write(item.path, options.requester.media(item.url))
            }
        }
        // ローカルで利用されない画像の削除
        for await (const filePath of currentImageList) {
            if (!(this.imageList.map(item => item.path).includes(filePath))) {
                await options.files.removeFilePath(filePath)
            }
        }
    }

}
