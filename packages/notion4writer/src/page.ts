import type { Client } from 'notion2content'
import type { BaseSlug } from './utils/slug.ts'
import type { Flavor } from './utils/flavor.ts'
import { BaseFilter } from './utils/filter.ts'
import { dump } from 'js-yaml'
import { frontmatterToMarkdown } from 'mdast-util-frontmatter'
import { toMdast } from 'hast-util-to-mdast'
import { toMarkdown } from 'mdast-util-to-markdown'
import { gfmTableToMarkdown } from 'mdast-util-gfm-table'
import { gfmStrikethroughToMarkdown } from 'mdast-util-gfm-strikethrough'
import { gfmFootnoteToMarkdown } from 'mdast-util-gfm-footnote'
import { toContent, Format } from 'notion2content'
import { removeToc } from './lib/remove-toc.ts'
import { normalizeParagraph } from './lib/normalize-paragraph.ts'
import { LocalImage } from './lib/local-image.ts'
import { BaseRequester } from './utils/requester.ts'
import { BaseFiles } from './utils/files.ts'
import { BaseInitFlavor } from './utils/flavor.ts'

export type PageOptions = {
    client: Client,
    slug: BaseSlug
    data_source_id: string
    limit?: number
    files: BaseFiles
    requester: BaseRequester<Buffer>
    flavor: Required<Flavor>,
    addFilter: (filter: BaseFilter) => void
}

export async function page({
    client,
    slug,
    data_source_id,
    limit,
    files,
    requester,
    flavor,
    addFilter
}: PageOptions): Promise<void> {
    const fllter = (flavor.filter)()
    addFilter(fllter)
    const ite = toContent(client, {
        limit: limit ?? 1,
        target: ['props', 'header', 'content'],
        query: {
            data_source_id,
            filter: { and: fllter.getPageFilter() },
            sorts: [
                {
                    timestamp: "last_edited_time",
                    direction: 'descending'
                }
            ],
            page_size: 100,

        },
        toItemsOpts: {},
        toHastOpts: {
            customBuilders: flavor.customBuilders()
        }
    })

    const localDirs = flavor.localDirs
    const pathResolvers = flavor.pathResolvers
    const metaHandler = flavor.metaHandler
    const hastTreeHandlers = flavor.hastTreeHandlers
    const toMdastHandlers = flavor.toMdastHandlers
    const toMarkdownHandlers = flavor.toMarkdownHandlers
    for await (const c of ite) {
        // console.log(`${JSON.stringify(content)}\n`)
        if (c.props && c.header && c.content && c.content.type === 'root') {
            const dirs = localDirs()
            const resolver = pathResolvers()
            const slugValue = slug.toSlug(c.props)
            removeToc(c.content)
            normalizeParagraph(c.content)
            const customHastTreeHandlers = hastTreeHandlers()
            for (const handler of customHastTreeHandlers) {
                handler(c.content)
            }
            const localImage = new LocalImage({ images: dirs.images, slug: slugValue, requester, files, pathResolvers: resolver })
            localImage.localImage(c.content)
            const html = await Format.toHtmlString(c)
            const metaData = metaHandler().handle({ props: c.props, header: c.header })
            const yaml = dump(metaData).slice(0, -1)
            const tree = toMdast(c.content, { handlers: toMdastHandlers() })
            if (tree.type === 'root') {
                tree.children.unshift({ type: 'yaml', value: yaml })
            }
            const markdown = toMarkdown(tree, {
                handlers: toMarkdownHandlers(),
                extensions: [
                    frontmatterToMarkdown(['yaml']),
                    gfmTableToMarkdown(),
                    gfmStrikethroughToMarkdown(),
                    gfmFootnoteToMarkdown()
                ]
            })
            const ite = (async function* () {
                yield markdown // とりあえず、どかっと書き出す
            })()
            await Promise.all([
                (async () => {
                    await files.setupDir([dirs.pages])
                    await files.write(files.pageFileName(resolver.pageFileName(dirs.pages, slugValue, 'md')), ite)
                })(),
                localImage.syncImageFiles()
            ])
        }

    }
}
