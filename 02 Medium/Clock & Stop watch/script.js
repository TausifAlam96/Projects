// ==========================================
// 1. CLOCK LOGIC
// ==========================================
function updateClock() {
  const now = new Date();

  // Time
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  document.getElementById("clock-display").innerText =
    `${hours}:${minutes}:${seconds} ${ampm}`;

  // Date
  const options = { weekday: "long", month: "short", day: "numeric" };
  document.getElementById("date-display").innerText = now.toLocaleDateString(
    "en-US",
    options,
  );
}

setInterval(updateClock, 1000);
updateClock(); // Initial call

// ==========================================
// 2. SWIPE GESTURE LOGIC (Touch & Mouse)
// ==========================================
let touchstartX = 0;
let touchendX = 0;
let isDragging = false;

const slider = document.getElementById("slider");
const dotStopwatch = document.getElementById("dot-stopwatch");
const dotClock = document.getElementById("dot-clock");

function handleGesture() {
  // Swipe Right -> moves slider to the left panel (Stopwatch)
  if (touchendX > touchstartX + 60) {
    slider.style.transform = "translateX(0%)";
    dotStopwatch.classList.add("active");
    dotClock.classList.remove("active");
  }
  // Swipe Left -> moves slider to the right panel (Clock)
  if (touchendX < touchstartX - 60) {
    slider.style.transform = "translateX(-50%)";
    dotClock.classList.add("active");
    dotStopwatch.classList.remove("active");
  }
}

const appContainer = document.getElementById("app-container");

// Touch Listeners (Mobile)
appContainer.addEventListener("touchstart", (e) => {
  touchstartX = e.changedTouches[0].screenX;
});
appContainer.addEventListener("touchend", (e) => {
  touchendX = e.changedTouches[0].screenX;
  handleGesture();
});

// Mouse Listeners (Desktop)
appContainer.addEventListener("mousedown", (e) => {
  isDragging = true;
  touchstartX = e.screenX;
});
appContainer.addEventListener("mouseup", (e) => {
  if (isDragging) {
    touchendX = e.screenX;
    handleGesture();
    isDragging = false;
  }
});
appContainer.addEventListener("mouseleave", () => {
  isDragging = false;
});

// ==========================================
// 3. STOPWATCH & LOCAL STORAGE LOGIC
// ==========================================
let startTime = 0;
let elapsedTime = 0;
let timerInterval;
let isRunning = false;

// Fetch saved timestamps from Local Storage
let timestamps = JSON.parse(localStorage.getItem("saved_timestamps")) || [];

const display = document.getElementById("stopwatch-display");
const startStopBtn = document.getElementById("start-stop-btn");
const timestampBtn = document.getElementById("timestamp-btn");
const list = document.getElementById("timestamps-list");

function formatTime(msTotal) {
  let date = new Date(msTotal);
  let m = date.getUTCMinutes().toString().padStart(2, "0");
  let s = date.getUTCSeconds().toString().padStart(2, "0");
  let ms = Math.floor(date.getUTCMilliseconds() / 10)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}.${ms}`;
}

function updateDisplay() {
  display.innerText = formatTime(elapsedTime);
}

function renderTimestamps() {
  list.innerHTML = "";
  // Render from newest to oldest
  [...timestamps].reverse().forEach((ts, index) => {
    let li = document.createElement("li");
    // Calculate lap number correctly since we reversed the array
    let lapNumber = timestamps.length - index;
    li.innerHTML = `<span>Lap ${lapNumber}</span> <span style="color:var(--secondary)">${formatTime(ts)}</span>`;
    list.appendChild(li);
  });
}

startStopBtn.addEventListener("click", () => {
  if (isRunning) {
    // STOP
    clearInterval(timerInterval);
    startStopBtn.innerText = "Start";
    startStopBtn.style.background = "var(--primary)";
    startStopBtn.style.color = "#000";
    timestampBtn.disabled = true;
  } else {
    // START
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(() => {
      elapsedTime = Date.now() - startTime;
      updateDisplay();
    }, 10); // Update every 10ms for smooth ms tracking

    startStopBtn.innerText = "Stop";
    startStopBtn.style.background = "var(--danger)";
    startStopBtn.style.color = "#fff";
    timestampBtn.disabled = false;
  }
  isRunning = !isRunning;
});

timestampBtn.addEventListener("click", () => {
  if (isRunning) {
    timestamps.push(elapsedTime);
    localStorage.setItem("saved_timestamps", JSON.stringify(timestamps));
    renderTimestamps();
  }
});

document.getElementById("reset-btn").addEventListener("click", () => {
  clearInterval(timerInterval);
  isRunning = false;
  elapsedTime = 0;
  startTime = 0;
  timestamps = [];
  localStorage.removeItem("saved_timestamps"); // Clear Storage

  updateDisplay();
  renderTimestamps();

  startStopBtn.innerText = "Start";
  startStopBtn.style.background = "var(--primary)";
  startStopBtn.style.color = "#000";
  timestampBtn.disabled = true;
});

// Initialize display on load
updateDisplay();
renderTimestamps();
