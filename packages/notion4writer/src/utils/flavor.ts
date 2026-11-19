import type { Root } from 'hast'
import type { Options as MdastOptions } from 'hast-util-to-mdast'
import type { Options as MarkdownOptions } from 'mdast-util-to-markdown'
import type { CustomBuilders } from 'notion2hast/buider'
import { BaseRequester, type MetaSource } from "./index.js"
import { BaseFilter } from './filter.ts'
import { BasePathResolvers } from './path-resolvers.ts'
import { BaseMetaHandler } from "./meta.js"

export type LocalDirs = {
    pages: string
    images: string
}

class Filter extends BaseFilter {
    protected get prefixName(): string {
        return 'base'
    }
    protected get targetName(): string {
        return 'base'
    }
    protected get pageName(): string {
        return 'page'
    }
    protected get bookName(): string {
        return 'book'
    }
}

class MetaHandler extends BaseMetaHandler {
    handle(source: MetaSource): Record<string, unknown> {
        return {
            title: source.props[this.titlePropName]
        }
    }
}

class PathResolvers extends BasePathResolvers {
    pageFileName(dir: string, slug: string, ext: string): [string[], string] {
        return [[dir, slug], ext]
    }
    pageImageDirName(dir: string, slug: string): string[] {
        return [dir, slug]
    }
    pageImageFileName(dir: string, slug: string, index: number, digest: string, ext: string): [string[], string] {
        return [[dir, slug, `${slug}-${index}-${digest}`], ext]
    }
    pageImageSrc(_url: string, dir: string, slug: string, index: number, digest: string, ext: string): [string[], string] {
        return [[dir, slug, `${slug}-${index}-${digest}`], ext]
    }
}


export type HastTreeHandler = (tree: Root) => void
export type HastTreeHandlers = HastTreeHandler[]

export type Flavor = {
    localDirs?: () => LocalDirs
    filter?: () => BaseFilter
    metaHandler?: () => BaseMetaHandler
    pathResolvers?: () => BasePathResolvers
    customBuilders?: () => CustomBuilders
    hastTreeHandlers?: () => HastTreeHandlers
    toMdastHandlers?: () => MdastOptions['handlers']
    toMarkdownHandlers?: () => MarkdownOptions['handlers']
}

export type PropsMapping = {
    title: string
    tags: string
    slug: string
}

export type FlavorOptions = {
    propsMapping: PropsMapping
    requester: BaseRequester
}

export class BaseInitFlavor {
    protected options: FlavorOptions

    constructor(options: FlavorOptions) {
        this.options = options
    }
    get flavor(): Required<Flavor> {
        return {
            localDirs: () => ({
                pages: 'page',
                images: 'images'
            }),
            filter: () => new Filter(this.options.propsMapping.title, this.options.propsMapping.tags, this.options.propsMapping.slug),
            metaHandler: () => new MetaHandler(this.options.propsMapping),
            pathResolvers: () => new PathResolvers(),
            customBuilders: () => ({}),
            hastTreeHandlers: () => [],
            toMdastHandlers: () => ({}),
            toMarkdownHandlers: () => ({})
        }
    }
}
