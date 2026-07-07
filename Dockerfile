FROM node:lts

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY src/package*.json ./

# 依存関係をインストール
RUN npm install

# srcディレクトリの内容をコピー
COPY src .

# 開発サーバーを起動
CMD ["npm", "run", "dev"]
