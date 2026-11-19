# notion4writer

Notion のページを Markdown ファイルとして保存するライブラリ。

Flavor を組み合わせることで、各種サービス用に最適化された Markdown ファイルを生成する。

実装中。

## インストール

```sh
npm install --save @hankei6km/notion4writer
```

## API

### `page(options)`

Notion のページを Markdown ファイルとして保存するための関数。

Markdown への変換ルールの他に、保存するとき、Markdown ファイルや画像などのファイル名やディレクトリ名などは Flavor の設定に従う。

#### `options`

- `client`: `Client`
  `notion2content` のクライアントインスタンス。
- `slug`: `BaseSlug`
  Notion のページで設定したスラッグ用プロパティの値を slug へ変換するクラスインスタンス。
- `data_source_id`: `string`
  データソースの ID。
- `limit?`: `number`
  取得するページの上限。デフォルトは `1` になる。
- `files`: `BaseFiles`
  ファイル管理用のクラスインスタンス。
- `requester`: `BaseRequester<Buffer>`
  画像ファイルなどを HTTP 経由でリクエストするクラスインスタンス。
- `flavor`: `Required<Flavor>`
  Markdown への変換ルールを定義するオブジェクト。
- `addFilter`: `(filter: BaseFilter) => void`
  ページ取得用フィルターを追加するコールバック関数。

## Flavor

実装中。

## License

MIT License

Copyright (c) 2026 hankei6km
