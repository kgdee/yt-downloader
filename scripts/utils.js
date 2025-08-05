window.addEventListener("error", (event) => {
  const error = `${event.type}: ${event.message}`;
  console.error(error);
  alert(error);
});

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hide(element) {
  element.classList.add("hidden");
}

function show(element) {
  element.classList.remove("hidden");
}

function save(key, value) {
  localStorage.setItem(`${projectName}_${key}`, JSON.stringify(value));
}

function load(key, defaultValue) {
  const savedValue = localStorage.getItem(`${projectName}_${key}`);
  if (savedValue == null) return defaultValue;
  return JSON.parse(savedValue);
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function getFileName(file) {
  const encoded = file.name;
  const decoded = decodeURIComponent(encoded);
  const fileName = decoded.split("/").pop();

  return fileName;
}

function getFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function getFileText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

function getFileExtension(file) {
  return getFileName(file).split(".").pop();
}

function changeScreen(screenName) {
  document.querySelectorAll(".screen").forEach((element) => {
    element.classList.add("hidden");
  });

  document.querySelector(`.screen.${screenName}`).classList.remove("hidden");
}

function createLinks(element) {
  const text = element.innerHTML;
  const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  const replacedText = text.replace(urlPattern, (url) => `<a href="${url}" target="_blank">${url}</a>`);
  element.innerHTML = replacedText;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readClipboard() {
  await sleep(1000);
  if (!document.hasFocus()) return;
  if (!(navigator.clipboard && navigator.clipboard.readText)) return;

  const clipboardText = await navigator.clipboard.readText();

  return clipboardText;
}

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function convertXmlToSrt(text) {
  // Parse XML
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");
  const texts = xml.getElementsByTagName("text");

  let srtText = "";
  for (let i = 0; i < texts.length; i++) {
    const start = parseFloat(texts[i].getAttribute("start"));
    const dur = parseFloat(texts[i].getAttribute("dur") || 2);
    const end = start + dur;
    const content = texts[i].textContent.replace(/\n+/g, " ");

    // Convert seconds to HH:MM:SS,MS
    const formatTime = (t) => {
      const h = String(Math.floor(t / 3600)).padStart(2, "0");
      const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
      const s = String(Math.floor(t % 60)).padStart(2, "0");
      const ms = String(Math.floor((t % 1) * 1000)).padStart(3, "0");
      return `${h}:${m}:${s},${ms}`;
    };

    srtText += `${i + 1}\n${formatTime(start)} --> ${formatTime(end)}\n${content}\n\n`;
  }

  return srtText
}

async function download(url, name) {
  const response = await fetch(url);
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}