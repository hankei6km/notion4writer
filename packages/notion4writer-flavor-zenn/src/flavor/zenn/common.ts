import type { Element } from 'hast'
import type { Node } from 'mdast'
import { convertElement } from 'hast-util-is-element'

export const colonBlockDataName = Object.freeze({
    colonBlockLabel: 'data-notion2zenn-colon-block-label',
    colonBlockType: 'data-notion2zenn-colon-block-type'
})

export const equationDataName = Object.freeze({
    equationBlock: 'data-notion2zenn-equation-block',
    equationInline: 'data-notion2zenn-equation-inline'
})

export const isDiv = convertElement('div')
export const isDetails = convertElement('details')

export const isCallout = convertElement((node): node is Element & { tagName: 'div' } => {
    if (isDiv(node)) {
        if (node.properties?.style?.toString().includes('background-color:')) {
            return true
        }
    }
    return false
})


const isMessageStyleRegex = /background-color:#[A-Fa-f0-9]{6}/
function getMessageType(cssStyle?: string): string {
    const match = cssStyle?.match(isMessageStyleRegex)
    if (match) {
        const color = match[0].split(':')[1]
        if (
            color === '#EBECED' ||
            color === '#E9E5E3' ||
            color === '#FAEBDD' ||
            color === '#FBF3DB' ||
            color === '#DDEDEA' ||
            color === '#DDEBF1'
        ) {
            return 'message'
        } else if (
            color === '#EAE4F2' ||
            color === '#F4DFEB' ||
            color === '#FBE4E4'
        ) {
            return 'message alert'
        }
    }
    return ''
}

export function setColonBlockData(node: Element, maxDepth: number, depth: number, type: string): void {
    node.properties = node.properties || {}
    node.properties[colonBlockDataName.colonBlockLabel] = ':'.repeat(maxDepth - depth + 3) // 基本の `:::` に追加する
    if (isDetails(node)) {
        const title = node.children[0].type === 'element' && node.children[0].tagName === 'summary' ? node.children[0].children[0] : null
        if (title && title.type === 'text') {
            node.properties[colonBlockDataName.colonBlockType] = `details ${title.value}`
        }
    } else if (isCallout(node)) {
        node.properties[colonBlockDataName.colonBlockType] = getMessageType(node.properties?.style?.toString())
    }
}

export function getColonBlockData(node: Element): { label: string, type: string } {
    if (isDetails(node) || isCallout(node)) {
        return {
            label: node.properties?.[colonBlockDataName.colonBlockLabel]?.toString() || '',
            type: node.properties?.[colonBlockDataName.colonBlockType]?.toString() || ''
        }
    }
    return {
        label: '', type: ''
    }
}

export function setEquationBlockDataToElement(node: Element): void {
    node.properties = node.properties || {}
    node.properties[equationDataName.equationBlock] = ''
}

export function setEquationInlineDataToElement(node: Element): void {
    node.properties = node.properties || {}
    node.properties[equationDataName.equationInline] = ''
}

export function getEquationBlockDataFromElement(node: Element): string | null {
    const data = node.properties?.[equationDataName.equationBlock]
    if (typeof data === 'string') {
        return data
    }
    return null
}

export function getEquationInlineDataFromElement(node: Element): string | null {
    const data = node.properties?.[equationDataName.equationInline]
    if (typeof data === 'string') {
        return data
    }
    return null
}

export function setEquationBlockDataToMdastNode(node: Node): void {
    node.data = node.data || {}
    Object.assign(node.data, { [equationDataName.equationBlock]: '' })
}

export function setEquationInlineDataToMdastNode(node: Node): void {
    node.data = node.data || {}
    Object.assign(node.data, { [equationDataName.equationInline]: '' })
}

export function getEquationBlockDataFromMdastNode(node: Node): string | null {
    const data = (node.data as any)?.[equationDataName.equationBlock]
    if (typeof data === 'string') {
        return data
    }
    return null
}

export function getEquationInlineDataFromMdastNode(node: Node): string | null {
    const data = (node.data as any)?.[equationDataName.equationInline]
    if (typeof data === 'string') {
        return data
    }
    return null
}
