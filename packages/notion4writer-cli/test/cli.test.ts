import * as nodePath from 'node:path'
import * as nodeFs from 'node:fs/promises'
import * as nodeCrypto from 'node:crypto'
import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import { Client as NotionClient } from '@notionhq/client'
import { CliClient, CliFiles, CliRequester, CliSlug, pageCmd } from '../src/cli.ts'
import { InitFlavor } from '@hankei6km/notion4writer-flavor-zenn'


describe('CliSlug', () => {
    it('should generate a slug correctly', () => {
        const slug = new CliSlug(URL, nodePath)
        assert.strictEqual(slug.toSlug({ URL: 'https://example.com/page1-slug' }), 'page1-slug')
    })
    it('should generate a slug from a plain slug', () => {
        const slug = new CliSlug(URL, nodePath)
        assert.strictEqual(slug.toSlug({ URL: 'page1-slug' }), 'page1-slug')
    })
    it('should return an empty slug for non-string input', () => {
        const slug = new CliSlug(URL, nodePath)
        assert.strictEqual(slug.toSlug({ URL: 0 }), '')
    })
})
describe('pageCmd', () => {
    function getMockRichTextItem(
        text: string,
        opts: Record<string, any> = {}
    ): any {
        const { text: textObj, annotaions, ...others } = opts
        return Object.assign(
            {
                text: Object.assign({ content: text, link: null }, textObj),
                annotations: Object.assign(
                    {
                        bold: false,
                        code: false,
                        color: 'default',
                        italic: false,
                        strikethrough: false,
                        underline: false
                    },
                    annotaions || {}
                ),
                href: null,
                plain_text: text
            },
            others,
            { type: 'text' }
        ) as any
    }
    it('should fetch and process page blocks correctly', async (t) => {
        t.mock.timers.enable({ apis: ['Date'] })
        t.mock.timers.tick(1000 * 60 * 60 * 24)

        const dirs = { pages: 'articles', images: 'images' }
        const notionClient = new NotionClient()
        const mockedQuery = t.mock.method(notionClient.dataSources, 'query', async () => {
            return {
                results: [
                    {
                        properties: {
                            URL: { type: 'url', url: 'https://example.com/page1-slug' },
                            タグ: {
                                type: 'multi_select', multi_select: [
                                    { id: '', name: 'zenn:type:idea', color: 'default' },
                                    { id: '', name: 'zenn:topics:test', color: 'default' }
                                ]
                            }
                        },
                        object: 'page',
                        id: 'page1',
                        parent: { type: 'database_id', database_id: 'db1' },
                        created_time: '2024-06-01T00:00:00.000Z',
                        last_edited_time: '2024-06-02T00:00:00.000Z',
                        in_trash: false,
                        is_archived: false,
                        is_locked: false,
                        archived: false,
                        url: 'https://example.com/page1',
                        public_url: null,
                        icon: { type: 'emoji', emoji: '📄' },
                        cover: null,
                        created_by: { object: 'user', id: 'user1' },
                        last_edited_by: { object: 'user', id: 'user2' },
                    },
                ]
            }
        })
        t.mock.method(notionClient.blocks.children, 'list', async () => {
            return {
                results: [
                    {
                        object: 'block',
                        id: 'paragraph-id',
                        type: 'paragraph',
                        paragraph: {
                            rich_text: [getMockRichTextItem('test1')]
                        }
                    },
                    {
                        object: 'block',
                        id: 'paragraph-image',
                        type: 'image',
                        image: {
                            type: 'external',
                            external: { url: 'https://example.com/image1.jpg' },
                            caption: [getMockRichTextItem('image1-caption')]
                        }
                    },
                    {
                        object: 'block',
                        id: 'paragraph-image-2',
                        type: 'image',
                        image: {
                            type: 'external',
                            external: { url: 'https://example.com/image2.jpg' },
                            caption: [getMockRichTextItem('image2-caption')]
                        }
                    },
                    {
                        object: 'block',
                        id: 'paragraph-image-4',
                        type: 'image',
                        image: {
                            type: 'external',
                            external: { url: 'https://example.com/image4.jpg' },
                            caption: []
                        }
                    }
                ],
            }
        })
        const mockUrl = t.mock.fn<typeof URL>(URL)
        const mockPath = {
            basename: t.mock.fn<typeof nodePath.basename>(() => 'page1-slug'),
            extname: t.mock.fn<typeof nodePath.extname>((...args) => nodePath.extname(...args)),
            resolve: t.mock.fn<typeof nodePath.resolve>((...args) => nodePath.resolve(...args)),
            join: t.mock.fn<typeof nodePath.join>((...args) => nodePath.join(...args)),
            format: t.mock.fn<typeof nodePath.format>((...args) => nodePath.format(...args)),
            posix: {
                resolve: t.mock.fn<typeof nodePath.posix.resolve>((...args) => nodePath.posix.resolve(...args)),
            },
            relative: t.mock.fn<typeof nodePath.relative>((...args) => nodePath.relative(...args)),
        }
        const mockFileHandleMd = {
            write: t.mock.fn((a: Buffer) => Promise.resolve()),
            close: t.mock.fn(() => Promise.resolve())
        }
        const mockFileHandleImage = {
            write: t.mock.fn((a: Buffer) => Promise.resolve()),
            close: t.mock.fn(() => Promise.resolve())
        }
        const mockFs = {
            mkdir: t.mock.fn<typeof nodeFs.mkdir>(),
            readdir: t.mock.fn<typeof nodeFs.readdir>(
                (_a) => Promise.resolve<any>([
                    // 既に存在している画像ファイル
                    'page1-slug-3-123456AB.jpg',
                    'page1-slug-4-123456AB.jpg'
                ])
            ),
            unlink: t.mock.fn<typeof nodeFs.unlink>(),
            open: t.mock.fn<typeof nodeFs.open>((fname) => nodePath.extname(fname as string) === '.md' ? Promise.resolve(mockFileHandleMd as unknown as ReturnType<typeof nodeFs.open>) : Promise.resolve(mockFileHandleImage as unknown as ReturnType<typeof nodeFs.open>)),
        }

        const mockHashDigest = t.mock.fn(() => '123456ABCDE')
        const mockHashUpdate =
            t.mock.fn(() => ({ digest: mockHashDigest }))
        const mockCrypto = {
            createHash: t.mock.fn<typeof nodeCrypto.createHash>(() => ({
                update: mockHashUpdate
            } as unknown as ReturnType<typeof nodeCrypto.createHash>)),
        }

        const mockResponse = {
            'url': 'https://example.com/image1.jpg',
            'ok': true,
            'status': 200,
            'statusText': 'OK',
            'body': (async function* () {
                yield Buffer.from('image1.jpg data')
            })() as unknown as ReadableStream,
        }
        const mockFetch = t.mock.fn<typeof fetch>(() => Promise.resolve(mockResponse as unknown as Response))

        const client = new CliClient(notionClient)
        const slug = new CliSlug(mockUrl, mockPath as unknown as typeof nodePath, 'URL')
        const files = new CliFiles(
            mockUrl,
            mockFs as unknown as typeof nodeFs,
            mockPath as unknown as typeof nodePath,
            mockCrypto as unknown as typeof nodeCrypto,
            '/path/to/base'
        )
        const requester = new CliRequester(mockFetch)
        await pageCmd({
            client,
            slug,
            data_source_id: 'data-source-id',
            files,
            requester,
            flavor: {
                ...(new InitFlavor({
                    propsMapping: {
                        title: '名前',
                        tags: 'タグ',
                        slug: 'slug'
                    },
                    requester
                })).flavor,
            },
            addFilter: (filter) => {
                filter.recentFilter(60 * 1000 * 3)
            }
        })

        assert.deepStrictEqual(mockedQuery.mock.calls.map(call => call.arguments)[0][0]?.filter, {
            and: [
                {
                    multi_select: {
                        contains: 'zenn:zenn'
                    },
                    property: 'タグ'
                },
                {
                    multi_select: {
                        contains: 'zenn:article'
                    },
                    property: 'タグ'
                },
                {
                    property: 'slug',
                    rich_text: {
                        is_not_empty: true
                    }
                },
                {
                    last_edited_time: {
                        after: '1970-01-01T23:57:00.000Z'
                    },
                    timestamp: 'last_edited_time'
                }
            ]
        })
        assert.strictEqual(mockUrl.mock.calls[0].arguments[0], 'https://example.com/page1-slug')
        assert.strictEqual(mockPath.basename.mock.calls[0].arguments[0], '/page1-slug')
        assert.deepStrictEqual(mockPath.relative.mock.calls[0].arguments, ['/path/to/base', nodePath.join('/path/to/base', dirs.images, 'page1-slug', 'page1-slug-1-123456AB.jpg')])
        assert.deepStrictEqual(mockPath.relative.mock.calls[1].arguments, ['/path/to/base', nodePath.join('/path/to/base', dirs.images, 'page1-slug', 'page1-slug-2-123456AB.jpg')])
        assert.deepStrictEqual(mockPath.relative.mock.calls[2].arguments, ['/path/to/base', nodePath.join('/path/to/base', dirs.images, 'page1-slug', 'page1-slug-3-123456AB.jpg')])
        assert.deepStrictEqual(mockPath.relative.mock.calls[3].arguments, ['/path/to/base', nodePath.join('/path/to/base', dirs.images, 'page1-slug', 'page1-slug-4-123456AB.jpg')])
        assert.deepStrictEqual(mockFs.mkdir.mock.calls.map(call => call.arguments), [
            [nodePath.join('/path/to/base', dirs.pages), { recursive: true }],
            [nodePath.join('/path/to/base', dirs.images, 'page1-slug'), { recursive: true }],
        ])
        // Promise.all で実行しているので呼び出し順は保証されない。
        const openCallArgsName = mockFs.open.mock.calls.map(call => call.arguments[0])
        assert.ok(openCallArgsName.includes(nodePath.join('/path/to/base', dirs.pages, 'page1-slug.md')), JSON.stringify(openCallArgsName))
        assert.ok(openCallArgsName.includes(nodePath.join('/path/to/base', dirs.images, 'page1-slug', 'page1-slug-1-123456AB.jpg')), JSON.stringify(openCallArgsName))
        assert.ok(openCallArgsName.includes(nodePath.join('/path/to/base', dirs.images, 'page1-slug', 'page1-slug-2-123456AB.jpg')), JSON.stringify(openCallArgsName)) // 既に存在しているので処理しない
        assert.ok(!openCallArgsName.includes(nodePath.join('/path/to/base', dirs.images, 'page1-slug', 'page1-slug-4-123456AB.jpg')), JSON.stringify(openCallArgsName)) // 既に存在しているので処理しない
        assert.deepStrictEqual(mockFs.open.mock.calls.map(call => call.arguments[1]), [
            'w', 'w', 'w'
        ])
        // FileHandle は拡張子で分離してあるので、個別に判定
        assert.strictEqual(mockFileHandleMd.write.mock.callCount(), 1)
        const md = mockFileHandleMd.write.mock.calls.map(call => call.arguments)[0][0].toString()
        // front matter の順番は一定ではない、と思う。ズレるようならエンコードして確認か
        assert.strictEqual(md,
            `---
emoji: 📄
type: idea
topics:
  - test
published: false
---

test1

![](/images/page1-slug/page1-slug-1-123456AB.jpg)
*image1-caption*

![](/images/page1-slug/page1-slug-2-123456AB.jpg)
*image2-caption*

![](/images/page1-slug/page1-slug-3-123456AB.jpg)
`
        )
        assert.strictEqual(mockFileHandleMd.close.mock.callCount(), 1)

        assert.deepStrictEqual(mockFileHandleImage.write.mock.calls.map(call => call.arguments), [[Buffer.from('image1.jpg data')]])
        assert.strictEqual(mockFileHandleImage.close.mock.callCount(), 2)

        assert.deepStrictEqual(mockFs.unlink.mock.calls.map(call => call.arguments), [
            [nodePath.join('/path/to/base', dirs.images, 'page1-slug', 'page1-slug-4-123456AB.jpg')]
        ])

        assert.deepStrictEqual(mockHashUpdate.mock.calls.map(call => call.arguments), [
            ['https://example.com/image1.jpg'],
            ['https://example.com/image2.jpg'],
            ['https://example.com/image4.jpg'], // 存在確認ののためにファイル名組み立て用の hash 化は実施される
        ])
    })
})
