import express from "express";
import fetch from "node-fetch";

const router = express.Router();

function getDayNum() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

router.post("/add_data", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const day_num = getDayNum();

    const pythonPayload = [{ day_num, latitude, longitude }];

    const pythonRes = await fetch("https://two025unithonpython.onrender.com/add_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pythonPayload),
    });

    const result = await pythonRes.json();
    res.json(result);

    // 모델 학습도 같이 호출
    await fetch("https://two025unithonpython.onrender.com/train_model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Python API 호출 실패" });
  }
});

router.post("/train_model", async (req, res) => {
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

router.post("/check_location", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const day_num = getDayNum();

    const pythonPayload = [{ day_num, latitude, longitude }];

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

export default router;
