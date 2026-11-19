import type { BaseFilter, FilterTextPropertyOp } from '@hankei6km/notion4writer/utils'

export type AddFilterOptions = {
    filterSlug?: string
    filterSlugOp?: string
    filterTitle?: string
    filterTitleOp?: string
    filterRecenting?: number
}

export function isOp(op: string | undefined): op is FilterTextPropertyOp {
    if (typeof op !== 'string') return false
    if (op === 'equals') return true
    if (op === 'does_not_equal') return true
    if (op === 'contains') return true
    if (op === 'does_not_contain') return true
    if (op === 'starts_with') return true
    if (op === 'ends_with') return true
    //if(op ==='is_empty') return true
    //if(op ==='is_not_empty') return true
    return false
}

export function addFilter(filter: BaseFilter, options: AddFilterOptions) {
    if (options.filterSlug && isOp(options.filterSlugOp)) {
        filter.slugFilter(options.filterSlug, options.filterSlugOp)
    }
    if (options.filterTitle && isOp(options.filterTitleOp)) {
        filter.titleFilter(options.filterTitle, options.filterTitleOp)
    }
    if (options.filterRecenting) {
        filter.recentFilter(options.filterRecenting)
    }
}
