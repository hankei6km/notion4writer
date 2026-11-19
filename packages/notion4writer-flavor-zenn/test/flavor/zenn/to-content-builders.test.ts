import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { BaseRequester } from '@hankei6km/notion4writer/utils'

import type { Root, Element } from 'hast'
import { h } from 'hastscript'

import { CustomBlockEquationToHast, CustomBlockBookmarkToHast, CustomBlockEmbedToHast, CustomBlockLinkPreviewToHast, CustomRichTextToHast } from '../../../src/flavor/zenn/to-content-builders.ts'
import { setEquationBlockDataToElement, setEquationInlineDataToElement } from '../../../src/flavor/zenn/common.ts'

describe('CustomBlockEquationToHast', () => {
    it('should build equation block to hast', async () => {
        const builder = new CustomBlockEquationToHast()
        assert.ok(builder.isBreak(''))
        assert.deepStrictEqual(builder.outerTag(), { name: null })
        const equation = h('pre', '\\frac{1}{2}\\\\frac{2}{3}')
        setEquationBlockDataToElement(equation)
        const expect = [
            equation,
        ]
        assert.deepEqual(await builder.build({
            block: {
                type: 'equation',
                equation: {
                    expression: '\\frac{1}{2}\\\\frac{2}{3}'
                }
            }
        } as any), expect)
    })
})

describe('CustomBlockBookmarkToHast', () => {
    it('should build bookmark block to hast', async () => {
        const builder = new CustomBlockBookmarkToHast()
        assert.ok(builder.isBreak(''))
        assert.deepStrictEqual(builder.outerTag(), { name: null })
        const p = h('p', {}, 'https://example.com')
        const expect = [
            p,
        ]
        assert.deepEqual(await builder.build({
            block: {
                type: 'bookmark',
                bookmark: {
                    url: 'https://example.com'
                }
            }
        } as any), expect)
    })
})

describe('CustomBlockEmbedToHast', () => {
    class TestRequester extends BaseRequester {
        async text(url: string): Promise<string> {
            return `HTML content for ${url}`
        }
        async *media(url: string): AsyncIterableIterator<Buffer, void, unknown> {
            throw new Error('Method not mocked.')
        }
    }
    it('should build embed block to hast', async () => {
        const builder = new CustomBlockEmbedToHast({ requester: new TestRequester() })
        assert.ok(builder.isBreak(''))
        assert.deepStrictEqual(builder.outerTag(), { name: null })
        const p = h('p', {}, 'https://example.com')
        const expect = [
            p,
        ]
        assert.deepEqual(await builder.build({
            block: {
                type: 'embed',
                embed: {
                    url: 'https://example.com'
                }
            }
        } as any), expect)
    })
    it('should build embed block to hast(gist)', async () => {
        const builder = new CustomBlockEmbedToHast({ requester: new TestRequester() })
        assert.ok(builder.isBreak(''))
        assert.deepStrictEqual(builder.outerTag(), { name: null })
        const p = h('p', {}, '@', h('a', { href: 'https://gist.github.com/' }, 'gist'))
        const expect = [
            p,
        ]
        assert.deepEqual(await builder.build({
            block: {
                type: 'embed',
                embed: {
                    url: 'https://gist.github.com/'
                }
            }
        } as any), expect)
    })
    it('should build embed block to hast(html-css)', async () => {
        const builder = new CustomBlockEmbedToHast({ requester: new TestRequester() })
        assert.ok(builder.isBreak(''))
        assert.deepStrictEqual(builder.outerTag(), { name: null })
        const url = 'https://prod-files-secure-apne1.s3.ap-northeast-1.amazonaws.com/abc-123/abc-456/weather-forecast.html?X-'
        const codeBlock = h('figure', {}, h('pre', {}, h('code', { class: 'html-embed' }, `HTML content for ${url}`)))
        const expect = [
            codeBlock,
        ]
        assert.deepEqual(await builder.build({
            block: {
                type: 'embed',
                embed: {
                    url
                }
            }
        } as any), expect)
    })
})

describe('CustomBlockLinkPreviewToHast', () => {
    it('should build link preview block to hast', async () => {
        const builder = new CustomBlockLinkPreviewToHast()
        assert.ok(builder.isBreak(''))
        assert.deepStrictEqual(builder.outerTag(), { name: null })
        const p = h('p', {}, 'https://example.com')
        const expect = [
            p,
        ]
        assert.deepEqual(await builder.build({
            block: {
                type: 'link_preview',
                link_preview: {
                    url: 'https://example.com'
                }
            }
        } as any), expect)
    })
})

describe('CustomRichTextToHast', () => {
    it('should build rich text to hast', async () => {
        const builder = new CustomRichTextToHast()
        const equation = h('code', '\\frac{1}{2}\\\\frac{2}{3}')
        setEquationInlineDataToElement(equation)
        assert.deepStrictEqual(builder.equationToHast({
            type: 'equation',
            equation: {
                expression: '\\frac{1}{2}\\\\frac{2}{3}'
            }
        } as any), equation)
    })
})
