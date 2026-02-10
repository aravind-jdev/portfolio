function toggleStart() {
  const menu = document.getElementById("start-menu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

function openWindow() {
  document.getElementById("window").style.display = "block";
}

function closeWindow() {
  document.getElementById("window").style.display = "none";
}

// Clock
setInterval(() => {
  const clock = document.getElementById("clock");
  const now = new Date();
  clock.textContent = now.toLocaleTimeString();
}, 1000);

const win = document.getElementById("window");
const titleBar = document.getElementById("title-bar");

let offsetX = 0;
let offsetY = 0;
let isDragging = false;

titleBar.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - win.offsetLeft;
  offsetY = e.clientY - win.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  win.style.left = e.clientX - offsetX + "px";
  win.style.top = e.clientY - offsetY + "px";
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});
