import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import * as path from 'node:path'
import type { Root, Element, ElementContent, RootContent } from 'hast'
import { h } from 'hastscript'
import { BaseRequester } from '../../src/utils/requester.ts'
import { BaseFiles } from '../../src/utils/files.ts'
import type { LocalsImageOptions } from '../../src/lib/local-image.ts'
import { LocalImage } from '../../src/lib/local-image.ts'
import { BasePathResolvers } from '../../src/utils/path-resolvers.ts'

describe('LocalImage', () => {
    class BaseTestPathResolvers extends BasePathResolvers {
        pageFileName(dir: string, slug: string, ext: string): [string[], string] {
            return [[dir, slug], ext]
        }
        pageImageDirName(dir: string, slug: string): string[] {
            return [dir, slug]
        }
        pageImageFileName(dir: string, slug: string, index: number, digest: string, ext: string): [string[], string] {
            return [[dir, slug, index.toString(), digest], ext]
        }
        pageImageSrc(url: string, dir: string, slug: string, index: number, digest: string, ext: string): [string[], string] {
            return [[url, dir, slug, index.toString(), digest], ext]
        }
    }
    class BaseTestFiles extends BaseFiles {
        fileExt(url: string): string {
            throw new Error('Method not mocked.')
        }
        fileNameDigest(url: string, abbrev?: number): string {
            throw new Error('Method not mocked.')
        }
        pageFileName(pathExt: [string[], string]): string {
            throw new Error('Method not mocked.')
        }
        imageFilePath(pathExt: [string[], string]): string {
            throw new Error('Method not mocked.')
        }
        imageSrcPath(pathExt: [string[], string]): string {
            throw new Error('Method not mocked.')
        }
        setupDir(dir: string[], base?: string): Promise<string> {
            throw new Error('Method not mocked.')
        }
        imageFileList(path: string[]): Promise<string[]> {
            throw new Error('Method not mocked.')
        }
        removeFilePath(filePath: string): Promise<void> {
            throw new Error('Method not mocked.')
        }
        write(name: string, data: AsyncIterable<Buffer>): Promise<void> {
            throw new Error('Method not mocked.')
        }
    }
    class BaseTestRequester extends BaseRequester<Buffer> {
        async text(url: string): Promise<string> {
            throw new Error('Method not mocked.')
        }
        async *media(url: string): AsyncIterableIterator<Buffer, void, unknown> {
            throw new Error('Method not mocked.')
        }
    }
    it('should replace image URLs with local paths and update the image list', (t) => {
        const dirs = { pages: 'articles', images: 'images' }
        const slugValue = 'test-slug'
        const testPathResolvers = new BaseTestPathResolvers()
        const testFiles = new BaseTestFiles()
        const mockFileNameDiget = t.mock.method(testFiles, 'fileNameDigest', (url: string, abbrev?: number) => {
            return `${path.basename((new URL(url)).pathname)}-mocked-digest`
        })
        const mockFileExt = t.mock.method(testFiles, 'fileExt', (url: string) => {
            return path.extname((new URL(url)).pathname)
        })
        const mockImageFilePath = t.mock.method(testFiles, 'imageFilePath', (pathExt: [string[], string]) => {
            return `mocked-path-${pathExt[0].join('-')}-${pathExt[1]}`
        })
        const mockImageSrcPath = t.mock.method(testFiles, 'imageSrcPath', (pathExt: [string[], string]) => {
            return `mocked-src-path-${pathExt[0].join('-')}-${pathExt[1]}`
        })
        const requester = new BaseTestRequester()
        class TestLocalImage extends LocalImage {
            getImageList() {
                return this.imageList
            }
        }
        const localImage = new TestLocalImage({ images: dirs.images, slug: slugValue, requester, files: testFiles, pathResolvers: testPathResolvers })
        const tree: Root = {
            type: 'root', children: [
                h('p', 'This is a paragraph.'),
                h('figure', [
                    h('img', { src: 'https://example.com/image1.png' }),
                    h('figcaption', 'Image 1 caption')
                ]),
                h('figure', [
                    h('img', { src: 'https://example.com/image2.png' }),
                    h('figcaption', 'Image 2 caption')
                ]),
            ]
        }
        localImage.localImage(tree)
        assert.deepStrictEqual(localImage.getImageList(), [
            { url: 'https://example.com/image1.png', path: 'mocked-path-images-test-slug-1-image1.png-mocked-digest-.png' },
            { url: 'https://example.com/image2.png', path: 'mocked-path-images-test-slug-2-image2.png-mocked-digest-.png' }
        ])
        assert.deepStrictEqual(tree, {
            type: 'root', children: [
                h('p', 'This is a paragraph.'),
                h('figure', [
                    h('img', { src: 'mocked-src-path-https://example.com/image1.png-images-test-slug-1-image1.png-mocked-digest-.png' }),
                    h('figcaption', 'Image 1 caption')
                ]),
                h('figure', [
                    h('img', { src: 'mocked-src-path-https://example.com/image2.png-images-test-slug-2-image2.png-mocked-digest-.png' }),
                    h('figcaption', 'Image 2 caption')
                ]),
            ]
        })
        assert.deepStrictEqual(mockFileNameDiget.mock.calls.map(call => call.arguments), [
            ['https://example.com/image1.png', 8],
            ['https://example.com/image2.png', 8]
        ])
        assert.deepStrictEqual(mockImageFilePath.mock.calls.map(call => call.arguments), [
            [[['images', 'test-slug', '1', 'image1.png-mocked-digest'], '.png']],
            [[['images', 'test-slug', '2', 'image2.png-mocked-digest'], '.png']]
        ])
        assert.deepStrictEqual(mockImageSrcPath.mock.calls.map(call => call.arguments), [
            [[['https://example.com/image1.png', 'images', 'test-slug', '1', 'image1.png-mocked-digest'], '.png']],
            [[['https://example.com/image2.png', 'images', 'test-slug', '2', 'image2.png-mocked-digest'], '.png']]
        ])
    })
    it('should write content to files and remove old files', async (t) => {
        const dirs = { pages: 'articles', images: 'images' }
        const slugValue = 'test-slug'
        const testPathResolvers = new BaseTestPathResolvers()
        const testFiles = new BaseTestFiles()
        const mockSetupDir = t.mock.method(testFiles, 'setupDir', async (dir: string[], base?: string) => {
            return 'mocked-setup-dir'
        })
        const mockImageFileList = t.mock.method(testFiles, 'imageFileList', async (slug: string) => {
            return ['mocked-path-test-slug-1-image1.png-mocked-digest', 'mocked-path-test-slug-3-image3.png-mocked-digest']
        })
        const mockRemoveFilePath = t.mock.method(testFiles, 'removeFilePath', async (filePath: string) => {
            return
        })
        const mockWriteContent = t.mock.fn((chunk: string) => { })
        const mockWrite = t.mock.method(testFiles, 'write', async (name: string, data: AsyncIterable<Buffer>) => {
            for await (const chunk of data) {
                mockWriteContent(chunk.toString())
            }
        })
        const requester = new BaseTestRequester()
        const mockMedia = t.mock.method(requester, 'media', (url: string) => {
            return (async function* () {
                yield Buffer.from(`mocked-content-for-${url}-1`)
                yield Buffer.from(`mocked-content-for-${url}-2`)
            })()
        })
        class TestLocalImage extends LocalImage {
            constructor(options: LocalsImageOptions) {
                super(options)
                this.imageList = [
                    { url: 'https://example.com/image1.png', path: 'mocked-path-test-slug-1-image1.png-mocked-digest' },
                    { url: 'https://example.com/image2.png', path: 'mocked-path-test-slug-2-image2.png-mocked-digest' }
                ]
            }
        }
        const localImage = new TestLocalImage({ images: dirs.images, slug: slugValue, requester, files: testFiles, pathResolvers: testPathResolvers })
        await localImage.syncImageFiles()
        assert.deepStrictEqual(mockSetupDir.mock.calls.map(call => call.arguments), [
            [[dirs.images, slugValue]],
        ])
        assert.strictEqual(mockImageFileList.mock.callCount(), 1)
        assert.deepStrictEqual(mockRemoveFilePath.mock.calls.map(call => call.arguments), [
            ['mocked-path-test-slug-3-image3.png-mocked-digest'],
        ])
        assert.deepStrictEqual(mockMedia.mock.calls.map(call => call.arguments), [
            ['https://example.com/image2.png'],
        ])
        assert.deepStrictEqual(mockWrite.mock.calls.map(call => call.arguments[0]), [
            'mocked-path-test-slug-2-image2.png-mocked-digest',
        ])
        assert.deepStrictEqual(mockWriteContent.mock.calls.map(call => call.arguments), [
            ['mocked-content-for-https://example.com/image2.png-1'],
            ['mocked-content-for-https://example.com/image2.png-2'],
        ])
    })
})

