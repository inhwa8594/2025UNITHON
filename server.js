import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function getDayNum() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

app.post("/add_data", async (req, res) => {
  console.log("[/add_data] 요청 수신:", req.body);
  try {
    const { latitude, longitude } = req.body;
    const day_num = getDayNum();
    console.log(`[add_data] day_num: ${day_num}, latitude: ${latitude}, longitude: ${longitude}`);

    const pythonPayload = { day_num, latitude, longitude };

    const pythonRes = await fetch("https://two025unithonpython.onrender.com/add_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pythonPayload),
    });
    const result = await pythonRes.json();
    console.log("[add_data] 파이썬 응답:", result);
    res.json(result);

  } catch (error) {
    console.error("[add_data][ERROR]", error);
    res.status(500).json({ error: "Python API 호출 실패" });
  }
});

app.post("/train_model", async (req, res) => {
  console.log("[/train_model] 요청 수신");
  try {
    const pythonRes = await fetch("https://two025unithonpython.onrender.com/train_model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const result = await pythonRes.json();
    console.log("[train_model] 파이썬 응답:", result);
    res.json(result);
  } catch (error) {
    console.error("[train_model][ERROR]", error);
    res.status(500).json({ error: "Python API 호출 실패" });
  }
});

app.post("/check_location", async (req, res) => {
  console.log("[/check_location] 요청 수신:", req.body);
  try {
    const { latitude, longitude } = req.body;
    const day_num = getDayNum();
    console.log(`[check_location] day_num: ${day_num}, latitude: ${latitude}, longitude: ${longitude}`);

    const pythonPayload = { day_num, latitude, longitude };

    const pythonRes = await fetch("https://two025unithonpython.onrender.com/detect_anomaly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pythonPayload),
    });

    const result = await pythonRes.json();
    console.log("[check_location] 파이썬 응답:", result);
    res.json(result);
  } catch (error) {
    console.error("[check_location][ERROR]", error);
    res.status(500).json({ error: "Python API 호출 실패" });
  }
});

app.post('/safe-zones', (req, res) => {
  console.log("[/safe-zones] 요청 수신:", req.body);
  const zones = req.body;
  if (!Array.isArray(zones)) {
    console.log("[safe-zones][ERROR] 안전 지역 리스트여야 합니다.");
    return res.status(400).json({ error: '안전 지역 리스트여야 합니다.' });
  }
  for (const zone of zones) {
    if (typeof zone.latitude !== 'number' || typeof zone.longitude !== 'number' || typeof zone.radius !== 'number') {
      console.log("[safe-zones][ERROR] 잘못된 안전 지역 데이터:", zone);
      return res.status(400).json({ error: '잘못된 안전 지역 데이터' });
    }
  }
  safeZones = zones;
  console.log("[safe-zones] 안전 지역 리스트 업데이트 완료:", safeZones);
  res.json({ message: '안전 지역 리스트 저장 완료' });
});

app.post('/danger-zones', (req, res) => {
  console.log("[/danger-zones] 요청 수신:", req.body);
  const zones = req.body;
  if (!Array.isArray(zones)) {
    console.log("[danger-zones][ERROR] 위험 지역 리스트여야 합니다.");
    return res.status(400).json({ error: '위험 지역 리스트여야 합니다.' });
  }
  for (const zone of zones) {
    if (typeof zone.latitude !== 'number' || typeof zone.longitude !== 'number' || typeof zone.radius !== 'number') {
      console.log("[danger-zones][ERROR] 잘못된 위험 지역 데이터:", zone);
      return res.status(400).json({ error: '잘못된 위험 지역 데이터' });
    }
  }
  dangerZones = zones;
  console.log("[danger-zones] 위험 지역 리스트 업데이트 완료:", dangerZones);
  res.json({ message: '위험 지역 리스트 저장 완료' });
});

app.post('/location', (req, res) => {
  console.log("[/location] 요청 수신:", req.body);
  const { latitude, longitude } = req.body;
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    console.log("[location][ERROR] Invalid input:", req.body);
    return res.status(400).json({ error: 'Invalid input' });
  }
  latestLocation = { latitude, longitude };
  console.log("[location] 최신 위치 업데이트:", latestLocation);

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
  console.log(`[location] 위치 안전 여부: isSafe=${isSafe}, danger=${danger}`);
  res.json({ isSafe, danger });
});

app.get('/safe-status', (req, res) => {
  console.log("[/safe-status] 요청 수신");
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
  console.log("[safe-status] 현재 상태:", { isSafe, safeZones, latestLocation });
  res.json({ isSafe, safeZones, latestLocation });
});

app.get('/danger-status', (req, res) => {
  console.log("[/danger-status] 요청 수신");
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
  console.log("[danger-status] 현재 상태:", { danger, dangerZones, latestLocation });
  res.json({ danger, dangerZones, latestLocation });
});

app.delete('/danger-zones/:index', (req, res) => {
  console.log("[DELETE /danger-zones/:index] 요청 수신, 인덱스:", req.params.index);
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= dangerZones.length) {
    console.log("[danger-zones][ERROR] 잘못된 인덱스:", req.params.index);
    return res.status(400).json({ error: '잘못된 인덱스' });
  }
  dangerZones.splice(index, 1);
  console.log("[danger-zones] 위험 지역 삭제 완료, 남은 위험 지역:", dangerZones);
  res.json({ message: '위험 지역 삭제 완료', dangerZones });
});

app.delete('/safe-zones/:index', (req, res) => {
  console.log("[DELETE /safe-zones/:index] 요청 수신, 인덱스:", req.params.index);
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= safeZones.length) {
    console.log("[safe-zones][ERROR] 잘못된 인덱스:", req.params.index);
    return res.status(400).json({ error: '잘못된 인덱스' });
  }
  safeZones.splice(index, 1);
  console.log("[safe-zones] 안전 지역 삭제 완료, 남은 안전 지역:", safeZones);
  res.json({ message: '안전 지역 삭제 완료', safeZones });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});