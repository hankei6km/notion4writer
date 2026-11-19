import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { localDirs } from '../../../src/flavor/zenn/local-dirs.ts'

describe('localDirs', () => {
    it('should have page and images directories', () => {
        assert.strictEqual(localDirs.pages, 'articles')
        assert.strictEqual(localDirs.images, 'images')
    })
})
