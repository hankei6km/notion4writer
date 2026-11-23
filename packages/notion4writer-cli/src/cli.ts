import type * as nodePath from 'node:path'
import type * as nodeFs from 'node:fs/promises'
import type * as nodeCrypto from 'node:crypto'
import type { PropsItem } from 'notion2content'
import { Client as NotionClient } from '@notionhq/client'
import { Client } from 'notion2content'
import { BaseSlug, BaseRequester, BaseFiles } from '@hankei6km/notion4writer/utils'

import type { PageOptions } from '@hankei6km/notion4writer'
import { page } from '@hankei6km/notion4writer'

export class CliClient extends Client {
    private client: NotionClient
    constructor(client: NotionClient) {
        super()
        this.client = client
    }
    queryDataSources(
        ...args: Parameters<NotionClient['dataSources']['query']>
    ): ReturnType<NotionClient['dataSources']['query']> {
        return this.client.dataSources.query(...args)
    }
    listBlockChildren(
        ...args: Parameters<NotionClient['blocks']['children']['list']>
    ): ReturnType<NotionClient['blocks']['children']['list']> {
        return this.client.blocks.children.list(...args)
    }
}

export class CliSlug extends BaseSlug {
    protected Url: typeof URL
    protected path: typeof nodePath
    private propName: string
    constructor(Url: typeof URL, path: typeof nodePath, propName: string = 'URL') {
        super(propName)
        this.Url = Url
        this.path = path
        this.propName = propName
    }
    toSlug(props: PropsItem): string {
        const p = props[this.propName]
        if (typeof p === 'string') {
            try {
                const url = new this.Url(p)
                return this.path.basename(url.pathname)
            } catch (_e) {
                // パースできなければ PATH として扱う
                return this.path.basename(p)
            }
        }
        return ''
    }
}

export class CliFiles extends BaseFiles<Buffer> {
    protected Url: typeof URL
    protected fs: typeof nodeFs
    protected path: typeof nodePath
    protected crypto: typeof nodeCrypto
    protected base: string
    constructor(Url: typeof URL, fs: typeof nodeFs, path: typeof nodePath, crypto: typeof nodeCrypto, base = process.cwd()) {
        super()
        this.Url = Url
        this.fs = fs
        this.path = path
        this.crypto = crypto
        this.base = base
    }
    fileExt(url: string): string {
        try {
            const urlObj = new this.Url(url)
            return this.path.extname(urlObj.pathname)
        } catch (e) {
            throw new Error(`Invalid URL: ${url}`)
        }
    }
    fileNameDigest(url: string, abbrev?: number): string {
        try {
            const urlObj = new this.Url(url)
            const hash = this.crypto.createHash('sha256').update(`${urlObj.origin}${urlObj.pathname}`).digest('hex')
            return this.path.format({ name: abbrev ? hash.slice(0, abbrev) : hash })
        } catch (e) {
            throw new Error(`Invalid URL: ${url}`)
        }
    }
    relativePath(path: string): string {
        // base の外に出ていないかのチェックはしていない
        // 各ファイルの path は
        // - slug(basename)
        // - hash
        // - 連番
        // - 拡張子(extname)
        // を組み合わせているので、外へ出ることはないはず。
        // と、思いたい。
        return this.path.relative(this.base, path)
    }
    pageFileName(pathExt: [string[], string]): string {
        return this.path.format({ name: this.path.join(this.base, ...pathExt[0]), ext: pathExt[1] })
    }
    imageFilePath(pathExt: [string[], string]): string {
        const filePath = this.path.format({ name: this.path.join(this.base, ...pathExt[0]), ext: pathExt[1] })
        return filePath
    }
    imageSrcPath(pathExt: [string[], string]): string {
        const filePath = this.path.posix.resolve('/', this.path.format({ name: this.path.join(...pathExt[0]), ext: pathExt[1] }))
        return filePath
    }
    async setupDir(dir: string[]): Promise<string> {
        const dirPath = this.path.join(this.base, ...dir)
        try {
            await this.fs.mkdir(dirPath, { recursive: true })
            return dirPath
        } catch (e) {
            throw e
        }
    }
    async imageFileList(path: string[]): Promise<string[]> {
        const dirPath = this.path.join(this.base, ...path)
        try {
            const files = await this.fs.readdir(dirPath)
            return files.map(file => this.path.join(dirPath, file))
        } catch (e) {
            if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
                return []
            }
            throw e
        }
    }
    async removeFilePath(filePath: string): Promise<void> {
        try {
            await this.fs.unlink(filePath)
        } catch (e) {
            if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw e
            }
        }
    }
    async write(name: string, data: AsyncIterable<string | Buffer>): Promise<void> {
        const filePath = this.path.resolve(process.cwd(), name)
        const f = await this.fs.open(filePath, 'w')
        for await (const chunk of data) {
            await f.write(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
        }
        await f.close()
    }
}

export class CliRequester extends BaseRequester<Buffer> {
    protected fetch: typeof fetch
    constructor(infetch: typeof fetch) {
        super()
        this.fetch = infetch
    }
    async text(url: string): Promise<string> {
        const res = await this.fetch(url)
        if (!res.ok) {
            throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
        }
        return await res.text()
    }
    media(url: string): AsyncIterableIterator<Buffer, void, unknown> {
        return (async function* (infetch: typeof fetch) {
            const res = await infetch(url)
            if (!res.ok) {
                throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
            }
            for await (const chunk of res.body as AsyncIterable<Uint8Array>) {
                yield Buffer.from(chunk)
            }
        })(this.fetch)
    }
}


export async function pageCmd(options: PageOptions): Promise<void> {
    await page(options)
}
