# zaikoSystem 移植仕様書(Laravel → Bun + Hono + React SPA)

## 1. 概要と移植方針

### 1.1 対象システム

社内在庫管理システム(zaikoSystem)。現行は Laravel 10 + Breeze(Inertia/React) + PostgreSQL 構成。中核機能は「在庫一覧の閲覧・検索・行編集(入出庫)・一括入庫登録・CSV ダウンロード」の 1 画面完結型アプリである。

### 1.2 移植先アーキテクチャ

| 層 | 現行 | 移植先 |
|---|---|---|
| ランタイム | PHP / Laravel 10 | Bun |
| API サーバ | Laravel コントローラ(web ミドルウェア配下) | Hono |
| フロント | Inertia + React(Blade シェル経由) | React SPA(Inertia 廃止) |
| 認証 | Laravel Breeze(セッション + CSRF) | Better Auth(ログインのみ) |
| DB | PostgreSQL(業務テーブルは既存を継続利用) | 同一 PostgreSQL(業務 4 テーブルは無変更、認証系テーブルは Better Auth 生成スキーマに置換) |

### 1.3 移植方針

1. **業務テーブル(items / stock_ins / stock_outs / logs)は既存スキーマ・既存データをそのまま使う。** 型の不整合(§4.6)も現状維持とし、スキーマ変更は本移植のスコープ外。
2. **認証はユーザー作り直し。** users / password_reset_tokens 等は Better Auth の生成スキーマに置換し、既存ユーザーデータは移行しない。ユーザー登録・メール認証・パスワードリセット機能は移植しない(ログインのみ)。
3. **Inertia 依存の排除。** 現行でも在庫データは props ではなく `GET /api/items` で取得する SPA 的構成のため、画面ロジックはほぼそのまま React SPA に移せる。Ziggy の `route()` ヘルパ依存は SPA ルータ(パス直書きまたは定数化)に置換する。
4. **現行の挙動を忠実に再現する**(バグと思われる挙動も含めて仕様として記載し、修正するかは ⚠️要確認 として判断を仰ぐ)。特に以下は現行仕様として維持または要判断:
   - 更新系 API にトランザクションが一切ない(部分更新が残りうる)
   - `logs` テーブルへの書き込みはどこからも行われていない(テーブルだけ存在)
   - 検索・ページネーションは完全クライアントサイド(1 ページ 3 件固定)
   - **画面上のエラーメッセージは一切表示されない**(`errorMessage` state はセットされるがどこにも描画されない — ⚠️要確認 G)
5. **死にコード・死にルートは移植しない**(§6 に列挙)。

### 1.4 主要な ⚠️要確認 事項(サマリ)

| # | 内容 | 食い違いの詳細 |
|---|---|---|
| A | `GET /items`・`GET /items/createTest`・`POST /items` が**認証なし**で公開されている | `GET /items` は認証必須の `GET /api/items` と同一アクション。意図的な公開か不明。後2者は存在しないメソッドを指す死にルート |
| B | `POST /api/items/update` | フロントの DeliverRegister モーダルが呼ぶが、**サーバ側にルート定義が存在しない**(呼べば 404/405)。モーダル自体もどの画面からも import されていない |
| C | `/DeliverRegister`・`/StorageRegister` ルート | `Inertia::render('DeliverRegister')` 等を返すが、`Pages/DeliverRegister.tsx` は存在せず(実ファイルは `Pages/Layouts/` 配下のモーダル部品)、ページとして解決できない |
| D | `/dashboard` ルートと `route('dashboard')` 参照 | `Inertia::render('Dashboard')` を返すが `Pages/Dashboard.tsx` が存在しない。モバイルナビと Welcome から参照あり |
| E | GuestLayout の import 不整合 | named export のみだが一部ページが default import している(型/ビルド上の不整合、実ビルド可否は未検証) |
| F | `GET /api/user`(Sanctum) | Breeze 雛形のまま。フロントからの使用有無未調査。SPA 化後は Better Auth のセッション取得 API に置換予定だが要確認 |
| G | **エラーメッセージがすべて画面非表示** | 一覧取得エラー・CSV 選択 0 件・CSV 失敗の各エラー文言は `setErrorMessage` されるが、`Pages/Index.tsx` は `errorMessage` を JSX のどこにも描画していない(参照ゼロ)。さらに `useInventoryItemState()` はフックごとに独立インスタンスのため他フックとも共有されない。**現行の実挙動は「console.error のみ・画面は無反応」**。移植で忠実に非表示のまま再現するか、表示するよう修正するかを要判断 |

---

## 2. 画面仕様

SPA のルーティングは以下とする(現行 URL を踏襲)。

- **現行の未認証リダイレクト先は `/`(ログイン)ではなく `route('login')` = `/login`** である(app/Http/Middleware/Authenticate.php:15)。移植後の SPA では `/login` を作らず、未認証アクセスは `/`(ログイン)へリダイレクトする(§5)。

| SPA パス | 画面 | 現行対応 | 区分 |
|---|---|---|---|
| `/` | ログイン | GET `/`(Inertia: Auth/Login) | 【移植対象】 |
| — | ログイン(第 2 URL) | GET `/login`(Inertia: Auth/Login、named route `login`、guest ミドルウェア) | 【対象外】`/` に一本化(§2.1・§6.2) |
| `/index` | 在庫管理一覧 | GET `/index`(Inertia: Index) | 【移植対象】 |
| `/profile` | パスワード変更 | GET `/profile`(Inertia: Profile/Edit) | 【移植対象】※内容は §2.4 |
| — | Dashboard | GET `/dashboard` | 【対象外】⚠️要確認(D: ページ実体なし) |

### 2.1 ログイン画面【移植対象】

