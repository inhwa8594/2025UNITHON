// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 서버 메모리에 위험 지역과 최신 위치 저장
let dangerZone = null; // { latitude, longitude, radius }
let latestLocation = null; // { latitude, longitude }

// 거리 계산 함수 (미터 단위)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// 위험 지역 설정 API
app.post('/danger-zone', (req, res) => {
  const { latitude, longitude, radius } = req.body;
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    typeof radius !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  dangerZone = { latitude, longitude, radius };
  console.log('Danger zone updated:', dangerZone);
  res.json({ message: 'Danger zone set' });
});

// 위치 전송 API (Sender가 위치를 보냄)
app.post('/location', (req, res) => {
  const { latitude, longitude } = req.body;
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  latestLocation = { latitude, longitude };

  // 위험 지역 내인지 판단
  let danger = false;
  if (dangerZone) {
    const dist = calculateDistance(
      latitude, longitude,
      dangerZone.latitude, dangerZone.longitude
    );
    if (dist <= dangerZone.radius) {
      danger = true;
      console.log('위험 지역 내 위치 감지:', latestLocation);
    }
  }

  res.json({ danger });
});

// 위험 상태 확인 API (Receiver가 위험 지역 상태 확인)
app.get('/danger-status', (req, res) => {
  let danger = false;
  if (dangerZone && latestLocation) {
    const dist = calculateDistance(
      latestLocation.latitude, latestLocation.longitude,
      dangerZone.latitude, dangerZone.longitude
    );
    if (dist <= dangerZone.radius) {
      danger = true;
    }
  }
  res.json({ danger });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
