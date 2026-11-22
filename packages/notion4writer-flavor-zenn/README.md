# notion4writer-flavor-zenn

`notion4writer` の Zenn 記事のメタ情報と Markdown 記法用フレーバー。

実装中。

## 使い方

現状では、notion4writer-cli をインストールすると内部で利用される。notion4writer-cli の使い方は [notion4writer-cli の README](../notion4writer-cli/README.md) を参照。

## Zenn 記事用のプロパティ設定ルール

notion4writer はページのヘッダーと指定されたプロパティから Zenn 記事のフィルタリングやメタ情報生成などを行う。

### ヘッダー

- ページタイトルは title として扱われる
  - タイトルのプロパティ名は任意(notion4writer 側で指定)
- ページアイコンは icon として扱われる
  - 絵文字のみ指定可能だが、その他形式でも変換エラーにはならない(Zenn 側でエラーとなる)

### プロパティ

- タグ用プロパティはフィルタリングや Zenn 記事のトピック(`topics`) の指定などで利用される
  - プロパティ名は任意(notion4writer 側で指定)
  - `multi_select` 型
- スラッグ用プロパティは Zenn 記事のファイル名に利用される
  - プロパティ名は任意(notion4writer 側で指定)
  - `rich_text` または `URL` 型

#### タグの項目のルール

Zenn 固有のプレフィックス。

- `zenn:` で始まる項目は Zenn 用のメタ情報として扱われる
- `zenn:type:` は記事の種類(`type`)を指定するためのプレフィックス
- `zenn:topics:` は記事のトピック(`topics`)を指定するためのプレフィックス
- `zenn:published:` は記事の公開制御(`published`)を指定するためのプレフィックス

Zenn 固有の項目。

- `zenn:zenn` は Zenn 関連のページであることを示す
- `zenn:article` は Zenn の記事であることを示す
- `zenn:type:tech` は記事の種類が Tech 記事であることを示す
- `zenn:type:idea` は記事の種類が Idea 記事であることを示す
- `zenn:published:true` は記事が公開状態であることを示す

### 例

Notion のページで以下が設定されている。

| プロパティ | 値 |
| ------------ | ------ |
| タイトル | サンプル記事 |
| アイコン | 📝 |
| タグ | `zenn:zenn` `zenn:article` `zenn:type:tech` `zenn:topics:programming` `zenn:topics:typescript` |
| スラッグ | sample-article |

Zenn 記事の Markdown ファイルとメタ情報は以下のように生成される。

ファイル名は `sample-article.md` となる。

メタ情報は以下のように生成される。

```yaml
title: サンプル記事
emoji: 📝
type: tech
topics:
  - programming
  - typescript
published: false
```

## Zenn Markdown 記法への変換ルール

### 文字装飾

Notion のリッチテキストブロックでの文字装飾は、Zenn Markdown 記法の対応する装飾として扱われる。

例えば、太字は `**`、斜体は `_`、打ち消し線は `~~` が自動的に挿入される。

ただし、色などの Markdown で表現が一般的ではない装飾は反映されない。

### 段落

Notion の段落ブロックは Zenn Markdown 記法の 1 行として扱われる。Notion 上で Zenn Markdown 記法の段落を表現するときは、空の段落を挿入する。

空の段落が挿入されていない場合、連続する段落は 1 つの段落として扱われ、行の間には改行が挿入される。

### 見出し

Notion の見出しブロックは Zenn Markdown 記法の見出しとして扱われる。Notion 上で見出しを作成すると、対応する Markdown 記法の `#` が自動的に挿入される。

ただし、Notion では見出しのレベルが 1 から 4 までに制限されている。

### リスト、番号付きリスト

Notion のリストブロックは Zenn Markdown 記法のリストとして扱われる。箇条書きリストは `-`、番号付きリストは `1.` が自動的に挿入される。

ネストされたリストもサポートされており、Notion 上でインデントを付けると対応する Markdown 記法のインデントが自動的に挿入される。

### テキストリンク

Notion のインラインリンクは Zenn Markdown 記法のリンクとして扱われる。

