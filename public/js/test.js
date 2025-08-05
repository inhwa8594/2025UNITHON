const test_btn = document.getElementById("test-btn");
let a = 0;
alert(`a: ${a}`);
test_btn.addEventListener("click", (e) => {
    e.preventDefault();
    a++;
    alert(`a: ${a}`);
});
