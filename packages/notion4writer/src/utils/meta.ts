import type { ContentRaw } from 'notion2content'
import type { PropsMapping } from './index.ts'

export type MetaSourceMapping = {
    title: string
    tags: string
    slug: string
}
export type MetaPrefix = {
    type: string
    topics: string
    published: string
}
export type MetaOptions = {
    mapping: MetaSourceMapping
    prefix: MetaPrefix
}
export type MetaSource = {
    props: Required<ContentRaw>['props']
    header: Required<ContentRaw>['header']
}

export abstract class BaseMetaHandler {
    protected titlePropName: string
    protected tagPropName: string
    protected slugPropName: string
    constructor(propMapping: PropsMapping) {
        this.titlePropName = propMapping.title
        this.tagPropName = propMapping.tags
        this.slugPropName = propMapping.slug
    }
    abstract handle(source: MetaSource): Record<string, unknown>
}
