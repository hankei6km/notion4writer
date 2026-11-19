export abstract class BaseRequester<TBuffer extends Uint8Array = Uint8Array> {
    abstract text(url: string): Promise<string>
    abstract media(url: string): AsyncIterableIterator<TBuffer, void, unknown>
}
