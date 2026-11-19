import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { Filter } from '../../../src/flavor/zenn/filter.ts'

describe('Filter', () => {
    class TestFilter extends Filter {
        testProps() {
            return {
                prefixName: this.prefixName,
                targetName: this.targetName,
                pageName: this.pageName,
                bookName: this.bookName
            }
        }
    }
    it('', () => {
        assert.deepStrictEqual(new TestFilter('title', 'tags', 'URL').testProps(), {
            prefixName: 'zenn',
            targetName: 'zenn',
            pageName: 'article',
            bookName: 'book'
        })
    })
})
