import type { Flavor } from '@hankei6km/notion4writer/utils'
import { BaseInitFlavor } from '@hankei6km/notion4writer/utils'
import { localDirs } from './local-dirs.ts'
import { Meta } from './meta.ts'
import { zennFlavorToMdastHandlers } from './to-mdast-handlers.ts'
import { prepareColonBlock } from './hast-tree-handlers.ts'
import {
    CustomBlockEquationToHast,
    CustomBlockBookmarkToHast,
    CustomBlockEmbedToHast,
    CustomBlockLinkPreviewToHast,
    CustomRichTextToHast
} from './to-content-builders.ts'
import { ZennPathResolvers } from './path-resolvers.ts'
import { zennFlavorToMarkdownHandlers } from './to-markdown-handlers.ts'
import { Filter } from './filter.ts'

export { Filter }
export { Meta }

export function defaultZennFlavorHandler(): Required<Flavor> {
    const meta = new Meta({ title: 'title', tags: 'tags', slug: 'slug' })
    return {
        localDirs: () => localDirs,
        filter: () => new Filter('title', 'tags', 'slug'),
        pathResolvers: () => new ZennPathResolvers(),
        customBuilders: () => ({
            block: {
                equation: new CustomBlockEquationToHast(),
                bookmark: new CustomBlockBookmarkToHast(),
                embed: new CustomBlockEmbedToHast(),
                link_preview: new CustomBlockLinkPreviewToHast(),
            },
            richText: new CustomRichTextToHast()
        }),
        metaHandler: () => meta,
        hastTreeHandlers: () => [prepareColonBlock],
        toMdastHandlers: zennFlavorToMdastHandlers,
        toMarkdownHandlers: zennFlavorToMarkdownHandlers
    }
}

export class InitFlavor extends BaseInitFlavor {
    get flavor(): Required<Flavor> {
        return {
            localDirs: () => localDirs,
            filter: () => new Filter(this.options.propsMapping.title, this.options.propsMapping.tags, this.options.propsMapping.slug),
            pathResolvers: () => new ZennPathResolvers(),
            customBuilders: () => ({
                block: {
                    equation: new CustomBlockEquationToHast(),
                    bookmark: new CustomBlockBookmarkToHast(),
                    embed: new CustomBlockEmbedToHast({ requester: this.options.requester }),
                    link_preview: new CustomBlockLinkPreviewToHast(),
                },
                richText: new CustomRichTextToHast()
            }),
            metaHandler: () => new Meta(this.options.propsMapping),
            hastTreeHandlers: () => [prepareColonBlock],
            toMdastHandlers: zennFlavorToMdastHandlers,
            toMarkdownHandlers: zennFlavorToMarkdownHandlers
        }
    }
}
