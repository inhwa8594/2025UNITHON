import fetch from "node-fetch";

const NODE_SERVER = "https://two025unithon.onrender.com"; // Express 서버 주소
const PYTHON_SERVER = "https://two025unithonpython.onrender.com"; // FastAPI 서버 주소

async function testAddData() {
  console.log("=== /add_data 테스트 ===");
  const res = await fetch(`${NODE_SERVER}/add_data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: 37.4955, longitude: 126.9573 }) // 서울 좌표 예시
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
    body: JSON.stringify({ latitude: 37.4955, longitude: 126.9573 })
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
                day_num: 2,
                latitude: 37.4955,
                longitude: 126.9573
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
    body: JSON.stringify([{ latitude: 37.4955, longitude: 126.9573, radius: 500 }])
  });
  console.log(await res.json());
}

async function testDangerZone() {
  console.log("=== /danger-zones 테스트 ===");
  const res = await fetch(`${NODE_SERVER}/danger-zones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([{ latitude: 37.4955, longitude: 126.9573, radius: 300 }])
  });
  console.log(await res.json());
}

// 최신 위치 정보 POST 테스트
async function testLocation() {
  console.log("=== /location 테스트 ===");
  const res = await fetch(`${NODE_SERVER}/location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude: 37.4955, longitude: 126.9573 }),
  });
  console.log(await res.json());
}

// 현재 안전 상태 GET 테스트
async function testSafeStatus() {
  console.log("=== /safe-status 테스트 ===");
  const res = await fetch(`${NODE_SERVER}/safe-status`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  console.log(await res.json());
}

// 현재 위험 상태 GET 테스트
async function testDangerStatus() {
  console.log("=== /danger-status 테스트 ===");
  const res = await fetch(`${NODE_SERVER}/danger-status`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  console.log(await res.json());
}

// 특정 인덱스의 안전 지역 삭제 테스트
async function testDeleteSafeZone(index) {
  console.log(`=== /safe-zones/${index} 삭제 테스트 ===`);
  const res = await fetch(`${NODE_SERVER}/safe-zones/${index}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  console.log(await res.json());
}

// 특정 인덱스의 위험 지역 삭제 테스트
async function testDeleteDangerZone(index) {
  console.log(`=== /danger-zones/${index} 삭제 테스트 ===`);
  const res = await fetch(`${NODE_SERVER}/danger-zones/${index}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
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

  await testLocation();
  await testSafeStatus();
  await testDangerStatus();

  // 인덱스 예시: 0번 위치 삭제 시도
  await testDeleteSafeZone(0);
  await testDeleteDangerZone(0);
}

runTests();
