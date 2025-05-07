const express = require('express');
const path = require('path');
const app = express();

// 정적 파일 제공
app.use(express.static(path.join(__dirname)));

// 카카오 API 키 제공 엔드포인트
app.get('/api/kakao-key', (req, res) => {
    res.json({ apiKey: process.env.KAKAO_API_KEY });
});

// 기본 라우트
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 서버 시작
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 