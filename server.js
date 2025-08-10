// server.js 일부

let dangerZones = []; // 여러 위험 지역 저장
let latestLocation = null;

function calculateDistance(lat1, lon1, lat2, lon2) {
  // ... (이전과 동일)
}

// 여러 위험 지역 등록 API (POST /danger-zones)
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