- **現行**: `Pages/Auth/Login.tsx`。トップページ `/` が Welcome ではなく**ログイン画面**をレンダーする(routes/web.php:23-30)。
- **現行の第 2 ログイン URL**: `GET /login`(routes/auth.php:20-21、guest ミドルウェア)も同じ Auth/Login をレンダーする。props が `/` と異なり、`/` は `canLogin` / `canRegister` / `laravelVersion` / `phpVersion` を渡すのに対し、`/login` は `canResetPassword` と `status`(セッションステータス)を渡す。Login.tsx は `status` があれば緑文字で表示するため、**status 表示は `/login` 経由でのみ発生しうる**(パスワードリセット廃止に伴い実質不要)。移植では `/login` は作らず `/` に一本化する(§6.2)。未認証時のリダイレクト先が現行 `/login` → 移植後 `/` に変わる点に注意。
- **表示**: メールアドレス・パスワード・Remember me チェックボックス・「Log in」ボタン。認証エラーは email フィールドに表示。**パスワードリセットリンクは現行 UI に存在しない**(`canResetPassword` は props として受け取るだけで JSX 内で未使用 — Login.tsx:12-15。forgot-password へのリンクなし)。パスワードリセット機能自体が対象外のため、移植後もリンクなしのままとする。
- **操作**: フォーム送信 → 現行 `POST /login`(Breeze) → 移植後は Better Auth のログイン API。
- **遷移**: 成功時、サーバ側は `redirect()->intended(RouteServiceProvider::HOME)`(AuthenticatedSessionController.php:38、HOME = `/index`)を返す。**intended により「未認証で弾かれる前にアクセスしようとした URL」があればそちらへ復帰する**のが現行のサーバ挙動。ただしフロント側でも成功時に `window.location.href = route('index')` のフルリロード遷移が走る(Login.tsx:32-35)ため、最終的には `/index` に落ち着く。⚠️移植後の SPA でログイン前 URL への復帰(intended 相当)を実装するか、常に `/index` 固定にするかは要判断(現行の実効挙動は `/index` 固定)。
- **呼ぶ API**: ログイン API(Better Auth)。
- **仕様差分メモ**: 現行の Remember me(`remember` boolean)とログイン失敗レートリミット(email+IP キー、5 回失敗ロック、Breeze LoginRequest 由来)は Better Auth 側の同等機能で代替する。挙動の完全一致は求めない(§5)。

### 2.2 在庫管理一覧画面(Index)【移植対象】— 本システムの中核

- **現行**: `Pages/Index.tsx`(InventoryDashboard)。認証必須(auth + verified)。
- **レイアウト**: AuthenticatedLayout。上部ナビ = ロゴ画像(`/images/在庫管理最新.png`、`/index` へリンク)、NavLink「在庫一覧」→ `/index`、右側ユーザー名ドロップダウン(「Profile」→ `/profile`、「Log Out」→ ログアウト POST)。
  - **モバイルハンバーガーメニューの内容**(AuthenticatedLayout.tsx:96-118): 上段に「Dashboard」→ `route('dashboard')` リンク、下段(区切り線の下)に**ログインユーザー名とメールアドレスの表示**、「Profile」リンク、「Log Out」ボタン。
  - ⚠️要確認(D): 「Dashboard」項目は PC 側「在庫一覧」と非対称の Breeze 残骸。移植時はモバイル側も「在庫一覧」→ `/index` に統一するのが妥当だが要確認。ユーザー名・メール・Profile・Log Out は移植対象(メール表示があるため、新実装のセッション取得 API は id / name / email を返す必要がある — §5.2)。
- **表示**:
  - マウント時に `GET /api/items` を**パラメータなし**で呼ぶ(FetchItemsData.tsx:17)。サーバは `per_page` 省略時 100 件でページネーションするため(§3.1)、**取得されるのは先頭 100 件のみ**(items が 101 件以上ある場合、101 件目以降は取得・表示されない — 現行仕様。⚠️全件取得に修正するかは要確認)。props 経由ではない。ロード中は ThreeDots スピナー(react-loader-spinner)。
  - 一覧テーブル(grid 7 列、編集中は 8 列): 選択チェックボックス / 商品名 / 型番 / 納品場所 / (編集中のみ: 数量変更) / **在庫数量** / 備考「詳細」ボタン / 編集ボタン。列見出しは「在庫数量」(Index.tsx:110。「在庫数」は CSV ヘッダの表記であり画面見出しとは異なる — §3.2)。
  - **列数変化の非対称(現行仕様)**: テーブルヘッダは「**いずれか 1 行でも**編集中」なら 8 列化する(Index.tsx:96、`Object.values(btnEditChangeColors).includes('lightred')` 判定)が、行側は**編集中の該当行のみ** 8 列(Index.tsx:117)。そのため複数行のうち 1 行だけ編集すると、非編集行(7 列)とヘッダ(8 列)の列がずれて表示される。忠実再現するか修正するか ⚠️要確認。
  - **取得エラー時**: `setErrorMessage('アイテムの取得中にエラーが発生しました。')` が実行される(FetchItemsData.tsx:27)が、**このメッセージは画面に一切表示されない**。Index.tsx は `useFetchItemsData` から `errorMessage` を分割代入しておらず(Index.tsx:26-32)、JSX 中に描画箇所も存在しない。**現行の実挙動は console.error + 空の一覧表示のみ**(⚠️要確認 G: 表示するよう修正するか非表示を忠実再現するか)。
