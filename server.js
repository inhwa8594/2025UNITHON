// index.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


const path = require('path');
// ✅ public 폴더 안에 있는 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'public')));

// ✅ 루트 경로에 들어오면 test.html 서빙
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.get('/', (req, res) => {
res.send({ message: 'Hello from Render with Node.js!' });
});

app.listen(PORT, () => {
  console.log("Server is running on port ${PORT}");
});
