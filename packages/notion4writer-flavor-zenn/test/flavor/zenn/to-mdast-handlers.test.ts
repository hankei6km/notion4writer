import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import type { Root } from 'hast'
import { h } from 'hastscript'
import { toMdast } from 'hast-util-to-mdast'
import { frontmatterToMarkdown } from 'mdast-util-frontmatter'
import { gfmTableToMarkdown } from 'mdast-util-gfm-table'
import { gfmStrikethroughToMarkdown } from 'mdast-util-gfm-strikethrough'
import { gfmFootnoteToMarkdown } from 'mdast-util-gfm-footnote'
import { toMarkdown } from 'mdast-util-to-markdown'

import { zennFlavorToMdastHandlers } from '../../../src/flavor/zenn/to-mdast-handlers.ts'
import { prepareColonBlock } from '../../../src/flavor/zenn/hast-tree-handlers.ts'
import { setEquationBlockDataToElement, setEquationInlineDataToElement } from '../../../src/flavor/zenn/common.ts'

describe('zennFlavorToMdastHandlers', () => {
    it('should convert a code block correctly', () => {
        const tree: Root = {
            type: 'root', children: [
                h('p', 'Hello, world!'),
                h('figure', [
                    h('pre', [
                        h('code', { className: 'javascript' }, 'console.log("Hello, world!")')
                    ])
                ])
            ]
        }
        const handlers = zennFlavorToMdastHandlers()
        const mdast = toMdast(tree, { handlers: { ...handlers } })
        assert.strictEqual(toMarkdown(mdast, {
            extensions: [
                frontmatterToMarkdown(['yaml']),
                gfmTableToMarkdown(),
                gfmStrikethroughToMarkdown(),
                gfmFootnoteToMarkdown()
            ]
        }), `Hello, world!

\`\`\`javascript
console.log("Hello, world!")
\`\`\`
`)
    })
    it('should convert a equation(pre) block correctly', () => {
        const equation = h('pre', '\\frac{1}{2}\\\\frac{2}{3}')
        setEquationBlockDataToElement(equation)
        const tree: Root = {
            type: 'root', children: [
                h('p', 'Hello, world!'),
                equation,
            ]
        }
        const handlers = zennFlavorToMdastHandlers()
        const mdast = toMdast(tree, { handlers: { ...handlers } })
        assert.deepStrictEqual(mdast, {
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
        })
    })
    it('should convert a equation(code) inline correctly', () => {
        const equation = h('code', '\\frac{1}{2}\\\\frac{2}{3}')
        setEquationInlineDataToElement(equation)
        const tree: Root = {
            type: 'root', children: [
                h('p', ['Hello, world!', equation]),
            ]
        }
        const handlers = zennFlavorToMdastHandlers()
        const mdast = toMdast(tree, { handlers: { ...handlers } })
        assert.deepStrictEqual(mdast, {
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
        })
    })
    it('should convert a details block correctly', () => {
        const tree: Root = {
            type: 'root', children: [
                h('p', 'Hello, world!'),
                h('details',
                    { style: 'color:#9B9A97' },
                    [
                        h('summary', 'More info'),
                        h('p', 'This is additional information.')
                    ])
            ]
        }
        // detailsなどのコロンブロックは事前にhast tree の処理が必要
        prepareColonBlock(tree)
        const handlers = zennFlavorToMdastHandlers()
        const mdast = toMdast(tree, { handlers: { ...handlers } })
        assert.strictEqual(toMarkdown(mdast, {
            extensions: [
                frontmatterToMarkdown(['yaml']),
                gfmTableToMarkdown(),
                gfmStrikethroughToMarkdown(),
                gfmFootnoteToMarkdown()
            ]
        }), `Hello, world!

:::details More info

This is additional information.

:::
`)
    })
    it('should not convert a details block when the summary is empty', () => {
        const tree: Root = {
            type: 'root', children: [
                h('p', 'Hello, world!'),
                h('details',
                    { style: 'color:#9B9A97' },
                    [
                        h('summary'),
                        h('p', 'This is additional information.')
                    ]
                )
            ]
        }
        prepareColonBlock(tree)
        const handlers = zennFlavorToMdastHandlers()
        const mdast = toMdast(tree, { handlers: { ...handlers } })
        assert.strictEqual(toMarkdown(mdast, {
            extensions: [
                frontmatterToMarkdown(['yaml']),
                gfmTableToMarkdown(),
                gfmStrikethroughToMarkdown(),
                gfmFootnoteToMarkdown()
            ]
        }), `Hello, world!

This is additional information.
`)
    })
    it('should convert a message block correctly', () => {
        const tree: Root = {
            type: 'root', children: [
                h('p', 'Hello, world!'),
                h('div', { style: 'background-color:#EBECED' }, [
                    h('div', 'emoji-info'),
                    h('p', 'This is a message.')
                ])
            ]
        }
        prepareColonBlock(tree)
        const handlers = zennFlavorToMdastHandlers()
        const mdast = toMdast(tree, { handlers: { ...handlers } })
        assert.strictEqual(toMarkdown(mdast, {
            extensions: [
                frontmatterToMarkdown(['yaml']),
                gfmTableToMarkdown(),
                gfmStrikethroughToMarkdown(),
                gfmFootnoteToMarkdown()
            ]
        }), `Hello, world!

:::message

This is a message.

:::
`)
    })
    it('should convert a message alert block correctly', () => {
        const tree: Root = {
            type: 'root', children: [
                h('p', 'Hello, world!'),
                h('div', { style: 'background-color:#FBE4E4' }, [
                    h('div', 'emoji-info'),
                    h('p', 'This is a message alert.')
                ])
            ]
        }
        prepareColonBlock(tree)
        const handlers = zennFlavorToMdastHandlers()
        const mdast = toMdast(tree, { handlers: { ...handlers } })
        assert.strictEqual(toMarkdown(mdast, {
            extensions: [
                frontmatterToMarkdown(['yaml']),
                gfmTableToMarkdown(),
                gfmStrikethroughToMarkdown(),
                gfmFootnoteToMarkdown()
            ]
        }), `Hello, world!

:::message alert

This is a message alert.

:::
`)
    })
    it('should convert a message alert block with details correctly', () => {
        const tree: Root = {
            type: 'root', children: [
                h('p', 'Hello, world!'),
                h('div', { style: 'background-color:#FBE4E4' }, [
                    h('div', 'emoji-info'),
                    h('p', 'This is a message alert.'),
                    h('details',
                        { style: 'color:#9B9A97' },
                        [
                            h('summary', 'More info'),
                            h('p', 'This is additional information.')
                        ])
                ])
            ]
        }
        prepareColonBlock(tree)
        const handlers = zennFlavorToMdastHandlers()
        const mdast = toMdast(tree, { handlers: { ...handlers } })
        assert.strictEqual(toMarkdown(mdast, {
            extensions: [
                frontmatterToMarkdown(['yaml']),
                gfmTableToMarkdown(),
                gfmStrikethroughToMarkdown(),
                gfmFootnoteToMarkdown()
            ]
        }), `Hello, world!

::::message alert

This is a message alert.

:::details More info

This is additional information.

:::

::::
`)
    })
    it('should convert a note block correctly', () => {
        const tree = h('div', [
            h('p', 'Hello, world!'),
            h('p', [
                'This is a note.',
                h('a', { href: '#' }, '[^note-1]')
            ]),
            h('p', [
                h('a', { href: 'https://www.npmjs.com/' }, 'npmjs')
            ]),
            h('p', [
                '[^note-1]: This is a definition.',
            ])
        ])
        const handlers = zennFlavorToMdastHandlers()
        const mdast = toMdast(tree, { handlers: { ...handlers } })
        assert.strictEqual(toMarkdown(mdast, {
            extensions: [
                frontmatterToMarkdown(['yaml']),
                gfmTableToMarkdown(),
                gfmStrikethroughToMarkdown(),
                gfmFootnoteToMarkdown()
            ]
        }), `Hello, world!

This is a note.[^note-1]

[npmjs](https://www.npmjs.com/)

[^note-1]: This is a definition.
`)
    })
    it('should not convert Zenn-specific blocks inside a blockquote', () => {
        const tree = h('div', [
            h('p', 'Hello, world!'),
            h('blockquote', [
                // code block の言語指定は一般的なので変換される
                h('figure', [
                    h('pre', [
                        h('code', { className: 'javascript' }, 'console.log("Hello, world!")')
                    ])
                ]),
                h('details',
                    { style: 'color:#9B9A97' },
                    [
                        h('summary'),
                        h('p', 'This is additional information.')
                    ]
                ),
                h('div', { style: 'background-color:#EBECED' }, [
                    h('div', 'emoji-info'),
                    h('div', [
                        h('p', 'This is a message.')
                    ])
                ]),
                h('p', [
                    'This is a note.',
                    h('a', { href: '#' }, '[^note-1]')
                ]),
                h('p', [
                    h('a', { href: 'https://www.npmjs.com/' }, 'npmjs')
                ]),
                h('p', [
                    '[^note-1]: This is a definition.',
                ])
            ])
        ])
        const handlers = zennFlavorToMdastHandlers()
        const mdast = toMdast(tree, { handlers: { ...handlers } })
        assert.strictEqual(toMarkdown(mdast, {
            extensions: [
                frontmatterToMarkdown(['yaml']),
                gfmTableToMarkdown(),
                gfmStrikethroughToMarkdown(),
                gfmFootnoteToMarkdown()
            ]
        }), `Hello, world!

> \`\`\`javascript
> console.log("Hello, world!")
> \`\`\`
>
> This is additional information.
>
> emoji-info
>
> This is a message.
>
> This is a note.[\\[^note-1\\]](#)
>
> [npmjs](https://www.npmjs.com/)
>
> \\[^note-1]: This is a definition.
`)
    })
})
