import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import type { Root } from 'mdast'
import { h } from 'hastscript'
import { frontmatterToMarkdown } from 'mdast-util-frontmatter'
import { gfmTableToMarkdown } from 'mdast-util-gfm-table'
import { gfmStrikethroughToMarkdown } from 'mdast-util-gfm-strikethrough'
import { gfmFootnoteToMarkdown } from 'mdast-util-gfm-footnote'
import { toMarkdown } from 'mdast-util-to-markdown'

import { setEquationInlineDataToElement } from '../../../src/flavor/zenn/common.ts'
import { zennFlavorToMarkdownHandlers } from '../../../src/flavor/zenn/to-markdown-handlers.ts'

describe('zennFlavorToMdastHandlers', () => {
    it('should convert a equation(pre) block correctly', () => {
        const tree: Root = {
            type: 'root',
            children: [
                {
                    type: 'paragraph',
                    children: [
                        {
                            type: 'text',
                            value: 'Hello, world!'
                        }
                    ]
                },
                {
                    type: 'code',
                    lang: null,
                    meta: null,
                    data: {
                        'data-notion2zenn-equation-block': ''
                    },
                    value: '\\frac{1}{2}\\\\frac{2}{3}'
                }
            ]
        }
        assert.strictEqual(toMarkdown(tree, {
            handlers: { ...zennFlavorToMarkdownHandlers() },
            extensions: [
                frontmatterToMarkdown(['yaml']),
                gfmTableToMarkdown(),
                gfmStrikethroughToMarkdown(),
                gfmFootnoteToMarkdown()
            ]
        }), `Hello, world!

$$

\\frac{1}{2}\\\\frac{2}{3}

$$
`)
    })
    it('should convert a equation(code) inline correctly', () => {
        const equation = h('code', '\\frac{1}{2}\\\\frac{2}{3}')
        setEquationInlineDataToElement(equation)
        const tree: Root = {
            type: 'root',
            children: [
                {
                    type: 'paragraph',
                    children: [
                        {
                            type: 'text',
                            value: 'Hello, world!'
                        },
                        {
                            type: 'inlineCode',
                            data: {
                                'data-notion2zenn-equation-inline': ''
                            },
                            value: '\\frac{1}{2}\\\\frac{2}{3}'
                        }
                    ]
                },
            ]
        }
        assert.strictEqual(toMarkdown(tree, {
            handlers: { ...zennFlavorToMarkdownHandlers() },
            extensions: [
                frontmatterToMarkdown(['yaml']),
                gfmTableToMarkdown(),
                gfmStrikethroughToMarkdown(),
                gfmFootnoteToMarkdown()
            ]
        }), `Hello, world!$\\frac{1}{2}\\\\frac{2}{3}$\n`)
    })
})
