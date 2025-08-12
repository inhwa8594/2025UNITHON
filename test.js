import fetch from "node-fetch";

const NODE_SERVER = "https://two025unithon.onrender.com"; // Express 서버 주소
const PYTHON_SERVER = "https://two025unithonpython.onrender.com"; // FastAPI 서버 주소

async function testAddData() {
  console.log("=== /add_data 테스트 ===");
  const res = await fetch(`${NODE_SERVER}/add_data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: 37.5665, longitude: 126.9780 }) // 서울 좌표 예시
  });
  console.log(await res.json());
}

async function testTrainModel() {
  console.log("=== /train_model 테스트 ===");
  const res = await fetch(`${NODE_SERVER}/train_model`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  console.log(await res.json());
}

async function testCheckLocation() {
  console.log("=== /check_location 테스트 ===");
  const res = await fetch(`${NODE_SERVER}/check_location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: 37.5665, longitude: 126.9780 })
  });
  console.log(await res.json());
}

async function testDeleteData() {
    console.log("=== /delete_data 테스트 ===");
    try {
        const res = await fetch(`${NODE_SERVER}/delete_data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                day_num: 1,
                latitude: 37.5665,
                longitude: 126.9780
            })
        });

        const json = await res.json();
        console.log(json);
    } catch (err) {
        console.error("Error:", err);
    }
}

async function testSafeZone() {
  console.log("=== /safe-zones 테스트 ===");
  const res = await fetch(`${NODE_SERVER}/safe-zones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{ latitude: 37.5665, longitude: 126.9780, radius: 500 }])
  });
  console.log(await res.json());
}

async function testDangerZone() {
  console.log("=== /danger-zones 테스트 ===");
  const res = await fetch(`${NODE_SERVER}/danger-zones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{ latitude: 37.5651, longitude: 126.98955, radius: 300 }])
  });
  console.log(await res.json());
}

async function runTests() {
  await testAddData();
  await testTrainModel();
  await testCheckLocation();
  await testDeleteData();
  await testSafeZone();
  await testDangerZone();
}

runTests();