- **検索**: フィルタ入力 1 つ。**完全クライアントサイド**。正規化 = NFC → 大文字化 → 全角英数字の半角化。対象フィールドは `productName` / `modelNumber` / `location` / `remarks` の部分一致 OR。フィルタ後 **id 降順**ソート。
- **ページネーション**: クライアントサイド、**1 ページ 3 件固定**(`itemsPerPage = 3`)。ページ状態は URL に反映されない。検索のたびに 1 ページ目へリセット。
- **チェックボックス**: 行ごとの選択 + 全選択(マスターチェックボックス、全キー一括 true/false)。取得時に全 id を false で初期化。
- **操作**:
  1. **「入庫記録」ボタン** → StorageRegister モーダル(§2.3)を開く。
  2. **「CSVダウンロード」ボタン** → 選択行 id を `POST /api/items/csv` に送り blob 受信 → `<a download>` でダウンロード。ファイル名はクライアント生成 `{YYYYMM}_棚卸し.csv`(例 `202607_棚卸し.csv`)。
     - **年月は UTC 基準**: `new Date().toISOString().slice(0, 7)`(DownloadCsv.tsx:6)のため、**JST では毎月 1 日 0:00〜8:59 に前月の YYYYMM になる**(現行仕様。⚠️ローカル時刻基準に修正するか要確認)。
     - **選択 0 件時**: `setErrorMessage('エラー: 選択されたアイテムがありません。')` して中断する(DownloadCsv.tsx:12-15)が、**メッセージは画面に表示されない**(Index.tsx は `useDownloadCsv` から `handleDownloadCsv` のみ受け取り errorMessage を描画しない — Index.tsx:40-42)。**実挙動は「無反応でリクエストが送信されない」のみ**(⚠️要確認 G)。
     - **ダウンロード失敗時**(axios 例外): `setErrorMessage('ダウンロード中に未知のエラーが発生しました。')`(DownloadCsv.tsx:38)+ console.error。これも**画面には表示されない**。
     - **成功時**: `setErrorMessage('')` でエラー state をクリアする(DownloadCsv.tsx:35。非表示のため画面上の影響はない)。
  3. **行編集(編集ボタントグル)**: 1 回目押下で行がインライン編集モード(ボタン緑→赤、該当行の列が 7→8 に増加。ヘッダは前述のとおり「いずれかの行が編集中」で 8 列化)。商品名 / 型番 / 納品場所 / **数量変更(quantityChange)** / 備考を入力。2 回目押下で `PUT /api/items/{id}` を送信し、成功後に一覧再取得。数量変更入力が空なら 0 を送信。
     - 現行実装は入力値を React state でなく `document.getElementById` の DOM 直接参照で収集、編集モード判定も色文字列(`lightred`/`lightgreen`)で行っている。**移植では通常の controlled state に置き換えてよい(挙動同一が条件)**。
  4. **備考「詳細」ボタン** → 備考全文をモーダル表示(ModalRemark)。
  5. **ブラウザバック無効化**: `history.pushState` + `popstate` リスナーで戻るを防止(FetchItemsData.tsx:36-40)。移植対象(現行仕様)。
- **呼ぶ API**: `GET /api/items` / `PUT /api/items/{id}` / `POST /api/items/csv` / `POST /api/items/bulk`(モーダル経由)。
- **状態管理の注意**: 現行 `useInventoryItemState()` は単なる useState の束で、フックごとに独立インスタンスが生成される(「共有されているように見えて共有されていない」)。§2.2 の各エラーメッセージが表示されないのもこの独立性 + 未描画の複合による。移植時はこの偶発的な独立性に依存した挙動(例: BulkRegister の successMessage が別インスタンス、errorMessage が誰にも読まれない)を踏まえ、実際に画面に現れる挙動を基準に再実装する。

### 2.3 StorageRegister(入庫記録モーダル)【移植対象】

- **現行**: `Pages/Layouts/StorageRegister.tsx`。ページではなく Index 画面から開く**モーダル部品**(props: `isOpen, onClose, fetchData`)。
- **表示**: カンマ区切りテキスト入力。**入力欄は textarea ではなく単一行の `<input type="text">`**(StorageRegister.tsx:35-41)であり、**UI 上は改行(複数商品)の入力が不可能**。フォーマットは `商品名,型番,納品場所,入庫数量,備考`(案内文「※商品名,型番,納品場所,入庫数量,備考をカンマ区切りで入力すると一括登録されます。」、例: `サーバー,DL360,櫻井倉庫,100,代理名`)。
- **操作**: 「一括登録」ボタン → `bulkData.split('\n')` で改行分割 → カンマ分割・trim して `{ productName, modelNumber, location, inventoryItem, remarks }` の配列を組み立て `POST /api/items/bulk` に送信(**inventoryItem は文字列のまま送信される**のが現行仕様)。成功メッセージ表示。モーダルを閉じるとき `fetchData()` で一覧再取得。
  - **注意**: `split('\n')`(BulkRegister.tsx:13)はコード上存在するが、入力欄が単一行のため**UI からは常に 1 件のみの送信**になる(API 自体は複数要素の配列を受け付ける — §3.3)。**移植も `<input type="text">` の単一行入力で実装すること**。textarea にすると現行に存在しない複数行一括登録が可能になり挙動が変わる(⚠️複数行対応に「直す」かは要確認)。
- ⚠️要確認(C): `/StorageRegister` への**ルート(独立ページ)としてのアクセスは現行でも成立していない**(Pages 直下にファイルなし・必須 props あり)。移植ではルートを作らずモーダルのみとする。

### 2.4 Profile(パスワード変更)画面【移植対象・縮小】

- **現行**: `Pages/Profile/Edit.tsx`。ヘッダ「パスワード更新」。実際に描画されるのは **UpdatePasswordForm のみ**。
- **表示**: 現在のパスワード / 新パスワード / 確認 の 3 入力。成功時に Transition で「パスワード更新されました」表示。
- **操作**: 送信 → 現行 `PUT /password`(Breeze password.update) → 移植後は Better Auth のパスワード変更 API に置換。
- **対象外の部品**: `UpdateProfileInformationForm`(名前・メール変更)と `DeleteUserForm`(退会)は import はあるが **`return;` で何も描画しない死にコード**。対応するサーバ側 `PATCH /profile` / `DELETE /profile` ごと【対象外】。

### 2.5 移植しない画面

§6 参照(Register / ForgotPassword / ResetPassword / ConfirmPassword / VerifyEmail / Welcome / Test / Dashboard / DeliverRegister モーダル / `GET /login` の第 2 ログイン URL)。

---

## 3. API仕様

