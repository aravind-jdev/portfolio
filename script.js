// Clock Update
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  document.getElementById("clock").textContent = `${hours}:${minutes} ${ampm}`;
}
updateClock();
setInterval(updateClock, 1000);

function playSound(id) {
  const sound = document.getElementById(id);
  if (!sound) return;

  sound.currentTime = 0; // allow rapid replay
  sound.play().catch(() => {
    // Autoplay blocked — ignore silently
  });
}

let firstInteraction = false;

document.addEventListener("click", () => {
  if (!firstInteraction) {
    playSound("sound-startup");
    firstInteraction = true;
  }
});

// Window Management
let activeWindow = null;
let windowZIndex = 100;
let openWindows = {};

function openWindow(name) {
  const windowEl = document.getElementById(`window-${name}`);
  windowEl.style.display = "block";
  bringToFront(name);
  openWindows[name] = true;
  updateTaskbar();
  playSound("sound-open");
}

function closeWindow(name) {
  const windowEl = document.getElementById(`window-${name}`);
  windowEl.style.display = "none";
  delete openWindows[name];
  updateTaskbar();
  playSound("sound-close");
}

function minimizeWindow(name) {
  const windowEl = document.getElementById(`window-${name}`);
  windowEl.style.display = "none";
  playSound("sound-minimize");
}

function maximizeWindow(name) {
  const windowEl = document.getElementById(`window-${name}`);
  if (windowEl.dataset.maximized === "true") {
    // Restore
    windowEl.style.left = windowEl.dataset.prevLeft;
    windowEl.style.top = windowEl.dataset.prevTop;
    windowEl.style.width = windowEl.dataset.prevWidth;
    windowEl.style.height = windowEl.dataset.prevHeight;
    windowEl.dataset.maximized = "false";
  } else {
    // Maximize
    windowEl.dataset.prevLeft = windowEl.style.left;
    windowEl.dataset.prevTop = windowEl.style.top;
    windowEl.dataset.prevWidth = windowEl.style.width;
    windowEl.dataset.prevHeight = windowEl.style.height;
    windowEl.style.left = "0";
    windowEl.style.top = "0";
    windowEl.style.width = "100%";
    windowEl.style.height = "calc(100vh - 30px)";
    windowEl.dataset.maximized = "true";
  }
}

function bringToFront(name) {
  // Remove active class from all windows
  document
    .querySelectorAll(".window")
    .forEach((w) => w.classList.remove("active"));
  // Add active class to current window
  const windowEl = document.getElementById(`window-${name}`);
  windowEl.classList.add("active");
  windowZIndex++;
  windowEl.style.zIndex = windowZIndex;
  activeWindow = name;
  updateTaskbar();
}

// Drag functionality
let isDragging = false;
let dragWindow = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function startDrag(e, windowId) {
  isDragging = true;
  dragWindow = document.getElementById(windowId);
  const rect = dragWindow.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
  bringToFront(windowId.replace("window-", ""));
}

document.addEventListener("mousemove", function (e) {
  if (isDragging && dragWindow) {
    dragWindow.style.left = e.clientX - dragOffsetX + "px";
    dragWindow.style.top = e.clientY - dragOffsetY + "px";
  }
});

document.addEventListener("mouseup", function () {
  isDragging = false;
  dragWindow = null;
});

// Taskbar
function updateTaskbar() {
  const taskbarWindows = document.getElementById("taskbar-windows");
  taskbarWindows.innerHTML = "";

  for (const name in openWindows) {
    const item = document.createElement("button");
    item.className = "taskbar-item" + (activeWindow === name ? " active" : "");

    let icon = "";
    let title = "";
    switch (name) {
      case "about":
        title = "About Me";
        icon = `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="4" width="14" height="10" rx="1" fill="#C8C8C8"/><rect x="3" y="6" width="10" height="6" fill="#1A5276"/></svg>`;
        break;
      case "works":
        title = "My Works";
        icon = `<svg viewBox="0 0 16 16" width="16" height="16"><path d="M1 5 L1 14 L15 14 L15 5 L8 5 L7 3 L1 3 Z" fill="#F4D03F"/></svg>`;
        break;
      case "contact":
        title = "Contact Me";
        icon = `<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1" y="4" width="14" height="10" rx="1" fill="#E8E8E8"/><path d="M1 5 L8 10 L15 5" fill="none" stroke="#3498DB" stroke-width="1"/></svg>`;
        break;
    }

    item.innerHTML = icon + title;
    item.onclick = function () {
      const windowEl = document.getElementById(`window-${name}`);
      if (windowEl.style.display === "none") {
        windowEl.style.display = "block";
      }
      bringToFront(name);
    };
    taskbarWindows.appendChild(item);
  }
}

// Start Menu
function toggleStartMenu() {
  const startMenu = document.getElementById("start-menu");
  startMenu.classList.toggle("show");
}

// Close start menu when clicking elsewhere
document.addEventListener("click", function (e) {
  const startMenu = document.getElementById("start-menu");
  const startButton = document.querySelector(".start-button");
  if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
    startMenu.classList.remove("show");
  }
});

// Desktop icon selection
function selectIcon(iconEl) {
  document
    .querySelectorAll(".icon")
    .forEach((i) => i.classList.remove("selected"));
  iconEl.classList.add("selected");
}

// Click on desktop to deselect icons
document.getElementById("desktop").addEventListener("click", function (e) {
  if (e.target === this || e.target.classList.contains("desktop-icons")) {
    document
      .querySelectorAll(".icon")
      .forEach((i) => i.classList.remove("selected"));
  }
});

document.querySelectorAll("button, .icon, .menu-item").forEach((el) => {
  el.addEventListener("click", () => {
    playSound("sound-click");
  });
});

document
  .querySelector(".footer-btn:last-child")
  .addEventListener("click", () => {
    playSound("sound-close");
  });

document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = document.getElementById("bg-music");
  const musicToggle = document.getElementById("music-toggle");

  if (!bgMusic || !musicToggle) return;

  let musicEnabled = false;

  // Restore state
  if (localStorage.getItem("musicEnabled") === "true") {
    musicEnabled = true;
    bgMusic.volume = 0.4;
    bgMusic.play().catch(() => {});
    musicToggle.textContent = "🔊";
  }

  musicToggle.addEventListener("click", () => {
    musicEnabled = !musicEnabled;

    if (musicEnabled) {
      bgMusic.volume = 0.4;
      bgMusic.play().catch(() => {});
      musicToggle.textContent = "🔊";
      localStorage.setItem("musicEnabled", "true");
    } else {
      bgMusic.pause();
      musicToggle.textContent = "🔇";
      localStorage.setItem("musicEnabled", "false");
    }
  });
});
