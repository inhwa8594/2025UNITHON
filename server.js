// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let lastLocation = null; // 최근 위치 저장용 (메모리)

app.post('/location', (req, res) => {
  const { latitude, longitude } = req.body;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  lastLocation = { latitude, longitude, timestamp: new Date() };
  console.log('위치 저장:', lastLocation);
  res.json({ status: 'success' });
});

app.get('/location', (req, res) => {
  if (!lastLocation) {
    return res.status(404).json({ error: 'No location data yet' });
  }
  res.json(lastLocation);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
