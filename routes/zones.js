import express from "express";
const router = express.Router();

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

function getDayNum() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

// 안전 지역 등록
router.post("/safe-zones", (req, res) => {
  const zones = req.body;
  if (!Array.isArray(zones)) return res.status(400).json({ error: "안전 지역 리스트여야 합니다." });
  for (const zone of zones) {
    if (typeof zone.latitude !== "number" || typeof zone.longitude !== "number" || typeof zone.radius !== "number") {
      return res.status(400).json({ error: "잘못된 안전 지역 데이터" });
    }
  }
  safeZones = zones;
  res.json({ message: "안전 지역 리스트 저장 완료" });
});

// 위험 지역 등록
router.post("/danger-zones", (req, res) => {
  const zones = req.body;
  if (!Array.isArray(zones)) return res.status(400).json({ error: "위험 지역 리스트여야 합니다." });
  for (const zone of zones) {
    if (typeof zone.latitude !== "number" || typeof zone.longitude !== "number" || typeof zone.radius !== "number") {
      return res.status(400).json({ error: "잘못된 위험 지역 데이터" });
    }
  }
  dangerZones = zones;
  res.json({ message: "위험 지역 리스트 저장 완료" });
});

// 위치 체크
router.post("/location", async (req, res) => {
  const { latitude, longitude } = req.body;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return res.status(400).json({ error: "Invalid input" });
  }
  latestLocation = { latitude, longitude };

  const isSafe = safeZones.some(zone => calculateDistance(latitude, longitude, zone.latitude, zone.longitude) <= zone.radius);
  const danger = dangerZones.some(zone => calculateDistance(latitude, longitude, zone.latitude, zone.longitude) <= zone.radius);

  //위치 기록
  try {
    const day_num = getDayNum(); // 요일 계산
    const pythonPayload = [{ day_num, latitude, longitude }];

    const pythonRes = await fetch("https://two025unithonpython.onrender.com/add_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pythonPayload),
    });

    const pythonResult = await pythonRes.json();

    // 결과 같이 반환
    res.json({ isSafe, danger, pythonResult });
  } catch (err) {
    console.error("Python API 호출 실패:", err);
    res.status(500).json({ error: "Python API 호출 실패", isSafe, danger });
  }
});

router.get("/safe-status", (req, res) => {
  const isSafe = latestLocation && safeZones.some(zone => calculateDistance(latestLocation.latitude, latestLocation.longitude, zone.latitude, zone.longitude) <= zone.radius);
  res.json({ isSafe, safeZones, latestLocation });
});

router.get("/danger-status", (req, res) => {
  const danger = latestLocation && dangerZones.some(zone => calculateDistance(latestLocation.latitude, latestLocation.longitude, zone.latitude, zone.longitude) <= zone.radius);
  res.json({ danger, dangerZones, latestLocation });
});

router.delete("/danger-zones/:index", (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= dangerZones.length) return res.status(400).json({ error: "잘못된 인덱스" });
  dangerZones.splice(index, 1);
  res.json({ message: "위험 지역 삭제 완료", dangerZones });
});

router.delete("/safe-zones/:index", (req, res) => {
  const index = parseInt(req.params.index);
  if (isNaN(index) || index < 0 || index >= safeZones.length) return res.status(400).json({ error: "잘못된 인덱스" });
  safeZones.splice(index, 1);
  res.json({ message: "안전 지역 삭제 완료", safeZones });
});

export default router;
