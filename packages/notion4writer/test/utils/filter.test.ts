import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { BaseFilter } from '../../src/utils/filter.ts'

describe('Filter', () => {
    class DummyFilter extends BaseFilter {
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
    it('should create a filter instance', () => {
        const filter = new DummyFilter('title', 'tags', 'URL')
        assert.ok(filter)
    })
    it('should return correct page and book filters', () => {
        const filter = new DummyFilter('title', 'tags', 'URL')
        assert.deepStrictEqual(filter.getPageFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:page'
                },
            }, {
                property: 'URL',
                rich_text: {
                    is_not_empty: true
                }
            }
        ])
        assert.deepStrictEqual(filter.getBookFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:book'
                },
            }
        ])
    })
    it('should add title filter correctly', () => {
        const filter = new DummyFilter('title', 'tags', 'URL')
        filter.titleFilter('teest-title')
        assert.deepStrictEqual(filter.getPageFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:page'
                },
            }, {
                property: 'URL',
                rich_text: {
                    is_not_empty: true
                }
            }, {
                property: 'title',
                title: {
                    contains: 'teest-title'
                }
            }
        ])
        assert.deepStrictEqual(filter.getBookFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:book'
                },
            }, {
                property: 'title',
                title: {
                    contains: 'teest-title'
                }
            }
        ])
    })
    it('should add title filter with equals operator correctly', () => {
        const filter = new DummyFilter('title', 'tags', 'URL')
        filter.titleFilter('teest-title', 'equals')
        assert.deepStrictEqual(filter.getPageFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:page'
                },
            }, {
                property: 'URL',
                rich_text: {
                    is_not_empty: true
                }
            }, {
                property: 'title',
                title: {
                    equals: 'teest-title'
                }
            }
        ])
        assert.deepStrictEqual(filter.getBookFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:book'
                },
            }, {
                property: 'title',
                title: {
                    equals: 'teest-title'
                }
            }
        ])
    })
    it('should add slug filter correctly', () => {
        const filter = new DummyFilter('title', 'tags', 'URL')
        filter.slugFilter('teest-slug')
        assert.deepStrictEqual(filter.getPageFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:page'
                },
            }, {
                property: 'URL',
                rich_text: {
                    is_not_empty: true
                }
            }, {
                property: 'URL',
                rich_text: {
                    equals: 'teest-slug'
                },
                type: 'rich_text'
            }
        ])
        assert.deepStrictEqual(filter.getBookFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:book'
                },
            }, {
                property: 'URL',
                rich_text: {
                    equals: 'teest-slug'
                },
                type: 'rich_text'
            }
        ])
    })
    it('should add slug filter with contains operator correctly', () => {
        const filter = new DummyFilter('title', 'tags', 'URL')
        filter.slugFilter('teest-slug', 'contains')
        assert.deepStrictEqual(filter.getPageFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:page'
                },
            }, {
                property: 'URL',
                rich_text: {
                    is_not_empty: true
                }
            }, {
                property: 'URL',
                rich_text: {
                    contains: 'teest-slug'
                },
                type: 'rich_text'
            }
        ])
        assert.deepStrictEqual(filter.getBookFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:book'
                },
            }, {
                property: 'URL',
                rich_text: {
                    contains: 'teest-slug'
                },
                type: 'rich_text'
            }
        ])
    })
    it('should add slug filter with contains operator for URL correctly', () => {
        const filter = new DummyFilter('title', 'tags', 'URL')
        filter.slugFilter('teest-slug', 'contains', 'url')
        assert.deepStrictEqual(filter.getPageFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:page'
                },
            }, {
                property: 'URL',
                rich_text: {
                    is_not_empty: true
                }
            }, {
                property: 'URL',
                url: {
                    contains: 'teest-slug'
                },
                type: 'url'
            }
        ])
        assert.deepStrictEqual(filter.getBookFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:book'
                },
            }, {
                property: 'URL',
                url: {
                    contains: 'teest-slug'
                },
                type: 'url'
            }
        ])
    })
    it('should add recent filter correctly', (context) => {
        context.mock.timers.enable({ apis: ['Date'] })
        context.mock.timers.tick(1000 * 60 * 60 * 24 * 3)// 3 days

        const filter = new DummyFilter('title', 'tags', 'URL')
        const range = 1000 * 60 * 60 * 24 // 1 day
        filter.recentFilter(range)
        assert.deepStrictEqual(filter.getPageFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:page'
                },
            }, {
                property: 'URL',
                rich_text: {
                    is_not_empty: true
                }
            }, {
                timestamp: "last_edited_time",
                last_edited_time: {
                    after: new Date(1000 * 60 * 60 * 24 * 2).toISOString() // 3 - 1 = 2 days
                }
            }
        ])
        assert.deepStrictEqual(filter.getBookFilter(), [
            {
                property: 'tags',
                multi_select: {
                    contains: 'base:base'
                },
            }, {
                property: 'tags',
                multi_select: {
                    contains: 'base:book'
                },
            }, {
                timestamp: "last_edited_time",
                last_edited_time: {
                    after: new Date(1000 * 60 * 60 * 24 * 2).toISOString() // 3 - 1 = 2 days
                }
            }
        ])
    })
})