ただし、脚注用に特殊な指定がある、これは「脚注」のセクションで説明する。

### 画像

Notion の画像ブロックは Zenn Markdown 記法の画像として扱われる。

ページ内の画像は Notion 以外のサービスの画像を参照している場合でもローカルの `images/<slug>` ディレクトリに保存される。

> [NOTE]
> `images/<slug>` ディレクトリ内の使われていないファイル(画像以外も含む)は自動的に削除される。

ファイル名は `<slug>-<連番>-<元のURLのハッシュ>.<拡張子>` となる。

> [NOTE]
> ハッシュを求めるとき、元の URL から query パラメータ(署名など)は除外される。

算出されたファイル名が同一の画像は同一の画像として扱い、ローカルにファイルが存在すする場は再ダウンロードしない。よって、同一 URL で画像の内容が変更されている場合は、ローカルのファイルは更新されない。

> [NOTE]
> 1 ページ内に同じ URL の画像が複数存在する場合、連番が異なるので別ファイルとして保存される。

#### 画像の横幅を指定する

これは未対応である。

#### Altテキストを指定するる

Notion API が Alt テキストに対応していないので、未対応である。

#### キャプションをつける

Notion の画像ブロックにキャプションを設定することで、Zenn Markdown 記法のキャプション付き画像として扱われる。

ただし、Notion のリッチテキストとしての装飾は Zenn Markdown 記法のキャプション内では反映されない。

#### 画像にリンクを貼る

Notion の画像ブロックにリンクを設定することで、Zenn Markdown 記法のリンク付き画像として扱われる。

### テーブル

Notion のテーブルブロックは Zenn Markdown 記法のテーブルブロックとして扱われる。

ただし、テーブルの装飾(列見出しの有無など)は反映されない(常に列見出しありのテーブルとなる)。

### コードブロック

Notion のコードブロックは Zenn Markdown 記法のコードブロックとして扱われる。Notion 上でコードブロックを作成すると、対応する Markdown 記法の ```` が自動的に挿入される。言語指定もサポートされている。ただし、Zenn 側でサポートされている言語との完全な互換性は保証されない。

#### ファイル名を表示する

これは未対応である。

#### diff のシンタックスハイライト

これは未対応である。

### 数式

Notion の数式 Zenn Markdown 記法の数式として扱われる。

#### 数式のブロックを挿入する

Notion の数式ブロックを作成すると、対応する Zenn Markdown 記法の `$$...$$` が自動的に挿入される。

#### インライン数式を挿入する

Notion のインライン数式を作成すると、対応する Zenn Markdown 記法の `$...$` が自動的に挿入される。

### 引用

Notion 上で引用ブロックを作成すると、対応する Markdown 記法の `>` が自動的に挿入される。

### 脚注

Notion のインラインリンクで以下ように表現する。

- リンクテキストに `[^foo]` を指定すると脚注の参照となる
- 対応する脚注の定義は段落の先頭に `[^foo]: 定義` の形式で記述する

> [NOTE]
> インラインリンクの URL は変換時に無視されるが、脚注の定義の段落ブロックへリンクしておくと Notion 上でも参照が分かりやすくなる。

### 区切り線

Notion 上で区切り線ブロックを作成すると、対応する Markdown 記法の `---` が自動的に挿入される。

### インラインスタイル

Notion 上のリッチテキストの装飾が Zenn Markdown 記法のインラインスタイルとして扱われる。例えば、太字は `**...**`、斜体は `*...*`、取り消し線は `~~...~~`、コードは `` `...` `` が自動的に挿入される。

#### インラインのコメント

これは未対応である。

### Zenn 独自の記法

#### メッセージ

Notion 上でコールアウトブロックを作成すると、対応する Zenn Markdown 記法のメッセージとして扱われる。

