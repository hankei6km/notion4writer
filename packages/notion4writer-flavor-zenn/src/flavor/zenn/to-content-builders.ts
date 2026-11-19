import type { Child } from 'hastscript'
import { h } from 'hastscript'
import type { BlockToHastBuilderBuildOpts, BlockToHastBuilderOpts, PrevType, RichTextItem } from 'notion2hast/buider'
import { BlockBookmarkToHast, BlockToHastBuilder, RichTextToHast } from 'notion2hast/buider'
import { setEquationBlockDataToElement, setEquationInlineDataToElement } from './common.ts'
import type { BaseRequester } from '@hankei6km/notion4writer/utils'

export class CustomBlockEquationToHast extends BlockToHastBuilder<'equation'> {
    constructor(opts: BlockToHastBuilderOpts = {}) {
        super('equation', opts)
    }
    outerTag() {
        return { name: null }
    }
    async build(opts: BlockToHastBuilderBuildOpts & { block: { type: 'equation' } }): Promise<Child[]> {
        const pre = h('pre', {}, opts.block.equation.expression)
        setEquationBlockDataToElement(pre)
        return [
            pre,
        ]
    }
    isBreak(_prevType: PrevType): boolean {
        return true
    }
}

export class CustomBlockBookmarkToHast extends BlockBookmarkToHast {
    constructor(opts: BlockToHastBuilderOpts = {}) {
        super(opts)
    }
    async build(opts: BlockToHastBuilderBuildOpts & { block: { type: 'bookmark' } }): Promise<Child[]> {
        // Zenn 側ではカードで表示させる(URL べた書きにする
        const p = h('p', {}, opts.block.bookmark.url)
        return [p]
    }
}
export class CustomBlockEmbedToHast extends BlockToHastBuilder<'embed'> {
    private requester: BaseRequester
    constructor(opts: BlockToHastBuilderOpts & { requester?: BaseRequester } = {}) {
        const { requester, ...builderOpts } = opts
        super('embed', builderOpts)
        if (requester === undefined) {
            throw new Error('requester is required')
        }
        this.requester = requester
    }
    outerTag() {
        return { name: null }
    }
    private isGist(url: string): boolean {
        return url.startsWith('https://gist.github.com/')
    }
    private isHtmlRegExp = /^https:\/\/[a-z0-9.-]+amazonaws.com\/[a-f0-9-]+\/[a-f0-9-]+\/[^./]+.html\?/i // new URL が使えない環境を考慮して正規表現で判定する(が、危ないのでやめたい)
    private isHtml(url: string): boolean {
        return this.isHtmlRegExp.test(url)
    }
    async build(opts: BlockToHastBuilderBuildOpts & { block: { type: 'embed' } }): Promise<Child[]> {
        // 埋め込みはは一部の形式のみ処理する
        if (this.isGist(opts.block.embed.url)) {
            const p = h('p', {}, '@', h('a', { href: opts.block.embed.url }, 'gist'))
            return [p]
        } else if (this.isHtml(opts.block.embed.url)) {
            const html = await this.requester.text(opts.block.embed.url)
            const codeBlock = h('figure', {}, h('pre', {}, h('code', { class: 'html-embed' }, html)))
            return [codeBlock]
        }
        // その他の埋め込みは URL をそのまま表示する(Zenn 側ではカードになる
        const p = h('p', {}, opts.block.embed.url)
        return [p]
    }
    isBreak(_prevType: PrevType): boolean {
        return true
    }
}
export class CustomBlockLinkPreviewToHast extends BlockToHastBuilder<'link_preview'> {
    constructor(opts: BlockToHastBuilderOpts = {}) {
        super('link_preview', opts)
    }
    outerTag() {
        return { name: null }
    }
    async build(opts: BlockToHastBuilderBuildOpts & { block: { type: 'link_preview' } }): Promise<Child[]> {
        // 主に GitHub のリンクプレビュー用(Zenn 側では埋め込みに変換される)
        const p = h('p', {}, opts.block.link_preview.url)
        return [p]
    }
    isBreak(_prevType: PrevType): boolean {
        return true
    }
}

export class CustomRichTextToHast extends RichTextToHast {
    equationToHast(text: Extract<RichTextItem, { type: 'equation' }>): Child {
        const code = h('code', {}, text.equation.expression)
        setEquationInlineDataToElement(code)
        return code
    }
}