移植後は Hono で以下 4 本 + Better Auth のエンドポイント群を実装する。現行はすべて `routes/web.php` 上の **web ミドルウェア(Cookie セッション + CSRF)** 配下であり、`routes/api.php` ではない点に注意(パスに `/api` が付くだけ)。移植後も Cookie セッション認証(Better Auth)+ CSRF 対策を前提とする。

### 3.1 GET /api/items — 商品一覧取得【移植対象】

- **認証**: 必須(現行 `auth`)。
  - ⚠️要確認(A): 現行は同一アクションが `GET /items` として**認証なし**でも公開されている。移植では認証必須の `/api/items` のみとし、`/items` は作らない方針を推奨(要確認)。
- **入力**: クエリ `per_page`(省略時 **100**)。フロントは実際にはパラメータなしで呼ぶため、**画面には常に 1 ページ目の最大 100 件しか渡らない**(§2.2)。
- **バリデーション**: なし。
- **DB 操作**: `items` を主キー順(挿入順)でページネーション取得。検索条件・ソート指定なし。
- **レスポンス**: Laravel 標準ページネータ互換の JSON。**フロントは `response.data.data` が配列であることに依存**しているため、最低限以下の形を再現する:

```json
{
  "current_page": 1,
  "data": [ { "id": 1, "productName": "...", "modelNumber": "...", "location": "...",
              "inventoryItem": 90, "quantityChange": 0, "remarks": "...",
              "created_at": "...", "updated_at": "..." } ],
  "last_page": 1,
  "per_page": 100,
  "total": 6
}
```

### 3.2 POST /api/items/csv — CSV 出力【移植対象】

- **認証**: 必須。
- **入力**(JSON): `ids`: 出力対象 item ID 配列(省略時 `[]` → 空 CSV)。`fileName`: ダウンロードファイル名(クライアント指定)。
- **バリデーション**: なし(現行)。
  - セキュリティ注意(現行仕様のまま移植するか ⚠️要確認): `fileName` は未検証のまま `Content-Disposition` ヘッダに埋め込まれる。移植時はエスケープ/検証の追加を推奨。
- **DB 操作**: `SELECT * FROM items WHERE id IN (:ids)`。
- **レスポンス**: **UTF-8 BOM 付き** CSV 文字列。ヘッダ行とカラム対応:

| カラム | CSV ヘッダ |
|---|---|
| id | ID |
| productName | 商品名 |
| modelNumber | 型番 |
| location | 場所 |
| inventoryItem | 在庫数 |
| remarks | 備考 |
| created_at | 登録日 |

- CSV ヘッダの「在庫数」は画面の列見出し「在庫数量」と表記が異なる(いずれも現行どおり維持)。
- ヘッダ: `Content-Type: text/csv; charset=UTF-8`、`Content-Disposition: attachment; filename="{fileName}"`。

### 3.3 POST /api/items/bulk — 一括入庫登録【移植対象】

- **認証**: 必須。
- **入力**(JSON): `items` = `{ productName, modelNumber, location, inventoryItem, remarks }` の配列。フロントからは `inventoryItem` が**文字列**で届く(現行 PostgreSQL は暗黙変換で受けている(⚠️要確認: pgsql は文字列→integer の暗黙変換が MySQL より厳格。実挙動は PR2 で実証する))。API 自体は複数要素の配列を処理できるが、現行 UI からは常に 1 要素の配列が届く(§2.3)。
- **バリデーション**: **なし**(現行。キー欠落時は現行 PHP でも実行時エラー)。移植時は最低限の型検証追加を推奨だが、正常系の挙動は現行同一とする。
- **DB 操作**: 要素ごとに `items` へ INSERT(`inventoryItem` を直接セット)。**stock_ins への記録は行わない**(「入庫記録」という UI 名称に反して入庫履歴は残らないのが現行仕様)。**トランザクションなし**(途中失敗時は部分登録が残る — 現行仕様。移植時にトランザクション化するか ⚠️要確認)。
- **レスポンス**: `{"success": "アイテムが正常に登録されました。"}`(常に 200)。フロントは `success` の文言を表示に使う。

### 3.4 PUT /api/items/{id} — 商品編集+入出庫【移植対象】

- **認証**: 必須。
- **入力**(JSON): `productName` / `modelNumber` / `location` / `quantityChange` / `remarks`。
- **バリデーション**(現行 ItemsRequest と同一):

| フィールド | ルール |
|---|---|
| productName | required, string |
| modelNumber | required, string |
| location | required, string |
| quantityChange | required, numeric(**数量を変えない編集でも 0 の送信が必須**) |
| remarks | nullable, string |

- **DB 操作**(現行ロジックを忠実に再現):
  1. `items` から id で取得。**存在しない id でも 404 は返らない**: `Item::findOrFail($id)`(ItemController.php:76)は同メソッドの `try/catch (\Exception)`(ItemController.php:74, 105-110)の内側にあり、ModelNotFoundException も捕捉されて `{"success": false, "message": "アイテムの更新中にエラーが発生しました: ..."}` の **HTTP 500** が返る(現行仕様。移植で 404 に「直す」かは ⚠️要確認)。
  2. `productName` / `modelNumber` / `location` / `remarks` を上書き(`inventoryItem` は直接更新しない)。
  3. `quantityChange !== 0`(PHP 厳密比較 — ItemController.php:86)の場合のみ入出庫処理(QuantityChange):
     - `newQuantity = (inventoryItem ?? 0) + quantityChange`
     - **quantityChange > 0(入庫)**: `stock_ins` に INSERT(`item_id`, `inItem = quantityChange`。`registration_date` は入らず NULL)。`inventoryItem = newQuantity`。メッセージ「入庫処理が完了しました。」
     - **quantityChange < 0(出庫)**: `newQuantity < 0` なら**在庫不足エラー** — `stock_outs` を作らず、メッセージに「在庫数量の更新に失敗しました: エラー: 在庫不足のため出庫できません。」を連結して**処理続行・HTTP 200 のまま**(名前等の編集は保存される)。それ以外は `stock_outs` に INSERT(`item_id`, `outItem = |quantityChange|`)し `inventoryItem = newQuantity`。メッセージ「出庫処理が完了しました。」
     - **default 分岐(API のみ到達可能なエッジケース)**: 判定が厳密比較 `!== 0` のため、`quantityChange` を**文字列 `"0"`** で送ると(numeric バリデーションは通過)入出庫分岐に入り、`> 0` / `< 0` のどちらにも該当せず default 分岐(ItemController.php:145-147)となる。stock_ins / stock_outs は作らず、メッセージ「数量変更はありませんでした。」が連結され、`inventoryItem` が `newQuantity`(値は不変)で上書きされる。フロントは数値 0 を送るため UI からは到達しないが、API 仕様として存在する挙動(移植で再現するか ⚠️要確認)。
  4. `items` を UPDATE。
  - **トランザクションなし**(stock_ins/stock_outs の INSERT と items の UPDATE が分離。items 更新失敗時に入出庫レコードだけ残りうる — 現行仕様。移植でトランザクション化するか ⚠️要確認)。
  - `logs` テーブルへの書き込みは**行わない**(現行どおり)。
