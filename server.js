const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// JSONリクエストをパースする
app.use(express.json());

// サンプルエンドポイント
app.get('/', (req, res) => {
    res.send('本番環境のサーバーが正常に動作しています！');
});

// データを受け取るエンドポイント
app.post('/data', (req, res) => {
    console.log('受信データ:', req.body);
    res.json({ message: 'データが正常に受け取られました！' });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`サーバーがポート ${PORT} で起動しました`);
});
