import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import type { Root } from 'hast'
import { h } from 'hastscript'
import { removeToc } from '../../src/lib/remove-toc.ts'

describe('removeToc', () => {
    it('should remove the table of contents from the document', () => {
        const input: Root = {
            type: 'root',
            children: [
                h('p', 'This is a paragraph.'),
                h('hr'),
                h('details', [
                    h('summary', 'Table of Contents'),
                    h('ul', [
                        h('li', 'Item 1'),
                        h('li', 'Item 2'),
                    ]),
                ]),
                h('hr'),
                h('p', 'This is another paragraph.'),
            ],
        }
        const expectedOutput: Root = {
            type: 'root',
            children: [
                h('p', 'This is a paragraph.'),
                h('p', 'This is another paragraph.'),
            ],
        }
        removeToc(input)
        assert.deepEqual(input, expectedOutput)
    })
    it('should not remove non-TOC details elements', () => {
        const input: Root = {
            type: 'root',
            children: [
                h('p', 'This is a paragraph.'),
                h('hr'),
                h('details', [
                    h('summary', 'Table of Contents'),
                    h('ul', [
                        h('li', 'Item 1'),
                        h('li', 'Item 2'),
                    ]),
                ]),
                h('hr'),
                h('p', 'This is another paragraph.'),
                h('details', [
                    h('summary', 'toggle'),
                    h('p', 'This is a toggle content.'),
                ]),
            ],
        }
        const expectedOutput: Root = {
            type: 'root',
            children: [
                h('p', 'This is a paragraph.'),
                h('p', 'This is another paragraph.'),
                h('details', [
                    h('summary', 'toggle'),
                    h('p', 'This is a toggle content.'),
                ]),
            ],
        }
        removeToc(input)
        assert.deepEqual(input, expectedOutput)
    })
})
