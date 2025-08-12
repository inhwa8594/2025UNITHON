import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Python API 통신 부분 ---
function getDayNum() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

app.post("/add_data", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const day_num = getDayNum();

    const pythonPayload = { day_num, latitude, longitude };

    const pythonRes = await fetch("https://two025unithonpython.onrender.com/add_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pythonPayload),
    });

    const result = await pythonRes.json();
    res.json(result);

    /*//gkrtmq
    const aaa = await fetch("https://two025unithonpython.onrender.com/train_model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })*/
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Python API 호출 실패" });
  }
});

app.post("/train_model", async (req, res) => {
  try {
    const pythonRes = await fetch("https://two025unithonpython.onrender.com/train_model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const result = await pythonRes.json();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Python API 호출 실패" });
  }
});

app.post("/check_location", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const day_num = getDayNum();

    const pythonPayload = { day_num, latitude, longitude };

    const pythonRes = await fetch("https://two025unithonpython.onrender.com/detect_anomaly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pythonPayload),
    });

    const result = await pythonRes.json();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Python API 호출 실패" });
  }
});

// --- 위험 지역 관리 부분 ---
let safeZones = [];
let dangerZones = [];
let latestLocation = null;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.post('/safe-zones', (req, res) => {
  const zones = req.body;
  if (!Array.isArray(zones)) return res.status(400).json({ error: '안전 지역 리스트여야 합니다.' });
  for (const zone of zones) {
    if (typeof zone.latitude !== 'number' || typeof zone.longitude !== 'number' || typeof zone.radius !== 'number') {
      return res.status(400).json({ error: '잘못된 안전 지역 데이터' });
    }
  }
  safeZones = zones;
  console.log('안전 지역 리스트 업데이트:', safeZones);
  res.json({ message: '안전 지역 리스트 저장 완료' });
});

app.post('/danger-zones', (req, res) => {
  const zones = req.body;
  if (!Array.isArray(zones)) return res.status(400).json({ error: '위험 지역 리스트여야 합니다.' });
  for (const zone of zones) {
    if (typeof zone.latitude !== 'number' || typeof zone.longitude !== 'number' || typeof zone.radius !== 'number') {
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

  let isSafe = false;
  for (const zone of safeZones) {
    const dist = calculateDistance(latitude, longitude, zone.latitude, zone.longitude);
    if (dist <= zone.radius) {
      isSafe = true;
      break;
    }
  }

  let danger = false;
  for (const zone of dangerZones) {
    const dist = calculateDistance(latitude, longitude, zone.latitude, zone.longitude);
    if (dist <= zone.radius) {
      danger = true;
      break;
    }
  }

  res.json({ isSafe, danger });
});

app.get('/safe-status', (req, res) => {
  let isSafe = false;
  if (latestLocation && safeZones.length > 0) {
    for (const zone of safeZones) {
      const dist = calculateDistance(
        latestLocation.latitude, latestLocation.longitude,
        zone.latitude, zone.longitude,
      );
      if (dist <= zone.radius) {
        isSafe = true;
        break;
      }
    }
  }
  res.json({ isSafe, safeZones, latestLocation });
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

app.delete('/danger-zones/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= dangerZones.length) {
    return res.status(400).json({ error: '잘못된 인덱스' });
  }
  dangerZones.splice(index, 1);
  console.log('위험 지역 삭제:', index);
  res.json({ message: '위험 지역 삭제 완료', dangerZones });
});

app.delete('/safe-zones/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= safeZones.length) {
    return res.status(400).json({ error: '잘못된 인덱스' });
  }
  safeZones.splice(index, 1);
  console.log('안전 지역 삭제:', index);
  res.json({ message: '안전 지역 삭제 완료', safeZones });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
