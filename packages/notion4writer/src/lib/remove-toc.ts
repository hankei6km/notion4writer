import type { Root, Element, ElementContent, RootContent } from 'hast'
import { convertElement } from 'hast-util-is-element'
import { h } from 'hastscript'

import { spliceChildren } from '@hankei6km/unist-util-splice-children'
import * as folders from '@hankei6km/unist-util-splice-children/utils/folders'

//import { removeWhitespace } from '../hast-remove-whitespace/hast-remove-whitespace.ts'


const isHr = convertElement('hr')
const isDetails = convertElement('details')
const isSummary = convertElement('summary')
const isToc = convertElement((_element, index, parent) => {
    if (typeof index === 'number' && parent && index < parent.children.length - 3) {
        const prevHr = parent.children[index]
        const details = parent.children[index + 1]
        const nextHr = parent.children[index + 2]
        if (isHr(prevHr) && isDetails(details) && isHr(nextHr)) {
            if (isSummary(details.children[0])) {
                return true
            }
        }
    }
    return false
})


export function removeToc(tree: Root) {
    //removeWhitespace(tree)
    spliceChildren(tree, {
        ...folders.getCallbacks({
            folders: [{
                label: 'toc' as const,
                check: (node, index, _children, value) => {
                    return isToc(node, index, value) ?
                        [
                            value.children[index],
                            value.children[index + 1],
                            value.children[index + 2]
                        ] as [Element & { tagName: 'hr' }, Element & { tagName: 'details' }, Element & { tagName: 'hr' }] :
                        []
                },
                fold: false
            }, {
                label: 'others' as const,
                check: (node, index, _children, value) => !isToc(node, index, value) ? [node as ElementContent] : [],
                fold: true
            }],
        }),
        mapper: (item) => {
            if (folders.select(item, 'toc')) {
                return []
            }
            return [item]
        }
    })
}

