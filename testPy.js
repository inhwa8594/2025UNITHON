import fetch from "node-fetch";

const res = await fetch('https://two025unithonpython.onrender.com/add_data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ day_num: 1, latitude: 37.5665, longitude: 126.978 }),
});
console.log(res.status, res.headers.get('content-type'));
const text = await res.text();
console.log(text);