import type { Root, Element, ElementContent, RootContent } from 'hast'
import { convertElement } from 'hast-util-is-element'
import { h } from 'hastscript'

import { spliceChildren } from '@hankei6km/unist-util-splice-children'
import * as folders from '@hankei6km/unist-util-splice-children/utils/folders'

//import { removeWhitespace } from '../hast-remove-whitespace/hast-remove-whitespace.ts'


const isParagraph = convertElement('p')
const isDetails = convertElement('details')
const isSummery = convertElement('summary')
const isDiv = convertElement('div')
const isCallout = convertElement((node): node is Element & { tagName: 'div' } => {
    //if (isDiv(node) && typeof node.properties?.style === 'string' && node.properties.style.toString().includes('background-color:')) {
    if (isDiv(node)) {
        if (node.properties?.style?.toString().includes('background-color:')) {
            return true
        }
    }
    return false
})
const isBreak = convertElement('br')
const isImage = convertElement('img')
const isBlankParagraph = convertElement((node) => {
    if (isParagraph(node)) {
        if (node.children.length === 0) {
            return true
        }
        if (node.children.length === 1 && isBreak(node.children[0])) {
            return true
        }
    }
    return false
})
const isContentParagraph = convertElement((node) => {
    // return !isBlankParagraph(node) && isParagraph(node)  //  これだと `never` も含まれてしまう。
    if (!isBlankParagraph(node)) {
        return isParagraph(node)
    }
    return false
})

export function normalizeParagraph(tree: Root | Element) {
    //removeWhitespace(tree)
    spliceChildren(tree, {
        ...folders.getCallbacks({
            folders: [{
                // 空のパラグラフ、パラグラフ分割のためのフォルダ
                label: 'blank' as const,
                check: (node) => isBlankParagraph(node) ? [node] : [],
                fold: true
            }, {
                // 通常のパラグラフ、コンテンツとして扱う
                label: 'paragraph' as const,
                check: (node) => isContentParagraph(node) ? [node] : [],
                fold: true
            }, {
                // トグル（details要素）、この中も個別にパラグラフの正規化を行う
                label: 'details' as const,
                check: (node) => isDetails(node) ? [node] : [],
                fold: false
            }, {
                // コールアウト（背景色付きのdiv要素）、この中も個別にパラグラフの正規化を行う
                // 現状では、div の中でもコールアウトだけを対象にしているが、
                // 他のブロックタイプも将来的には対象にする可能性がある。
                label: 'callout' as const,
                check: (node) => isCallout(node) ? [node] : [],
                fold: false
            }, {
                label: 'others' as const,
                check: (node) =>
                    !isBlankParagraph(node)
                        && !isContentParagraph(node)
                        && !isDetails(node)
                        && !isCallout(node)
                        ? [node as ElementContent] : [],
                fold: true
            }],
        }),
        mapper: (item) => {
            if (folders.select(item, 'blank')) {
                return []
            } else if (folders.select(item, 'paragraph')) {
                return [{
                    contents: [h('p', item.contents.flatMap((p, index, contents) => {
                        //return [...p.children, h('br')]
                        if (index < contents.length - 1) {
                            return [...p.children, '\n']
                        }
                        return [...p.children]
                    }))],
                    data: item.data,
                }]
            } else if (folders.select(item, 'details') || folders.select(item, 'callout')) {
                for (const c of item.contents) {
                    // summmry やアイコンの div などもまとめて処理している。
                    // 現状、問題ないように見えるが対応が必要になるかもしれない。
                    normalizeParagraph(c)
                }
                return [item]
            }
            return [item]
        }
    })
}
