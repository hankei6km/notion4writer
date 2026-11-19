import type { Paragraph as MdastParagraph, Emphasis as MdastEmphasis } from 'mdast'
import type { Options } from 'hast-util-to-mdast'
import { defaultHandlers } from 'hast-util-to-mdast'
import { toText } from 'hast-util-to-text'
import { getColonBlockData, getEquationBlockDataFromElement, getEquationInlineDataFromElement, setEquationBlockDataToMdastNode, setEquationInlineDataToMdastNode } from './common.ts'

class Handling {
    protected handling: { blockquote: number } = { blockquote: 0 }
    constructor() {
    }
    in(key: keyof typeof this.handling) {
        this.handling[key]++
    }
    out(key: keyof typeof this.handling) {
        this.handling[key]--
        if (this.handling[key] < 0) {
            throw new Error(`Handling for ${key} went below zero`)
        }
    }
    isIn(key: keyof typeof this.handling) {
        return this.handling[key]
    }
    reset() {
        for (const key in this.handling) {
            this.handling[key as keyof typeof this.handling] = 0
        }
    }
}


export function zennFlavorToMdastHandlers(): Options['handlers'] {
    const handling = new Handling()
    return {
        pre: (state, node, parent) => {
            if (parent && parent.type === 'element' && parent.tagName === 'figure' && node.children[0].type === 'element' && node.children[0].tagName === 'code') {
                // code block の言語指定対応
                const m = defaultHandlers.pre(state, node)
                m.lang = node.children[0].properties['className']?.toString()
                state.patch(node, m)
                return m
            } else if (getEquationBlockDataFromElement(node) === '') {
                // 数式ブロック対応
                const m = defaultHandlers.pre(state, node)
                state.patch(node, m)
                setEquationBlockDataToMdastNode(m) // Data に数式ブロック情報を設定
                return m
            }
            return defaultHandlers.pre(state, node)
        },
        code: (state, node, parent) => {
            if (getEquationInlineDataFromElement(node) === '') {
                // 数式インライン対応
                const m = defaultHandlers.code(state, node)
                state.patch(node, m)
                setEquationInlineDataToMdastNode(m) // Data に数式インライン情報を設定
                return m
            }
            return defaultHandlers.code(state, node)
        },
        figure: (state, node) => {
            if (node.children.length === 2 &&
                node.children[0].type === 'element' && node.children[0].tagName === 'img' &&
                node.children[1].type === 'element' && node.children[1].tagName === 'figcaption') {
                //const captionText = node.children[1].children.filter(child => child.type === 'text').map(child => child.value).join('')
                const captionText = toText(node.children[1])
                if (captionText !== '') { // Notion 画像キャプションを空白にすると figcaption は存在しなくなるが、念のため確認はする。
                    const caption: MdastEmphasis = { type: 'emphasis', children: [{ type: 'text', value: captionText }] }
                    state.patch(node.children[1], caption)
                    const img = defaultHandlers.img(state, node.children[0])
                    state.patch(node.children[0], img)
                    return [{
                        type: 'paragraph', children: [
                            // ブロックとして扱いたい img が段落の中にあるのもおかしい気もするが、
                            // img と caption を 1 つのブロックとして扱うため(caption の後に空行を追加する意味もある)
                            img,
                            { type: 'text', value: '\n' }, // type = 'break' の代わりに改行テキストを挿入。'break' でも処理されれたが、Zenn Markdown 記法のサンプルに従う。
                            caption,
                        ]
                    }]
                }
            }
            return defaultHandlers.figure(state, node)
        },
        blockquote(state, node, parent) {
            // 引用の中では Zenn 用へ変換を行わないようにする。
            handling.in('blockquote')
            const result = defaultHandlers.blockquote(state, node)
            handling.out('blockquote')
            return result
        },
        details(state, node) {
            if (!handling.isIn('blockquote')) {
                // `::: details` 対応
                const colonBlockData = getColonBlockData(node)
                if (colonBlockData.label && colonBlockData.type) {
                    const head: MdastParagraph = { type: 'paragraph', children: [{ type: 'text', value: `${colonBlockData.label}${colonBlockData.type}` }] }
                    const body = state.all({ type: 'root', children: node.children.slice(1) })
                    const bottom: MdastParagraph = { type: 'paragraph', children: [{ type: 'text', value: colonBlockData.label }] }
                    state.patch(node, head)
                    return [head, ...body, bottom]
                }
            }
            return defaultHandlers.details(state, node)
        },
        div(state, node) {
            if (!handling.isIn('blockquote')) {
                // `::: message` 対応
                const colonBlockData = getColonBlockData(node)
                if (colonBlockData.label && colonBlockData.type) {
                    const head: MdastParagraph = { type: 'paragraph', children: [{ type: 'text', value: `${colonBlockData.label}${colonBlockData.type}` }] }
                    const body = state.all({ type: 'root', children: node.children.slice(1) })
                    const bottom: MdastParagraph = { type: 'paragraph', children: [{ type: 'text', value: colonBlockData.label }] }
                    state.patch(node, head)
                    return [head, ...body, bottom]
                }
            }
            return defaultHandlers.div(state, node)
        },
        a(state, node, parent) {
            if (!handling.isIn('blockquote')) {
                // 脚注の参照対応
                // 以下の問題がある
                // - 脚注の定義が存在しているかチェックしていない
                //   - 普通のリンクであっても誤って脚注参照として扱われる可能性がある
                // - 引用の中などであっても誤って脚注参照として扱われる可能性がある
                if (node.children.length === 1) {
                    const linkText = node.children[0]
                    if (linkText.type === 'text') {
                        const matchLabel = linkText.value.match(/^\[\^([^\]]+)\]$/)
                        if (matchLabel && matchLabel[1]) {
                            const label = matchLabel[1]
                            //const footnoteReference = { type: 'footnoteReference', identifier: label, label: label }
                            // state.patch(node, footnoteReference)
                            return [{ type: 'footnoteReference', identifier: label, label: label }]
                        }
                    }
                }
            }
            return defaultHandlers.a(state, node)
        },
        p(state, node) {
            if (!handling.isIn('blockquote')) {
                // 脚注の定義対応
                // 以下の問題がある
                // - 脚注の参照が存在しているかチェックしていない
                // - 引用の中などであっても誤って脚注定義として扱われる可能性がある
                if (node.children.length > 0) {
                    const startText = node.children[0]
                    if (startText.type === 'text') {
                        const matchLabel = startText.value.match(/^\[\^([^\]]+)\]:\s(.+)$/)
                        if (matchLabel && matchLabel[1]) {
                            const label = matchLabel[1]
                            const content = matchLabel[2]
                            const body = state.all({
                                type: 'root',
                                children: [{
                                    ...node,
                                    children: [{ type: 'text', value: content }, ...node.children.slice(1)]
                                }]
                            })
                            return [{
                                type: 'footnoteDefinition',
                                identifier: label,
                                label: label,
                                children: [{
                                    type: 'paragraph', children: body
                                } as MdastParagraph]
                            }]
                        }
                    }
                }
            }
            return defaultHandlers.p(state, node)
        },
    }
}
