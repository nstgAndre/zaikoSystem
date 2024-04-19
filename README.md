# 在庫管理システム環境構築手順

1. git cloneする
```
https://github.com/nstgAndre/zaikoSystem
```
2. laravelのコンテナ内に入る
```
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
```
6. keyの生成
```
php artisan key generate
```
7.DB側にテーブルを作成する
```
php artisan migrate
```
8. laravelの表示を確認
```
http://localhost:8000/
```
9. reactの表示確認
```
http://localhost:3000/
```
my-react-app/package.jsonファイルでホットリロード有効化(もうなってる可能性ある)
以下のように編集
```
"start": "WATCHPACK_POLLING=true react-scripts start",
```


