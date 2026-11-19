import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { getMetaPrefixOptions, Meta } from '../../../src/flavor/zenn/meta.ts'

describe('getMetaPrefixOptions', () => {
    it('should have correct meta prefix options', () => {
        const options = getMetaPrefixOptions()
        assert.deepStrictEqual(options, {
            type: 'zenn:type:',
            topics: 'zenn:topics:',
            published: 'zenn:published:'
        })
    })
})

describe('Meta', () => {
    const defaultPropsMapping = { title: 'title', tags: 'tags', slug: 'slug' }
    it('should have correct meta object', () => {
        const res = new Meta(defaultPropsMapping).handle({
            props: { title: 'TITLE', tags: ['zenn:type:idea', 'zenn:topics:one', 'zenn:topics:two', 'zenn:published:'] },
            header: { icon: '🧪' }
        })
        assert.deepStrictEqual(res, {
            title: 'TITLE',
            emoji: '🧪',
            type: 'idea',
            topics: ['one', 'two'],
            published: true
        })
    })
    it('should have correct meta object(type not present)', () => {
        const res = new Meta(defaultPropsMapping).handle({
            props: { title: 'TITLE', tags: ['zenn:topics:one', 'zenn:topics:two', 'zenn:published:'] },
            header: { icon: '🧪' }
        })
        assert.deepStrictEqual(res, {
            title: 'TITLE',
            emoji: '🧪',
            type: '',
            topics: ['one', 'two'],
            published: true
        })
    })
    it('should have correct meta object(topics not present)', () => {
        const res = new Meta(defaultPropsMapping).handle({
            props: { title: 'TITLE', tags: ['zenn:type:idea', 'zenn:published:'] },
            header: { icon: '🧪' }
        })
        assert.deepStrictEqual(res, {
            title: 'TITLE',
            emoji: '🧪',
            type: 'idea',
            topics: [],
            published: true
        })
    })
    it('should have correct meta object(not published)', () => {
        const res = new Meta(defaultPropsMapping).handle({
            props: { title: 'TITLE', tags: ['zenn:type:idea', 'zenn:topics:one', 'zenn:topics:two'] },
            header: { icon: '🧪' }
        })
        assert.deepStrictEqual(res, {
            title: 'TITLE',
            emoji: '🧪',
            type: 'idea',
            topics: ['one', 'two'],
            published: false
        })
    })
    it('should have correct meta object(custom mapping)', () => {
        const res = new Meta({
            title: '名前', tags: 'タグ', slug: 'slug'
        }).handle({
            props: { '名前': 'TITLE', 'タグ': ['zenn:type:idea', 'zenn:topics:one', 'zenn:topics:two', 'zenn:published:'] },
            header: { icon: '🧪' }
        })
        assert.deepStrictEqual(res, {
            title: 'TITLE',
            emoji: '🧪',
            type: 'idea',
            topics: ['one', 'two'],
            published: true
        })
    })
})

