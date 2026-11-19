import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import type { Root, Element } from 'hast'
import { h } from 'hastscript'

import { prepareColonBlock, maxDepthUtil } from '../../../src/flavor/zenn/hast-tree-handlers.ts'

describe('maxDepthUtil', () => {
    it('should retun 0 for a root with no colon blocks', () => {
        // ノードの探索は Root からではなく、Root 直下の childern の colon block から始まる
        const input = h('div', { style: 'background-color:#EBECED;' }, [])

        const expectedOutput = 0
        const getMaxDepth = maxDepthUtil()
        const info = getMaxDepth(input)
        assert.strictEqual(info.maxDepth, expectedOutput)
        assert.deepStrictEqual(info.targets, [])
    })
    it('should return 1 for a root with one level of colon blocks', () => {
        const input = h('div', { style: 'background-color:#EBECED;' }, [
            h('details', {}, ['detail-1'])
        ])

        const expectedOutput = 1
        const getMaxDepth = maxDepthUtil()
        const info = getMaxDepth(input)
        assert.strictEqual(info.maxDepth, expectedOutput)
        assert.deepStrictEqual(info.targets, [{
            depth: 1,
            node: input.children[0],
        }])
    })
    it('should return 3 for a root with three levels of colon blocks', () => {
        const input = h('details', {}, [
            h('div', { style: 'background-color:#EBECED;' }, [
                h('details', {}, [
                    h('div', { style: 'background-color:#EBECED;' }, ['message-1-1'])
                ])
            ])
        ])
        const expectedOutput = 3
        const getMaxDepth = maxDepthUtil()
        const info = getMaxDepth(input)
        assert.strictEqual(info.maxDepth, expectedOutput)
        assert.deepStrictEqual(info.targets, [{
            depth: 3,
            node: ((input.children[0] as Element).children[0] as Element).children[0],
        },
        {
            depth: 2,
            node: (input.children[0] as Element).children[0],
        },
        {
            depth: 1,
            node: input.children[0],
        }])
    })
    it('should return 3 for a root with mixed levels of colon blocks across sibling nodes', () => {
        const input = h('details', {}, [
            h('div', { style: 'background-color:#EBECED;' }, [
                h('details', {}, ['detail-1-1']),
                h('details', {}, [
                    h('div', { style: 'background-color:#EBECED;' }, ['message-2-1'])
                ])
            ])
        ])
        const expectedOutput = 3
        const getMaxDepth = maxDepthUtil()
        const info = getMaxDepth(input)
        assert.strictEqual(info.maxDepth, expectedOutput)
        assert.deepStrictEqual(info.targets, [{
            depth: 2,
            node: (input.children[0] as Element).children[0],
        },
        {
            depth: 3,
            node: ((input.children[0] as Element).children[1] as Element).children[0],
        },
        {
            depth: 2,
            node: (input.children[0] as Element).children[1],
        },
        {
            depth: 1,
            node: input.children[0],
        }])
    })
})

describe('prepareColonBlock', () => {
    it('should correctly annotate colon blocks with their depth', () => {
        const input: Root = {
            type: 'root',
            children: [
                h('h2', {}, ['Heading 2']),
                h('details', {}, [h('summary', {}, ['Summary']), 'detail-1']),
                h('p', {}, ['Some paragraph']),
                h('details', {}, [
                    h('summary', {}, ['Summary']),
                    h('div', { style: 'background-color:#EBECED;' }, [
                        h('details', {}, [
                            h('summary', {}, ['Summary']),
                            'detail-1-1'
                        ]),
                        h('details', {}, [
                            h('summary', {}, ['Summary']),
                            h('div', { style: 'background-color:#FBE4E4;' }, ['message-alert-2-1'])
                        ])
                    ])
                ])
            ]
        }
        prepareColonBlock(input)
        assert.deepEqual(input, {
            type: 'root',
            children: [
                h('h2', {}, ['Heading 2']),
                {
                    ...h('details', {}, [h('summary', {}, ['Summary']), 'detail-1']),
                    properties: { // hastscript は属性名をキャメルケースに変換するための対応
                        'data-notion2zenn-colon-block-label': ':::',
                        'data-notion2zenn-colon-block-type': 'details Summary'
                    }
                },
                h('p', {}, ['Some paragraph']),
                {
                    ...h('details', {}, [
                        h('summary', {}, ['Summary']),
                        {
                            ...h('div', {}, [
                                {
                                    ...h('details', {}, [h('summary', {}, ['Summary']), 'detail-1-1']),
                                    properties: {
                                        'data-notion2zenn-colon-block-label': '::::',
                                        'data-notion2zenn-colon-block-type': 'details Summary'
                                    }
                                }, {
                                    ...h('details', {}, [
                                        h('summary', {}, ['Summary']),
                                        {
                                            ...h('div', {}, ['message-alert-2-1']),
                                            properties: {
                                                style: 'background-color:#FBE4E4;',
                                                'data-notion2zenn-colon-block-label': ':::',
                                                'data-notion2zenn-colon-block-type': 'message alert'
                                            }
                                        }
                                    ]),
                                    properties: {
                                        'data-notion2zenn-colon-block-label': '::::',
                                        'data-notion2zenn-colon-block-type': 'details Summary'
                                    }
                                }
                            ]),
                            properties: {
                                style: 'background-color:#EBECED;',
                                'data-notion2zenn-colon-block-label': ':::::',
                                'data-notion2zenn-colon-block-type': 'message'
                            }
                        }
                    ]),
                    properties: {
                        'data-notion2zenn-colon-block-label': '::::::',
                        'data-notion2zenn-colon-block-type': 'details Summary'
                    }
                }
            ]
        })
    })
})
