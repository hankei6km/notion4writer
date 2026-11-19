# notion4writer-cli

Notion のページを Markdown ファイルとして保存するコマンドラインツール。

flavor を組み合わせることで、各種サービス用に最適化された Markdown ファイルを生成する。

(現状では [Zenn の Markdown 記法](https://zenn.dev/zenn/articles/markdown-guide) 用の flavor のみが利用可能)

実装中。

## インストール

```sh
npm install -g @hankei6km/notion4writer-cli
```

## Notion 側の前準備

### データベース(とその配下のデータソース)とコネクション

1. データベース(とその配下ののデータソース)を作成
1. コネクション(Integration) を作成
    - 権限はコンテンツの読み取り(Read)のみに設定する
1. データソースにコネクションを追加

### ページのプロパティ

1. 上記データベース内のページのタイトルとなるプロパティの名前を控えておく
1. ページに以下のプロパティを追加
    - タグ用の `multi-select` プロパティ(名前は任意)
    - スラッグ用の `rich text` または `URL` プロパティ(名前は任意)

> [NOTE]
> 記事のタイプ(`type` オプション)や公開制御(`published` オプション用)などのプロパティは **追加しない**。それらはタグ用プロパティを通じて管理される。

### ページの作成(Zenn 記事用)

上記のデータベース内に新しいページを作成。

必須の入力項目は以下の通り。

1. タイトルを記事のタイトルとして設定
1. アイコン(絵文字)を設定
1. タグに以下を設定
    - 必須項目として `zenn:zenn` と `zenn:article` を設定
    - 記事の種類により `zenn:type:tech` または `zenn:type:idea` を設定
1. スラッグにスラッグ用文字列または記事の URL を設定

以下は任意の項目。

1. タグに以下の項目を設定
    - topics の指定として `zenn:topics:` に続けてトピック名を設定(例: `zenn:topics:javascript`)
    - 記事を公開するときは `zenn:published:true` を設定(Front Matter に反映されるだけで実際のデプロイ処理は別途必要になる)
1. 記事の内容を記入(Zenn Markdown 記法用の記述については [notion4writer-flavor-zenn の README](../notion4writer-flavor-zenn/README.md))

## 使い方

```console
$ notion4writer-cli page --help

Fetch pages from Notion database

Options:
  --version           Show version number                              [boolean]
  --help              Show help                                        [boolean]
  --auth              Notion integration token               [string] [required]
  --data-source-id    Notion data source ID                  [string] [required]
  --limit             Limit number of pages to fetch       [number] [default: 1]
  --title-prop-name   Notion title property name
                                          [string] [required] [default: "Title"]
  --tags-prop-name    Notion tags property name
                                           [string] [required] [default: "Tags"]
  --slug-prop-name    Notion slug property name
                                            [string] [required] [default: "URL"]
  --filter-slug       Filter by slug                                    [string]
  --filter-slug-op    Filter by slug operation
  [string] [choices: "equals", "does_not_equal", "contains", "does_not_contain",
                                 "starts_with", "ends_with"] [default: "equals"]
  --filter-title      Filter by title                                   [string]
  --filter-title-op   Filter by title operation
  [string] [choices: "equals", "does_not_equal", "contains", "does_not_contain",
                               "starts_with", "ends_with"] [default: "contains"]
  --filter-recenting  Specify the time range from the current time in seconds
                                                                        [number]
  --base-dir          Base directory for storing files
                                              [string] [required] [default: "."]
```

### コネクションの指定

コネクション(Integration の APIキー) は環境変数 `NOTION4WRITER_AUTH` へ設定する。

オプションの `--auth` でも指定できるが、安全性のために通常はこれを利用しない。

### データソース ID の指定

データソース ID はオプション `--data-source-id` で指定。環境変数 `NOTION4WRITER_DATA_SOURCE_ID` でも指定可能。

### プロパティ名の指定

プロパティ名はオプション `--title-prop-name`、`--tags-prop-name`、`--slug-prop-name` で指定。それぞれのデフォルト値は `"Title"`、`"Tags"`、`"URL"`。

環境変数経由でも指定可能。それぞれ `NOTION4WRITER_TITLE_PROP_NAME`、`NOTION4WRITER_TAGS_PROP_NAME`、`NOTION4WRITER_SLUG_PROP_NAME` を使用。

### 基本的な使い方

Notion 側データベースで Zenn 用記事ページを編集した後に、以下のコマンドを実行してページを取得する。これにより、直近で編集されたページ 1 件が取得される。

```console
notion4writer-cli page
```

> [NOTE]
> コネクション、データソース ID、各プロパティ名は環境変数で設定済であることを前提としている。

### フィルタの指定

直近で編集されたページの取得に加えて、スラッグやタイトルでフィルタをかけることも可能。

例: スラッグが `my-article` のページを取得する場合

```console
notion4writer-cli page --filter-slug my-article
```

また、タイトルでフィルタをかけることも可能。

例: タイトルに `My Article` を含むページを取得する場合

```console
notion4writer-cli page --filter-title "My Article"
```

> [NOTE]
> 対象となるページが複数存在する場合、直近で編集されたページ 1 件のみが取得される。

## License

MIT License

Copyright (c) 2026 hankei6km
