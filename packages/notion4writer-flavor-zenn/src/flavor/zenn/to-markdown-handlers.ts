import type { Options } from 'mdast-util-to-markdown'
import { defaultHandlers } from 'mdast-util-to-markdown'
import { getEquationBlockDataFromMdastNode, getEquationInlineDataFromMdastNode } from './common.ts'

export function zennFlavorToMarkdownHandlers(): Options['handlers'] {
    return {
        code: (node, parent, state, info) => {
            const result = defaultHandlers.code(node, parent, state, info)
            if ((typeof state.options.fence === 'string' || state.options.fence === undefined) && getEquationBlockDataFromMdastNode(node) === '') {
                // 数式ブロック対応
                return ['$$', '', ...result.split('\n').slice(1, -1), '', '$$'].join('\n')
            }
            return result
        },

        inlineCode: (node, parent, state, info) => {
            const result = defaultHandlers.inlineCode(node, parent, state)
            if (getEquationInlineDataFromMdastNode(node) === '') {
                // 数式インライン対応
                return `$${result.slice(1, -1)}$`
            }
            return result
        }
    }
}
