import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import type { Root } from 'hast'
import { h } from 'hastscript'
import { normalizeParagraph } from '../../src/lib/normalize-paragraph.ts'

describe('normalizeParagraph', () => {
    it('should merge consecutive paragraphs', () => {
        const input: Root = {
            type: 'root',
            children: [
                h('p', 'This is a paragraph.'),
                h('p', 'This is another paragraph.'),
            ],
        }
        const expectedOutput: Root = {
            type: 'root',
            children: [
                h('p', ['This is a paragraph.', '\n', 'This is another paragraph.']),
            ],
        }
        normalizeParagraph(input)
        assert.deepEqual(input, expectedOutput)
    })
    it('should merge consecutive paragraphs and remove empty paragraphs', () => {
        const input: Root = {
            type: 'root',
            children: [
                h('p', 'This is a paragraph.'),
                h('p', 'This is another paragraph.'),
                h('p'),
                h('p', [h('br')]),
                h('p', 'This is a third paragraph.'),
            ],
        }
        const expectedOutput: Root = {
            type: 'root',
            children: [
                h('p', ['This is a paragraph.', '\n', 'This is another paragraph.']),
                h('p', 'This is a third paragraph.'),
            ],
        }
        normalizeParagraph(input)
        assert.deepEqual(input, expectedOutput)
    })
    it('should pass non-paragraph elements', () => {
        const input: Root = {
            type: 'root',
            children: [
                h('p', 'This is a paragraph.'),
                h('p', 'This is another paragraph.'),
                h('p'),
                h('pre', [h('code', 'console.log("Hello, world!");')]),
                h('p', 'This is a third paragraph.'),
            ],
        }
        const expectedOutput: Root = {
            type: 'root',
            children: [
                h('p', ['This is a paragraph.', '\n', 'This is another paragraph.']),
                h('pre', [h('code', 'console.log("Hello, world!");')]),
                h('p', 'This is a third paragraph.'),
            ],
        }
        normalizeParagraph(input)
        assert.deepEqual(input, expectedOutput)
    })
    it('should normalize paragraphs inside details elements', () => {
        const input: Root = {
            type: 'root',
            children: [
                h('p', 'This is a paragraph.'),
                h('p', 'This is another paragraph.'),
                h('details', [
                    h('summary', 'summary'),
                    h('p', 'This is a paragraph in details.'),
                    h('p', 'This is another paragraph in details.'),
                    h('p'),
                    h('p', 'This is a third paragraph in details.'),
                ]),
                h('pre', [h('code', 'console.log("Hello, world!");')]),
                h('p', 'This is a third paragraph.'),
            ],
        }
        const expectedOutput: Root = {
            type: 'root',
            children: [
                h('p', ['This is a paragraph.', '\n', 'This is another paragraph.']),
                h('details', [
                    h('summary', 'summary'),
                    h('p', ['This is a paragraph in details.', '\n', 'This is another paragraph in details.']),
                    h('p', 'This is a third paragraph in details.'),
                ]),
                h('pre', [h('code', 'console.log("Hello, world!");')]),
                h('p', 'This is a third paragraph.'),
            ],
        }
        normalizeParagraph(input)
        assert.deepEqual(input, expectedOutput)
    })
    it('should normalize paragraphs inside callout', () => {
        const input: Root = {
            type: 'root',
            children: [
                h('p', 'This is a paragraph.'),
                h('p', 'This is another paragraph.'),
                h('div', {
                    style: 'background-color: #f0f0f0;'
                }, [
                    h('div', 'emoji'),
                    h('p', 'This is a paragraph in callout.'),
                    h('p', 'This is another paragraph in callout.'),
                    h('p'),
                    h('p', 'This is a third paragraph in callout.'),
                ]),
                h('pre', [h('code', 'console.log("Hello, world!");')]),
                h('p', 'This is a third paragraph.'),
            ],
        }
        const expectedOutput: Root = {
            type: 'root',
            children: [
                h('p', ['This is a paragraph.', '\n', 'This is another paragraph.']),
                h('div', {
                    style: 'background-color: #f0f0f0;'
                }, [
                    h('div', 'emoji'),
                    h('p', ['This is a paragraph in callout.', '\n', 'This is another paragraph in callout.']),
                    h('p', 'This is a third paragraph in callout.'),
                ]),
                h('pre', [h('code', 'console.log("Hello, world!");')]),
                h('p', 'This is a third paragraph.'),
            ],
        }
        normalizeParagraph(input)
        assert.deepEqual(input, expectedOutput)
    })
    it('should normalize paragraphs inside consecutive callouts', () => {
        const input: Root = {
            type: 'root',
            children: [
                h('p', 'This is a paragraph.'),
                h('p', 'This is another paragraph.'),
                h('div', {
                    style: 'background-color: #f0f0f0;'
                }, [
                    h('div', 'emoji'),
                    h('p', 'This is a paragraph in callout-1.'),
                    h('p', 'This is another paragraph in callout-1.'),
                    h('p'),
                    h('p', 'This is a third paragraph in callout-1.'),
                ]),
                h('div', {
                    style: 'background-color: #f0f0f0;'
                }, [
                    h('div', 'emoji'),
                    h('p', 'This is a paragraph in callout-2.'),
                    h('p', 'This is another paragraph in callout-2.'),
                    h('p'),
                    h('p', 'This is a third paragraph in callout-2.'),
                ]),
                h('pre', [h('code', 'console.log("Hello, world!");')]),
                h('p', 'This is a third paragraph.'),
            ],
        }
        const expectedOutput: Root = {
            type: 'root',
            children: [
                h('p', ['This is a paragraph.', '\n', 'This is another paragraph.']),
                h('div', {
                    style: 'background-color: #f0f0f0;'
                }, [
                    h('div', 'emoji'),
                    h('p', ['This is a paragraph in callout-1.', '\n', 'This is another paragraph in callout-1.']),
                    h('p', 'This is a third paragraph in callout-1.'),
                ]),
                h('div', {
                    style: 'background-color: #f0f0f0;'
                }, [
                    h('div', 'emoji'),
                    h('p', ['This is a paragraph in callout-2.', '\n', 'This is another paragraph in callout-2.']),
                    h('p', 'This is a third paragraph in callout-2.'),
                ]),
                h('pre', [h('code', 'console.log("Hello, world!");')]),
                h('p', 'This is a third paragraph.'),
            ],
        }
        normalizeParagraph(input)
        assert.deepEqual(input, expectedOutput)
    })
    it('should normalize paragraphs inside nested callout', () => {
        const input: Root = {
            type: 'root',
            children: [
                h('p', 'This is a paragraph.'),
                h('p', 'This is another paragraph.'),
                h('div', {
                    style: 'background-color: #f0f0f0;'
                }, [
                    h('div', 'emoji'),
                    h('p', 'This is a paragraph in callout.'),
                    h('p', 'This is another paragraph in callout.'),
                    h('div', {
                        style: 'background-color: #f0f0f0;'
                    }, [
                        h('div', 'emoji'),
                        h('p', 'This is a paragraph in nested callout.'),
                        h('p', 'This is another paragraph in nested callout.'),
                    ]),
                    h('p', 'This is a third paragraph in callout.'),
                ]),
                h('pre', [h('code', 'console.log("Hello, world!");')]),
                h('p', 'This is a third paragraph.'),
            ],
        }
        const expectedOutput: Root = {
            type: 'root',
            children: [
                h('p', ['This is a paragraph.', '\n', 'This is another paragraph.']),
                h('div', {
                    style: 'background-color: #f0f0f0;'
                }, [
                    h('div', 'emoji'),
                    h('p', ['This is a paragraph in callout.', '\n', 'This is another paragraph in callout.']),
                    h('div', {
                        style: 'background-color: #f0f0f0;'
                    }, [
                        h('div', 'emoji'),
                        h('p', ['This is a paragraph in nested callout.', '\n', 'This is another paragraph in nested callout.']),
                    ]),
                    h('p', 'This is a third paragraph in callout.'),
                ]),
                h('pre', [h('code', 'console.log("Hello, world!");')]),
                h('p', 'This is a third paragraph.'),
            ],
        }
        normalizeParagraph(input)
        assert.deepEqual(input, expectedOutput)
    })
})