- **レスポンス**:
  - 成功: `{"success": true, "message": "アイテムが正常に更新されました。 <入出庫メッセージ>"}`(200)
  - 例外(存在しない id を含む): `{"success": false, "message": "アイテムの更新中にエラーが発生しました: ..."}`(500)

### 3.5 認証系 API【移植対象・Better Auth に置換】

現行の Breeze エンドポイント(`POST /login`、`POST /logout`、`PUT /password`)は Better Auth の対応 API(メール+パスワードでのサインイン / サインアウト / パスワード変更、Cookie セッション)に置き換える。パス・ペイロードは Better Auth 既定に従い、現行と一致させる必要はない。詳細は §5。

### 3.6 移植しない API

§6 参照。特に **`POST /api/items/update`(DeliverRegister モーダルの送信先)はサーバ側に存在しないため移植不能**(⚠️要確認 B — 出庫一括機能として復活させたい要望があるか要ヒアリング)。

---

## 4. DBスキーマ(最終形)

### 4.1 items【移植対象・無変更】

| カラム | 型 | NULL | デフォルト | 備考 |
|---|---|---|---|---|
| id | bigint unsigned AUTO_INCREMENT PK | 不可 | - | 商品ID |
| productName | varchar(255) | 不可 | - | 商品名 |
| modelNumber | varchar(255) | 不可 | - | 型番 |
| location | varchar(255) | 不可 | - | 納品場所 |
| inventoryItem | int | 不可 | - | 在庫数量 |
| quantityChange | int | 不可 | 0 | 数量変更(API 入力の名残。一覧取得時に返るのみ) |
| remarks | varchar(255) | 可 | NULL | 備考 |
| created_at / updated_at | timestamp | 可 | NULL | |

インデックス: PK のみ。FK なし。

### 4.2 stock_ins【移植対象・無変更】

| カラム | 型 | NULL | デフォルト | 備考 |
|---|---|---|---|---|
| id | bigint unsigned AUTO_INCREMENT PK | 不可 | - | 入庫ID |
| item_id | int(**signed、FK・インデックスなし**) | 不可 | - | 商品ID |
| inItem | int | 不可 | - | 入庫数量 |
| registration_date | date | 可 | NULL | 登録日(アプリからは常に NULL で INSERT される) |
| created_at / updated_at | timestamp | 可 | NULL | |

### 4.3 stock_outs【移植対象・無変更】

stock_ins と同構造(`inItem` → `outItem`、出庫ID/出庫数量)。item_id は signed int・FK なし。

### 4.4 logs【移植対象(スキーマのみ)・無変更】

| カラム | 型 | NULL | 備考 |
|---|---|---|---|
| id | bigint unsigned AUTO_INCREMENT PK | 不可 | ログID |
| item_id | bigint unsigned | 不可 | FK → items.id **ON DELETE CASCADE** |
| inventoryItem | int | 可 | 変更後在庫スナップショット |
| stock_in_id | bigint unsigned | 可 | FK → stock_ins.id **ON DELETE SET NULL** |
| stock_out_id | bigint unsigned | 可 | FK → stock_outs.id **ON DELETE SET NULL** |
| remarks | varchar(255) | 可 | |
| created_at / updated_at | timestamp | 可 | |

**アプリからの読み書きは一切ない**(モデルは存在するが未使用、リレーションもコメントアウト)。並走検証のためテーブルは残すが、新実装でも書き込みは行わない。

### 4.5 認証系テーブル【対象外 → Better Auth 生成スキーマに置換】

- `users` / `password_reset_tokens` / `failed_jobs` / `personal_access_tokens`(Sanctum)は**移植しない**。
- Better Auth のマイグレーションで `user` / `session` / `account` / `verification` 等(Better Auth 既定スキーマ)を新規作成し、**ユーザーは作り直す**(既存 users からのデータ移行なし)。
- `sessions` テーブルの migration は現行に存在しない(セッションは DB 非依存)。Better Auth 側は既定の session テーブルを使用する。

### 4.6 移植時の既知の型不整合(現状維持)

- `stock_ins.item_id` / `stock_outs.item_id` は **signed int** で、`items.id`(bigint unsigned)と型不一致・FK なし・インデックスなし。参照整合性はアプリ側依存。
- `logs.stock_in_id`(bigint unsigned)は `stock_ins.id` を正しく参照するが、上記の不一致は残る。
- カラム命名は camelCase(`productName`, `inItem`)と snake_case(`item_id`, `registration_date`)が混在。**新実装の ORM/クエリでもカラム名は現行のまま使う**(データ共有並走のため)。

### 4.7 シードデータ(検証用)

`ItemSeeder` 相当の 6 件(商品A/B/c/d/e/f。商品c〜f は商品B の複製データ)を検証環境の初期データとして流用可能。ユーザーシードは現行にも存在しない。