[Notion flavored markdown](https://developers.notion.com/guides/data-apis/notion-flavored-markdown)で表現されたコールアウトブロックとの対比は以下のようになる。

Notion flavored markdown の場合。

```markdown
<callout icon="💡" color="yellow_bg">
メッセージの内容
</callout>
```

Zenn Markdown 記法の場合。icon は無視される。color に `yellow_bg` を指定すると `message` として扱われる。

```markdown
:::message

メッセージの内容

:::
```

警告メッセージとして表示する場合は、color に `red_bg` を指定すると `message alert` として扱われる。

```markdown
<callout icon="💡" color="red_bg">
警告メッセージの内容
</callout>
```

```markdown
:::message alert

警告メッセージの内容

:::
```

#### アコーディオン（トグル）

Notion 上でトグルブロックを作成すると、対応する Zenn Markdown 記法のアコーディオンとして扱われる。

[Notion flavored markdown](https://developers.notion.com/guides/data-apis/notion-flavored-markdown)で表現されたトグルブロックとの対比は以下のようになる。

Notion flavored markdown の場合。

```markdown
<toggle heading="h2">
タイトル

トグルの内容
</toggle>
```

Zenn Markdown 記法の場合。 heading のレベル指定は考慮されない、タイトルがそのままアコーディオンのタイトルとして扱われる。

```markdown
:::details タイトル

トグルの内容

:::
```

#### 要素をネストさせるには

Notion 上でコールアウトとトグルをネストさせると、対応する Zenn Markdown 記法でもネストされた構造として扱われる。 `:` の追加は自動的に計算される。

例えば、以下のようにネストさせた場合。

Notion flavored markdown の場合。

```markdown
<toggle heading="h2">
タイトル

トグルの内容

<callout icon="💡" color="yellow_bg">
メッセージの内容
</callout>

</toggle>

```

Zenn Markdown 記法の場合。

```markdown
::::details タイトル

トグルの内容

:::message

メッセージの内容

::::

:::
```

### コンテンツの埋め込み

コンテンツの埋め込みは一部の形式のみに対応している。以下、対応している形式の一覧を示す。

#### リンクカード

Notion 上でブックマーク形式のリンクブロックを作成すると、対応する Zenn Markdown 記法のリンクカードとして扱われる。

なお、`@[card](URL)` の形式には未対応である。

#### X（Twitter）のポスト（ツイート）

Notion 上でポストを埋め込むと、対応する Zenn Markdown 記法のポストとして扱われる。ポストの URL はそのまま使用される、何等かの変換が必要な場合には未対応である。

なお、`@[tweet](ポストのURL)` の形式には未対応である。

#### YouTube

Notion 上で YouTube の動画 URL をブックマーク形式のリンクブロックとして貼り付けると、対応する Zenn Markdown 記法の動画として扱われる。動画の URL はそのまま使用される、何等かの変換が必要な場合には未対応である。

現在、YouTube の動画を埋め込んだブロックには未対応である(Markdown ファイルに保存されない)。

なお、`@[youtube](YouTubeの動画ID)` の形式には未対応である。

#### GitHub

Notion 上で GitHub ファイルの URL をプレビューとして貼り付けると、対応する Zenn Markdown 記法の GitHub ファイル埋め込みとして扱われる。行指定にも対応している。URL はそのまま使用される、何等かの変換が必要な場合には未対応である。

対応するファイル形式については Zenn の仕様に従う。

> [WARNING]
>
> プライベートリポジトリであるかは判定していないので注意が必要である。

#### GitHub Gist

Notion 上で GitHub Gist の URL をプレビューとして貼り付けると、対応する Zenn Markdown 記法の GitHub Gist 埋め込みとして扱われる。URL はそのまま使用される、何等かの変換が必要な場合には未対応である。

クエリ文字列によるファイル名の指定には未対応である。

> [WARNING]
>
> シークレット Gist であるかは判定していないので注意が必要である。

### ダイアグラム

Notion 上でコードブブロック言語を Mermaid に設定すると、対応する Zenn Markdown 記法のダイアグラムとして扱われる。コードはそのまま使用される、何等かの変換が必要な場合には未対応である。

### HTML/CSS の埋め込み

Notion 上で HTML ブロックを作成すると、対応する Zenn Markdown 記法の HTML/CSS の埋め込みとして扱われる。HTML の内容はそのまま使用される、何等かの変換が必要な場合には未対応である。

## License

MIT License

Copyright (c) 2026 hankei6km
