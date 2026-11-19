import type { PropsItem } from 'notion2content'

export abstract class BaseSlug {
    constructor(propName: string = 'URL') { }
    abstract toSlug(props: PropsItem): string
}
