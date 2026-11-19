import { type MetaSource, type MetaSourceMapping, type MetaPrefix, type MetaOptions, type PropsMapping } from '@hankei6km/notion4writer/utils'
import { BaseMetaHandler } from '@hankei6km/notion4writer/utils'

function isString(value: unknown): value is string {
    return typeof value === 'string'
}

export function getMetaPrefixOptions(): MetaPrefix {
    return {
        type: 'zenn:type:',
        topics: 'zenn:topics:',
        published: 'zenn:published:'
    }
}

export class Meta extends BaseMetaHandler {
    //private options: MetaOptions
    protected prefix: MetaOptions['prefix']

    constructor(propsMapping: PropsMapping) {
        super(propsMapping)
        this.prefix = getMetaPrefixOptions()
    }

    handle(source: MetaSource): Record<string, unknown> {
        const props = source.props || {}
        const header = source.header || {}
        const tagMapName = this.tagPropName
        const tags = props[tagMapName] && Array.isArray(props[tagMapName]) ? props[tagMapName]
            .filter(isString) : []

        const type = tags.filter(t => t.startsWith(this.prefix.type)).map(t => t.replace(this.prefix.type, ''))[0] || ''
        const topics = tags.filter(t => t.startsWith(this.prefix.topics)).map(t => t.replace(this.prefix.topics, ''))
        const published = tags.includes(this.prefix.published)
        return {
            title: props[this.titlePropName],
            emoji: header.icon,
            type,
            topics,
            published
        }
    }
}
