import type { QueryDataSourceParameters } from '@notionhq/client'

export type FilterAndItem = Extract<Required<QueryDataSourceParameters>['filter'], { and: unknown }>['and'][number]

type KeysOfUnion<T> = T extends any ? keyof T : never
type StringOpOfUnion<T> = T extends any ? Extract<T, { [key in string]: string }> : never

export type FilterAndItemTitle = Extract<FilterAndItem, { title: unknown }>['title']
//export type FilterAndItemUrl = Extract<FilterAndItem, { url: unknown }>['url']
//sexport type FilterAndItemSlug = Extract<FilterAndItem, { rich_text: unknown }>['rich_text'] | Extract<FilterAndItem, { url: unknown }>['url']


export type FilterTextPropertyOp = KeysOfUnion<StringOpOfUnion<FilterAndItemTitle>> // テキスト系のtypなら共通(いまのところ)

export abstract class BaseFilter {
    protected filter: FilterAndItem[] = []
    protected titlePropName: string
    protected tagPropName: string
    protected slugPropName: string
    constructor(titlePropName: string, tagPropName: string, slugPropName: string) {
        this.titlePropName = titlePropName
        this.tagPropName = tagPropName
        this.slugPropName = slugPropName
    }
    protected abstract get prefixName(): string
    protected abstract get targetName(): string
    protected abstract get pageName(): string
    protected abstract get bookName(): string

    protected targetFilter(): FilterAndItem[] {
        return [{
            property: this.tagPropName,
            multi_select: {
                contains: `${this.prefixName}:${this.targetName}`,
            },
        }]
    }
    protected pageFilter(): FilterAndItem[] {
        return [{
            property: this.tagPropName,
            multi_select: {
                contains: `${this.prefixName}:${this.pageName}`,
            },
        }]
    }
    protected bookFilter(): FilterAndItem[] {
        return [{
            property: this.tagPropName,
            multi_select: {
                contains: `${this.prefixName}:${this.bookName}`,
            },
        }]
    }
    slugIsNotEmpty(): FilterAndItem[] {
        return [{
            property: this.slugPropName,
            rich_text: {
                is_not_empty: true
            },
        }]
    }
    recentFilter(range: number): void {
        this.filter.push({
            timestamp: "last_edited_time",
            last_edited_time: {
                after: new Date(Date.now() - range).toISOString()
            }
        })
    }
    titleFilter(title: string, op: FilterTextPropertyOp = 'contains'): void {
        this.filter.push({
            property: this.titlePropName,
            title: {
                [op]: title
            }
        } as FilterAndItem)
    }
    slugFilter(slug: string, op: FilterTextPropertyOp = 'equals', propType: 'rich_text' | 'url' = 'rich_text'): void {
        this.filter.push({
            property: this.slugPropName,
            [propType]: {
                [op]: slug
            },
            type: propType
        } as FilterAndItem)
    }
    textFilter(propName: string, text: string, op: FilterTextPropertyOp = 'contains'): void {
        this.filter.push({
            property: propName,
            rich_text: {
                [op]: text
            },
        } as FilterAndItem)
    }
    getPageFilter(): FilterAndItem[] {
        return [...this.targetFilter(), ...this.pageFilter(), ...this.slugIsNotEmpty(), ...this.filter]
    }
    getBookFilter(): FilterAndItem[] {
        return [...this.targetFilter(), ...this.bookFilter(), ...this.filter]
    }
}
