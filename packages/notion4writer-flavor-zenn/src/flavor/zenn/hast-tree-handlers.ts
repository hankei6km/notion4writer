import type { Root, Element, ElementContent, RootContent } from 'hast'
import { convertElement } from 'hast-util-is-element'

import { spliceChildren } from '@hankei6km/unist-util-splice-children'
import * as folders from '@hankei6km/unist-util-splice-children/utils/folders'
import { colonBlockDataName, isCallout, isDetails, setColonBlockData } from './common.ts'

type MaxDepthInfo = {
    maxDepth: number
    targets: {
        depth: number
        node: Element
    }[]
}

export function maxDepthUtil() {
    const info: MaxDepthInfo = {
        maxDepth: 0,
        targets: []
    }
    function getMaxDepth(tree: Root | Element, depth: number = 1) {
        spliceChildren(tree, {
            ...folders.getCallbacks({
                folders: [{
                    label: 'details' as const,
                    check: (node) => isDetails(node) ? [node] : [],
                    fold: false
                }, {
                    label: 'callout' as const,
                    check: (node) => isCallout(node) ? [node] : [],
                    fold: false
                }, {
                    label: 'others' as const,
                    check: (node) =>
                        !isDetails(node) && !isCallout(node)
                            ? [node as ElementContent] : [],
                    fold: true
                }],
            }),
            mapper: (item) => {
                if (folders.select(item, 'details') || folders.select(item, 'callout')) {
                    depth > info.maxDepth && (info.maxDepth = depth)
                    for (const c of item.contents) {
                        getMaxDepth(c, depth + 1)
                        info.targets.push({
                            depth: depth,
                            node: c as Element
                        })
                    }
                    return [item]
                }
                return [item]
            }
        })
        return info
    }
    return getMaxDepth
}

export function prepareColonBlock(tree: Root) {
    spliceChildren(tree, {
        ...folders.getCallbacks({
            folders: [{
                label: 'details' as const,
                check: (node) => isDetails(node) ? [node] : [],
                fold: false
            }, {
                label: 'callout' as const,
                check: (node) => isCallout(node) ? [node] : [],
                fold: false
            }, {
                label: 'others' as const,
                check: (node) =>
                    !isDetails(node) && !isCallout(node)
                        ? [node as ElementContent] : [],
                fold: true
            }],
        }),
        mapper: (item) => {
            if (folders.select(item, 'details') || folders.select(item, 'callout')) {
                for (const c of item.contents) {
                    const getMaxDepth = maxDepthUtil()
                    const info = getMaxDepth(c)
                    for (const t of info.targets) {
                        setColonBlockData(t.node, info.maxDepth, t.depth, '')
                    }
                    setColonBlockData(c, info.maxDepth, 0, '')
                }
                return [item]
            }
            return [item]
        }
    })
    return
}
