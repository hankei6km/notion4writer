import { BaseFilter } from '@hankei6km/notion4writer/utils'

export class Filter extends BaseFilter {
    protected get prefixName(): string {
        return 'zenn'
    }
    protected get targetName(): string {
        return 'zenn'
    }
    protected get pageName(): string {
        return 'article'
    }
    protected get bookName(): string {
        return 'book'
    }
}