---

## 5. 認証仕様

### 5.1 現行(参考)

- Laravel Breeze。Cookie セッション + CSRF(web ミドルウェアグループ)。ガード構成:
  - `auth` + `verified`: 画面系(`/dashboard` `/index` `/DeliverRegister` `/StorageRegister`)
  - `auth` のみ: `/api/items` 系 4 本、`/profile` 系、ログイン後 auth ルート
  - `guest`: 登録・ログイン(`GET /login`〈named route `login`〉・`POST /login`)・パスワードリセット系
  - ガードなし: `/test` `/` `/items` 系(⚠️要確認 A)
- **未認証アクセスのリダイレクト先は `route('login')` = `/login`**(app/Http/Middleware/Authenticate.php:15。`/` ではない)。`GET /login` は `/` と同じ Auth/Login をレンダーする第 2 のログイン URL(props の差異は §2.1)。
- ログイン: email + password + remember(boolean)。失敗レートリミット = 小文字 email+IP キーで **5 回失敗ロック**(Lockout イベント + 残秒数エラー)。成功時はサーバ側で `redirect()->intended('/index')`(§2.1)。
- Sanctum(`auth:sanctum` の `GET /api/user`)はステートフル SPA モードが**コメントアウト**されており実質未使用構成。
- Inertia 共有 props は `auth.user`(User モデル全体、未ログイン時 null)のみ。

### 5.2 移植後(Better Auth)

| 項目 | 仕様 |
|---|---|
| 方式 | Better Auth / Email & Password、Cookie セッション |
| 提供機能 | **ログイン・ログアウト・セッション取得・パスワード変更のみ** |
| 非提供(対象外) | ユーザー登録(サインアップ)・メール認証・パスワードリセット。ユーザーは管理者が Better Auth の管理手段(CLI/スクリプト等)で作成する |
| ログイン URL | `/` のみ。現行の第 2 URL `GET /login` は作らない(§6.2)。これに伴い未認証時のリダイレクト先は現行 `/login` → 移植後 `/` に変わる |
| Remember me | Better Auth のセッション有効期限設定で代替(現行の remember checkbox 相当)。⚠️要確認: UI にチェックボックスを残すか |
| レートリミット | Better Auth 標準のレートリミットを有効化(現行の「5 回失敗ロック」との完全一致は求めない) |
| メール検証(verified) | 廃止。現行の `verified` ミドルウェア相当は「ログイン済み」のみに簡素化(メール認証自体を持たないため) |
| API 保護 | `/api/items` 系 4 本すべてにセッション必須ミドルウェア。未認証は 401 JSON |
| 画面保護 | SPA 側ガード: 未認証なら `/` へリダイレクト(現行は `/login` へリダイレクト — 上記)。加えてサーバ側 API の 401 で担保 |
| CSRF | Better Auth / Hono のミドルウェアで Cookie セッションに対する CSRF 対策を実装(現行の VerifyCsrfToken 相当) |
| ユーザー情報の取得 | 現行の Inertia 共有 `auth.user`(PC ナビのユーザー名表示、モバイルナビのユーザー名+メールアドレス表示に使用 — §2.2)は、Better Auth のセッション取得 API で代替。**現行のように User モデル全カラムを返さず、id / name / email に絞る**(モバイルナビのメール表示のため email は必須) |
| GET /api/user(Sanctum) | 【対象外】⚠️要確認(F): フロント使用箇所は確認されていない |

---

## 6. 移植対象外リスト

### 6.1 確定(指示による対象外)

| 項目 | 現行の場所 | 理由 |
|---|---|---|
| `GET /test` ルート・TestController・`Pages/Test.tsx` | routes/web.php / app/Http/Controllers/TestController.php | 実験残骸(「テスト連携用」) |
| `createTest.blade.php`・`GET /items/createTest`・`POST /items` | resources/views / routes/web.php:85-86 | 存在しない `ItemController::create/store` を指す死にルート |
| ユーザー登録 | Register.tsx / RegisteredUserController / `GET,POST /register` | 新認証はログインのみ |
| メール認証一式 | VerifyEmail.tsx / EmailVerification*・VerifyEmailController / `verified` ミドルウェア | 同上 |
| パスワードリセット一式 | ForgotPassword.tsx / ResetPassword.tsx / PasswordResetLink*・NewPasswordController | 同上(なお現行 Login.tsx にもリセットリンクの描画はない — §2.1) |
| Laravel 固有テーブル | password_reset_tokens / failed_jobs / personal_access_tokens | 不要 |
| users テーブル(現行スキーマ) | 2014_10_12_000000_create_users_table | Better Auth 生成スキーマに置換、ユーザー作り直し |

### 6.2 調査結果から対象外と判断(死にコード・死に導線)

