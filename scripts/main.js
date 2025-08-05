const urlInput = document.querySelector(".url-input input");
const messageEl = document.querySelector(".message");
const outputPanel = document.querySelector(".output-panel");
const downloadMenu = outputPanel.querySelector(".download-menu tbody");
const preview = outputPanel.querySelector(".preview");

let data = null;
let audios = [];
let videos = [];
let subtitles = [];
let isLoading = false;

async function fetchData() {
  if (isLoading) return;
  isLoading = true;
  const videoId = getVideoId(urlInput.value);
  messageEl.classList.toggle("hidden", videoId);
  if (!videoId) {
    messageEl.textContent = "Please enter a valid video URL";
    return;
  }

  const url = `https://youtube-media-downloader.p.rapidapi.com/v2/video/details?videoId=${videoId}&urlAccess=normal&videos=auto&audios=auto`;
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": "b9cfa18b70mshca5c43de2f67d55p1a81bdjsnec2cdad998fa",
      "x-rapidapi-host": "youtube-media-downloader.p.rapidapi.com",
    },
  };

  const response = await fetch(url, options);
  const result = await response.json();

  data = result;
  audios = result.audios.items;
  videos = result.videos.items;
  subtitles = result.subtitles.items;

  updateDownloadMenu();
  updatePreview();

  isLoading = false;
}

function updateDownloadMenu() {
  const hasItems = [audios, videos, subtitles].some((arr) => arr.length > 0);
  outputPanel.classList.toggle("hidden", !hasItems);

  downloadMenu.innerHTML = `
    <tr>
      <td class="title" colspan="3"><i class="bi bi-music-note-beamed"></i> Audio</td>
    </tr>
    ${audios
      .map(
        (item) => `
        <tr>
          <td>${item.extension}</td>
          <td>${item.sizeText}</td>
          <td><button class="button" onclick="window.open('${item.url}', '_blank')">Download</button></td>
        </tr> 
      `
      )
      .join("")}
    <tr>
      <td class="title" colspan="3"><i class="bi bi-camera-video-fill"></i> Video</td>
    </tr>
       ${videos
         .map(
           (item) => `
        <tr>
          <td>${item.quality}</td>
          <td>${item.sizeText}</td>
          <td><button class="button" onclick="window.open('${item.url}', '_blank')">Download</button></td>
        </tr>
      `
         )
         .join("")}
    <tr>
      <td class="title" colspan="3"><i class="bi bi-badge-cc-fill"></i> Subtitle</td>
    </tr>
       ${subtitles
         .map(
           (item) => `
        <tr> 
          <td>${item.code}</td>
          <td>${item.text}</td>
          <td><button class="button" onclick="downloadSubtitle('${item.url}')">Download</button></td>
        </tr>  
      `
         )
         .join("")}
  `;
}

function updatePreview() {
  preview.innerHTML = `
    <img class="thumbnail" src="${data.thumbnails[0].url}">
    <select onchange="downloadThumbnail(this.value)">
      <option value="">Download Thumbnail</option>
      ${data.thumbnails.map(
        (thumbnail) => `
        <option value="${thumbnail.url}">${thumbnail.width}x${thumbnail.height}</option>  
      `
      )}
    </select>     
    <h2 class="title">${data.title}</h2>
    <p class="duration">Duration: ${formatTime(data.lengthSeconds)}</p>
  `;
}

function getVideoId(url) {
  const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|shorts\/|live\/|.*[?&]v=))([^"&?\/\s]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  return videoId;
}

function downloadThumbnail(url) {
  if (!url) return;
  download(url, `${data.title}.jpg`);
}

async function downloadSubtitle(url) {
  const response = await fetch(url);
  const xmlText = await response.text();
  const srtText = convertXmlToSrt(xmlText);

  const blob = new Blob([srtText]);
  const blobUrl = URL.createObjectURL(blob);
  download(blobUrl, `${data.title}.srt`);
}
