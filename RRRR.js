// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let dangerZones = []; // 여러 위험 지역 저장
let latestLocation = null;


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

// 여러 위험 지역 등록 (POST /danger-zones)
app.post('/danger-zones', (req, res) => {
  const zones = req.body; // [{latitude, longitude, radius}, ...]
  if (!Array.isArray(zones)) {
    return res.status(400).json({ error: '위험 지역 리스트여야 합니다.' });
  }
  for (const zone of zones) {
    if (typeof zone.latitude !== 'number' ||
        typeof zone.longitude !== 'number' ||
        typeof zone.radius !== 'number') {
      return res.status(400).json({ error: '잘못된 위험 지역 데이터' });
    }
  }
  dangerZones = zones;
  console.log('위험 지역 리스트 업데이트:', dangerZones);
  res.json({ message: '위험 지역 리스트 저장 완료' });
});


// 위치 전송
app.post('/location', (req, res) => {
  const { latitude, longitude } = req.body;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  latestLocation = { latitude, longitude };

  let danger = false;
  for (const zone of dangerZones) {
    const dist = calculateDistance(latitude, longitude, zone.latitude, zone.longitude);
    if (dist <= zone.radius) {
      danger = true;
      break;
    }
  }

  res.json({ danger });
});

// 위험 상태 확인
app.get('/danger-status', (req, res) => {
  let danger = false;
  if (latestLocation && dangerZones.length > 0) {
    for (const zone of dangerZones) {
      const dist = calculateDistance(
        latestLocation.latitude, latestLocation.longitude,
        zone.latitude, zone.longitude,
      );
      if (dist <= zone.radius) {
        danger = true;
        break;
      }
    }
  }
  res.json({ danger, dangerZones, latestLocation });
});

// 위험 지역 삭제 - DELETE /danger-zones/:index
app.delete('/danger-zones/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= dangerZones.length) {
    return res.status(400).json({ error: '잘못된 인덱스' });
  }
  dangerZones.splice(index, 1);
  console.log('위험 지역 삭제:', index);
  res.json({ message: '위험 지역 삭제 완료', dangerZones });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});