| 項目 | 根拠 |
|---|---|
| `Pages/Welcome.tsx`・`welcome.blade.php` | render するルートが存在しない |
| `GET /login`(第 2 ログイン URL、named route `login`) | `/` と同じ Auth/Login をレンダーする重複 URL(guest、props は canResetPassword / status — §2.1)。SPA では `/` に一本化し、未認証リダイレクト先も `/` とする。ログイン画面自体は【移植対象】(§2.1) |
| `GET /dashboard` ルート・「Dashboard」ナビ項目 | `Pages/Dashboard.tsx` が存在しない(⚠️要確認 D。モバイルナビは「在庫一覧」に置換。モバイルナビ内のユーザー名/メール/Profile/Log Out は移植対象 — §2.2) |
| `GET /DeliverRegister`・`GET /StorageRegister` ルート | Pages 直下に対応ファイルがなくページ解決不能(⚠️要確認 C)。StorageRegister は**モーダルとしてのみ**移植 |
| `Pages/Layouts/DeliverRegister.tsx`(出庫モーダル) | どの画面からも import されていないデッドコード。送信先 `POST /api/items/update` もサーバに存在しない(⚠️要確認 B) |
| `DeliverRegister.blade.php` | view() で返すルートが存在しない |
| `features/modalRemark.tsx`(小文字) | `ModalRemark.tsx` と**機能的に同等**のデッドファイル(完全同一ではない: ModalRemark.tsx にのみ未使用の `import { useState }` があり、modalRemark.tsx は末尾改行なし)。どこからも import されていない |
| `UpdateProfileInformationForm` / `DeleteUserForm` と `PATCH /profile` / `DELETE /profile` | フォームが `return;` で何も描画しない死にコード |
| `GET /confirm-password` / `POST /confirm-password`・ConfirmPassword.tsx | 利用箇所なし(退会機能とセットの Breeze 標準。退会が対象外のため不要) |
| `GET /api/user`(routes/api.php・auth:sanctum) | Breeze 雛形のまま。Better Auth セッション API で代替(⚠️要確認 F) |
| `GET /items`(認証なし公開版) | `/api/items` と重複。認証なし公開は再現しない(⚠️要確認 A) |
| routes/channels.php の Broadcast チャンネル定義(`App.Models.User.{id}`) | Laravel 雛形の未使用ボイラープレート(bootstrap.ts の Echo もコメントアウト済み)。移植しない |
| routes/console.php の `inspire` コマンド | Laravel 雛形の未使用ボイラープレート。移植しない |
| `app/Models/Log.php` の Eloquent モデル(書き込みロジック) | アプリのどこからも参照なし。**テーブルは §4.4 のとおり残す** |
| laracsv / Ziggy / Inertia / Sanctum 等の Laravel 依存パッケージ | 移植先で同等機能を自前実装(CSV は BOM 付き文字列生成で十分) |

---

## 7. 検証チェックリスト

**前提**: 新旧システムを**同一 PostgreSQL データベース(業務 4 テーブルを共有)**に接続して並走させ、画面ごと・操作ごとに結果を突き合わせる。認証系テーブルは別系統(旧: users / 新: Better Auth スキーマ)のため、両系に同等のテストユーザーを用意しておく。更新系操作は「旧で実行→両画面で確認」「新で実行→両画面で確認」の双方向で行う。

### 7.1 ログイン画面

- [ ] 未認証で `/index` にアクセスするとログイン画面に誘導される(旧: `/login` へリダイレクト / 新: `/` へリダイレクト — 行き先 URL の差異は仕様どおり)
- [ ] 正しい email/password でログインでき、`/index` へ遷移する
- [ ] 誤ったパスワードでエラーメッセージが表示される(文言は新旧で異なってよい)
- [ ] 連続ログイン失敗でレートリミットがかかる(新: Better Auth 設定値で発動すること)
- [ ] ログアウト後、`/api/items` を直接叩くと 401 になる(新)/ログインへリダイレクト(旧)
- [ ] (新)`/login` が存在しない(404 または `/` への統合)こと — §6.2 の決定に従う

### 7.2 在庫管理一覧 — 表示・検索・ページネーション

- [ ] 初期表示: 同一 DB の items が新旧で同数・同内容(商品名/型番/納品場所/**在庫数量**/備考)で表示される(※現行はパラメータなし取得のため先頭 100 件のみ。100 件以内のデータで検証するか、101 件以上での「先頭 100 件のみ表示」挙動の新旧一致を確認する)
- [ ] 表示順: フィルタ適用後の並びが **id 降順**で新旧一致する
- [ ] 1 ページ **3 件**表示・総ページ数が新旧一致する
- [ ] ページ送りで表示内容が新旧一致する。検索語変更でページが 1 ページ目にリセットされる
- [ ] 検索: 商品名/型番/納品場所/備考それぞれの部分一致でヒット件数が新旧一致する
- [ ] 検索正規化: 全角英数字(例「Ａ－００１」→ ⚠️全角ハイフンは変換対象外なので「Ａ００１」等英数字のみで確認)・小文字入力(「商品c」を「C」で検索)で新旧同一のヒット結果になる
- [ ] ロード中スピナーが表示される
- [ ] API エラー時(旧): 「アイテムの取得中にエラーが発生しました。」は**画面に表示されない**(console.error のみ・一覧は空)ことを確認。新はこの非表示挙動を忠実再現するか、表示するよう修正するか(⚠️要確認 G)の決定に従って検証する
- [ ] ブラウザバックが無効化されている(新旧とも)

### 7.3 在庫管理一覧 — 行編集(PUT /api/items/{id})

各ケース実行後、**画面表示と DB(items / stock_ins / stock_outs)の両方**を新旧で突き合わせる。

- [ ] 数量変更 0 で商品名/型番/納品場所/備考のみ編集 → items が更新され、stock_ins/stock_outs に**レコードが増えない**
- [ ] 数量変更 +N(入庫)→ inventoryItem が +N、`stock_ins` に 1 行追加(item_id, inItem=N, registration_date=NULL)、メッセージ「入庫処理が完了しました。」相当
- [ ] 数量変更 -N(在庫十分)→ inventoryItem が -N、`stock_outs` に 1 行追加(outItem=N)、メッセージ「出庫処理が完了しました。」相当
- [ ] 数量変更 -N(在庫不足、newQuantity < 0)→ **stock_outs にレコードが増えず**、inventoryItem は変わらず、**名前等の編集は保存され**、HTTP 200 で在庫不足メッセージが表示される(現行の「エラーでも続行」挙動の一致)
- [ ] (API 直叩き)quantityChange に文字列 `"0"` を送信 → default 分岐でメッセージ「数量変更はありませんでした。」が連結され、stock_ins/stock_outs が増えず inventoryItem 値が変わらないこと(§3.4。新実装での再現有無は ⚠️要確認 の決定に従う)
- [ ] 必須項目(商品名等)を空にして送信 → バリデーションエラー(422 相当)で DB が変わらない
- [ ] 数量変更入力を空にして確定 → 0 として送信される(入出庫レコードなし)
- [ ] 存在しない id への PUT → **旧: HTTP 500** で `{"success": false, "message": "アイテムの更新中にエラーが発生しました: ..."}`(findOrFail の例外が catch されるため **404 は返らない** — §3.4)。新はこの 500 挙動を再現するか 404 に修正するか(⚠️要確認)の決定に従って検証する
- [ ] 編集モードの UI: ボタン色トグル・列数変化が再現されている。**非対称仕様の確認**: ヘッダは「いずれか 1 行でも編集中」で 8 列化し、行は編集中の該当行のみ 8 列(複数行のうち 1 行だけ編集した際に非編集行とヘッダがずれる現行挙動 — §2.2 — を忠実再現するか修正するかの決定に従う)
- [ ] 旧で編集した結果が新の一覧に反映される(再取得後)。逆方向も同様

