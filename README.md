# 在庫管理システム環境構築手順

1. git cloneする
```
https://github.com/nstgAndre/zaikoSystem
```
2. コンテナビルド＆laravelのappコンテナ内に入る
```
docker-compose up --build
docker-compose exec app bash
```
3. srcディレクトリ移動
```
cd src
```
4. .envファイル生成
```
cp .env.example .env
```
5. composerのインストール
```
composer install
または
composer update

npm update

```
6. keyの生成
```
php artisan key:generate

```
7.DB側にテーブルを作成する
```
php artisan migrate
```
8. laravelの表示を確認
```
http://localhost:8000/
```
9. npm run devで起動
  VITE v5.2.10  ready in 513 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://172.26.0.3:5173/
  ➜  press h + enter to show help

  LARAVEL v10.48.9  plugin v1.0.2
この表記がでる

10.laravelとreactの連携を確認
```
http://localhost:8000/test
```
11..envファイル
```
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=sample
DB_USERNAME=user
DB_PASSWORD=password

```

12.CSVダウンロードの為ダウンロードすること
```
composer require usmanhalalit/laracsv
```


13.実行したコマンドリスト
```
npm i react-loader-spinner
```