### 7.4 在庫管理一覧 — 入庫記録モーダル(POST /api/items/bulk)

- [ ] 入力欄が**単一行の `<input type="text">`**であり、改行(複数商品)を入力できないこと(新旧一致。textarea になっていないこと)
- [ ] 1 行入力(`商品名,型番,納品場所,入庫数量,備考`)で items に 1 件追加され、新旧の一覧に同一内容で表示される
- [ ] (API 直叩き)`items` に複数要素の配列を送ると要素数分 INSERT されること(UI からは到達不能だが API 挙動として新旧一致 — §3.3)
- [ ] 各値が trim されて登録される(カンマ前後の空白)
- [ ] **stock_ins にレコードが増えない**こと(現行仕様: 一括登録は入庫履歴を残さない)
- [ ] 登録成功メッセージ「アイテムが正常に登録されました。」が表示される
- [ ] モーダルを閉じると一覧が再取得され新規行が見える
- [ ] 数量に数値文字列以外を入れた場合の挙動が新旧で一致する(⚠️現行はバリデーションなし — 新実装で検証を追加した場合は差分として記録)

### 7.5 在庫管理一覧 — CSV ダウンロード(POST /api/items/csv)

- [ ] 行を 2〜3 件選択してダウンロード → CSV の行数・内容が選択行と一致し、新旧のファイル内容が一致する
- [ ] ヘッダ行が `ID,商品名,型番,場所,在庫数,備考,登録日` である(CSV ヘッダは「在庫数」— 画面見出し「在庫数量」と異なる表記で現行どおり)
- [ ] ファイルが **UTF-8 BOM 付き**で、Excel で文字化けせず開ける
- [ ] ファイル名が `{YYYYMM}_棚卸し.csv`(例 `202607_棚卸し.csv`)である。**年月は UTC 基準**(JST の毎月 1 日 0:00〜8:59 は前月表記になる — §2.2)のため、月初検証時は注意。ローカル時刻基準に修正した場合は差分として記録
- [ ] 選択 0 件でダウンロード実行 → **リクエストが送信されない**こと。旧はエラーメッセージ「エラー: 選択されたアイテムがありません。」が**画面に表示されない**(無反応)ことを確認。新は非表示の忠実再現/表示修正(⚠️要確認 G)の決定に従う
- [ ] ダウンロード失敗時(旧): 「ダウンロード中に未知のエラーが発生しました。」も**画面には表示されない**(console.error のみ)ことを確認。同上の決定に従う
- [ ] 全選択チェックボックスで全行選択 → 全件 CSV が新旧一致する
- [ ] created_at(登録日)のフォーマットが新旧で一致する

### 7.6 備考詳細モーダル

- [ ] 「詳細」ボタンで該当行の備考全文がモーダル表示される
- [ ] 備考が NULL/空の行での挙動が新旧一致する
- [ ] モーダルの閉じる操作が機能する

### 7.7 ナビゲーション・レイアウト

- [ ] ロゴ・「在庫一覧」リンクが `/index` に遷移する
- [ ] ドロップダウンにログインユーザー名が表示される(新: Better Auth セッション由来)
- [ ] 「Profile」→ パスワード変更画面、「Log Out」→ ログアウトしてログイン画面へ
- [ ] モバイル幅でハンバーガーメニューが動作し、**ユーザー名・メールアドレスの表示、「Profile」リンク、「Log Out」ボタン**が新旧同等に存在する(新: メールは Better Auth セッション API の email 由来)
- [ ] モバイルメニュー上段のナビ項目の行き先が仕様どおりであること(⚠️要確認 D の決定に従う: 旧「Dashboard」→ 新「在庫一覧」`/index` 等)

### 7.8 パスワード変更画面

- [ ] 現在のパスワード誤りでエラーになる
- [ ] 正しい入力で変更が成功し、成功表示が出る
- [ ] 変更後の新パスワードでログインできる(新システムのみで検証。旧とはユーザー基盤が別)

### 7.9 対象外機能の遮断確認(新システム)

- [ ] `/test` / `/register` / `/forgot-password` / `/items/createTest` / `/login` 等の対象外パスが 404 になる(`/login` は §6.2 の決定に従う)
- [ ] `POST /api/items/update` が存在しない(404/405)
- [ ] 未認証で `/api/items` 系 4 本すべてが 401 を返す
- [ ] `GET /items`(認証なし公開版)が存在しない(⚠️要確認 A の決定に従う)
- [ ] Broadcast チャンネル(`App.Models.User.{id}`)・`inspire` コマンド相当の機能が新実装に存在しない(§6.2 — 未使用ボイラープレートのため移植しない)

### 7.10 DB 整合性(並走期間全体)

- [ ] 一連の検証操作後、items / stock_ins / stock_outs の全行を新旧操作分含めて目視/クエリ突き合わせし、片系だけの不整合レコードがない
- [ ] `logs` テーブルに新旧どちらからも書き込みが発生していない
- [ ] 新実装が `quantityChange` カラム(items)を現行同様「読み取りで返すのみ・入出庫処理では上書きしない」ことを確認(新旧で値が乖離しないこと)