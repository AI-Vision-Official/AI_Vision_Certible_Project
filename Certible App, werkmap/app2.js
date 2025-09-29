// app.js
const fs = require("fs");
const path = require("path");

let currentRubric = "";
let dataByRubric = {};
let visibleColumns = {};
let miniView = false;

const dataPath = path.join(__dirname, "certible_export.json");
let rawData = fs.readFileSync(dataPath);
let data = JSON.parse(rawData);

const loadingMessages = [
  "Booting up Certible... 🚀",
  "Counting certificates... 1, 2, 3, 37, 8902...",
  "Checking if Guinness World Records is watching 📚",
  "Still loading... maybe grab a tea? ☕",
  "Sorting through a sea of diplomas 🧠",
  "Almost there. We can see the graduation cap! 🎓",
  "This is more degrees than a thermometer 🌡️",
  "Certible: Where 55,000 dreams live 🌍"
];

function showLoadingMessages() {
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loading-info";
  document.body.appendChild(loadingDiv);

  let index = 0;
  const interval = setInterval(() => {
    loadingDiv.innerText = loadingMessages[index];
    index++;
    if (index >= loadingMessages.length) clearInterval(interval);
  }, 1500);
}

function hideLoadingMessages() {
  const loadingDiv = document.getElementById("loading-info");
  if (loadingDiv) loadingDiv.remove();
}

function groupByRubric(data) {
  data.forEach(item => {
    const rubric = (item.Rubric || "Uncategorized").substring(0, 31);
    if (!dataByRubric[rubric]) dataByRubric[rubric] = [];
    dataByRubric[rubric].push(item);
  });
}

const certForm = document.getElementById("certForm");
const fields = [
  "Certificate Name", "School / Issuer", "Subject", "Part of Series", "Diploma Number",
  "Date Credential", "Level", "Language", "Location", "Certification Type",
  "Accredited?", "Accreditation Institute", "Valid Until", "Renewed?", "Status",
  "Renewed On", "Badge", "Badge Platform", "Remarks"
];

// Bouw formulier
fields.forEach(field => {
  const wrapper = document.createElement("div");
  wrapper.className = "form-field";
  const label = document.createElement("label");
  label.innerText = field;
  const input = document.createElement("input");
  input.type = "text";
  input.id = field;
  wrapper.appendChild(label);
  wrapper.appendChild(input);
  certForm.appendChild(wrapper);
});

const submitButton = document.createElement("button");
submitButton.type = "submit";
submitButton.innerText = "➕ Add Certificate";
certForm.appendChild(submitButton);

certForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newEntry = {};
  fields.forEach(field => {
    newEntry[field] = document.getElementById(field).value;
  });
  data.push(newEntry);
  const rubric = newEntry.Rubric || "Uncategorized";
  if (!dataByRubric[rubric]) dataByRubric[rubric] = [];
  dataByRubric[rubric].push(newEntry);
  createTabs();
  showTab(rubric);
  certForm.reset();
});

function createTabs() {
  const tabContainer = document.getElementById("tab-buttons");
  tabContainer.innerHTML = "";
  Object.keys(dataByRubric).forEach((rubric, index) => {
    const button = document.createElement("button");
    button.className = "tab-button";
    button.innerText = rubric;
    button.onclick = () => showTab(rubric);
    tabContainer.appendChild(button);
    if (index === 0) button.classList.add("active");
  });
}

function showTab(rubric) {
  currentRubric = rubric;
  const content = document.getElementById("tab-content");
  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  [...document.getElementsByClassName("tab-button")]
    .find(btn => btn.innerText === rubric)?.classList.add("active");

  const records = dataByRubric[rubric];
  if (!records || records.length === 0) return content.innerHTML = "<p>Geen data.</p>";

  const headers = Object.keys(records[0]);
  if (!visibleColumns[rubric]) {
    visibleColumns[rubric] = {};
    headers.forEach(h => visibleColumns[rubric][h] = true);
  }

  const searchBox = document.createElement("input");
  searchBox.type = "text";
  searchBox.placeholder = "Zoek...";
  searchBox.className = "search-box";

  const table = document.createElement("table");
  const thead = table.createTHead();
  const headRow = thead.insertRow();

  headers.forEach(header => {
    if (!visibleColumns[rubric][header]) return;

    const th = document.createElement("th");
    th.innerText = header;
    th.style.position = "relative";
    th.style.userSelect = "none";
    th.classList.add("resizable");

    const resizer = document.createElement("div");
    resizer.style.position = 'absolute';
    resizer.style.right = 0;
    resizer.style.top = 0;
    resizer.style.width = '5px';
    resizer.style.height = '100%';
    resizer.style.cursor = 'col-resize';
    resizer.style.zIndex = 1;

    let startX, startWidth;
    resizer.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startWidth = th.offsetWidth;
      document.addEventListener('mousemove', resize);
      document.addEventListener('mouseup', stopResize);
    });

    function resize(e) {
      th.style.width = `${startWidth + e.clientX - startX}px`;
    }

    function stopResize() {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResize);
    }

    th.appendChild(resizer);
    headRow.appendChild(th);
  });

  const tbody = table.createTBody();

  function renderTable(filter = "") {
    tbody.innerHTML = "";
    records.forEach((row, rowIndex) => {
      if (filter && !Object.values(row).some(val => String(val).toLowerCase().includes(filter.toLowerCase()))) return;
      const tr = tbody.insertRow();
      headers.forEach(header => {
        if (!visibleColumns[rubric][header]) return;
        const cell = tr.insertCell();
        const input = document.createElement("input");
        input.type = "text";
        input.value = row[header] || "";
        input.onchange = (e) => {
          dataByRubric[rubric][rowIndex][header] = e.target.value;
        };
        cell.appendChild(input);
      });
    });
    table.classList.toggle("mini", miniView);
  }

  searchBox.addEventListener("input", () => renderTable(searchBox.value));

  content.innerHTML = "";
  content.appendChild(searchBox);
  content.appendChild(table);
  renderTable();
  updateColumnPicker(headers);
  const certCount = document.getElementById("cert-count");
  if (certCount) certCount.innerText = records.length;
  hideLoadingMessages();
}

function toggleMiniView() {
  miniView = !miniView;
  showTab(currentRubric);
}

function toggleColumnPicker() {
  const picker = document.getElementById("column-picker");
  picker.style.display = picker.style.display === "block" ? "none" : "block";
}

function updateColumnPicker(headers) {
  const picker = document.getElementById("column-picker");
  picker.innerHTML = "";
  headers.forEach(header => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = visibleColumns[currentRubric][header];
    checkbox.onchange = () => {
      visibleColumns[currentRubric][header] = checkbox.checked;
      showTab(currentRubric);
    };
    const label = document.createElement("label");
    label.style.display = "block";
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + header));
    picker.appendChild(label);
  });
}

function exportCurrentTab(format = "json") {
  const records = dataByRubric[currentRubric];
  if (!records) return;

  let blob, filename;
  if (format === "json") {
    blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    filename = `${currentRubric}.json`;
  } else if (format === "csv") {
    const headers = Object.keys(records[0]);
    const rows = records.map(r => headers.map(h => `"${(r[h] || "").replace(/"/g, '""')}"`).join(","));
    rows.unshift(headers.join(","));
    blob = new Blob([rows.join("\n")], { type: "text/csv" });
    filename = `${currentRubric}.csv`;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Init
showLoadingMessages();
groupByRubric(data);
createTabs();
showTab(Object.keys(dataByRubric)[0]);
const fs = require("fs");
const path = require("path");

let currentRubric = "";
let dataByRubric = {};
let visibleColumns = {};
let miniView = false;

const dataPath = path.join(__dirname, "certible_export.json");
let rawData = fs.readFileSync(dataPath);
let data = JSON.parse(rawData);

function groupByRubric(data) {
  data.forEach(item => {
    const rubric = (item.Rubric || "Uncategorized").substring(0, 31);
    if (!dataByRubric[rubric]) dataByRubric[rubric] = [];
    dataByRubric[rubric].push(item);
  });
}

const certForm = document.getElementById("certForm");
const fields = [
  "Certificate Name", "School / Issuer", "Subject", "Part of Series", "Diploma Number",
  "Date Credential", "Level", "Language", "Location", "Certification Type",
  "Accredited?", "Accreditation Institute", "Valid Until", "Renewed?", "Status",
  "Renewed On", "Badge", "Badge Platform", "Remarks"
];

// Dynamisch formulier opbouwen
fields.forEach(field => {
  const input = document.createElement("input");
  input.type = "text";
  input.id = field;
  input.placeholder = field;
  certForm.appendChild(input);
});

certForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newEntry = {};
  fields.forEach(field => {
    newEntry[field] = document.getElementById(field).value;
  });

  data.push(newEntry);

  const rubricKey = newEntry.Rubric || "Uncategorized";
  if (!dataByRubric[rubricKey]) {
    dataByRubric[rubricKey] = [];
  }
  dataByRubric[rubricKey].push(newEntry);

  createTabs();
  showTab(rubricKey);
  certForm.reset();
});

function createTabs() {
  const tabContainer = document.getElementById("tab-buttons");
  tabContainer.innerHTML = "";
  Object.keys(dataByRubric).forEach((rubric, index) => {
    const button = document.createElement("button");
    button.className = "tab-button";
    button.innerText = rubric;
    button.onclick = () => showTab(rubric);
    tabContainer.appendChild(button);
    if (index === 0) button.classList.add("active");
  });
}

function showTab(rubric) {
  currentRubric = rubric;
  const content = document.getElementById("tab-content");
  document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
  [...document.getElementsByClassName("tab-button")].find(btn => btn.innerText === rubric)?.classList.add("active");

  const records = dataByRubric[rubric];
  if (!records || records.length === 0) return content.innerHTML = "<p>Geen data.</p>";

  const loadingMessages = [
    "📚 Fetching your certificates... it's a long, glorious scroll!",
    "🎓 Hold tight — we're sorting decades of brilliance...",
    "🪄 Casting a spell to summon your credentials...",
    "💾 Uploading knowledge... Please remain awesome.",
    "🚀 Launching Certible: the ultimate memory test begins!",
    "🧠 Compiling intelligence archive... might take a sec!",
    "📖 Too many diplomas to count... this could take a lifetime.",
    "👀 Wow, that's a lot of certificates. Respect.",
    "🐢 Even turtles are impressed by this pace!",
    "✨ Organizing your greatness — please stand by..."
  ];

  let msgIndex = 0;
  content.innerHTML = `<p id="loading-message" style="text-align:center;font-style:italic;margin:2em 0;"></p>`;
  const interval = setInterval(() => {
    const msg = loadingMessages[msgIndex++];
    if (!msg) return clearInterval(interval);
    document.getElementById("loading-message").innerText = msg;
  }, 1500);

  setTimeout(() => {
    clearInterval(interval);
    const headers = Object.keys(records[0]);
    if (!visibleColumns[rubric]) {
      visibleColumns[rubric] = {};
      headers.forEach(h => visibleColumns[rubric][h] = true);
    }

    const searchBox = document.createElement("input");
    searchBox.type = "text";
    searchBox.placeholder = "Zoek...";
    searchBox.className = "search-box";

    const table = document.createElement("table");
    const thead = table.createTHead();
    const headRow = thead.insertRow();

    headers.forEach(header => {
      if (!visibleColumns[rubric][header]) return;

      const th = document.createElement("th");
      th.innerText = header;
      th.style.position = "relative";
      th.style.userSelect = "none";
      th.classList.add("resizable");

      const resizer = document.createElement("div");
      resizer.style.position = 'absolute';
      resizer.style.right = 0;
      resizer.style.top = 0;
      resizer.style.width = '5px';
      resizer.style.height = '100%';
      resizer.style.cursor = 'col-resize';
      resizer.style.zIndex = 1;

      let startX, startWidth;
      resizer.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startWidth = th.offsetWidth;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
      });

      function resize(e) {
        th.style.width = `${startWidth + e.clientX - startX}px`;
      }

      function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
      }

      th.appendChild(resizer);
      headRow.appendChild(th);
    });

    const tbody = table.createTBody();

    function renderTable(filter = "") {
      tbody.innerHTML = "";
      records.forEach((row, rowIndex) => {
        if (filter && !Object.values(row).some(val => String(val).toLowerCase().includes(filter.toLowerCase()))) return;
        const tr = tbody.insertRow();
        headers.forEach(header => {
          if (!visibleColumns[rubric][header]) return;
          const cell = tr.insertCell();
          const input = document.createElement("input");
          input.type = "text";
          input.value = row[header] || "";
          input.onchange = (e) => {
            dataByRubric[rubric][rowIndex][header] = e.target.value;
          };
          cell.appendChild(input);
        });
      });
      table.classList.toggle("mini", miniView);
    }

    searchBox.addEventListener("input", () => renderTable(searchBox.value));

    content.innerHTML = "";
    content.appendChild(searchBox);
    content.appendChild(table);
    renderTable();
    updateColumnPicker(headers);

    const certCount = document.getElementById("cert-count");
    if (certCount) certCount.innerText = records.length;
  }, 8000);
}

function toggleMiniView() {
  miniView = !miniView;
  showTab(currentRubric);
}

function toggleColumnPicker() {
  const picker = document.getElementById("column-picker");
  picker.style.display = picker.style.display === "block" ? "none" : "block";
}

function updateColumnPicker(headers) {
  const picker = document.getElementById("column-picker");
  picker.innerHTML = "";
  headers.forEach(header => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = visibleColumns[currentRubric][header];
    checkbox.onchange = () => {
      visibleColumns[currentRubric][header] = checkbox.checked;
      showTab(currentRubric);
    };
    const label = document.createElement("label");
    label.style.display = "block";
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + header));
    picker.appendChild(label);
  });
}

function exportCurrentTab(format = "json") {
  const records = dataByRubric[currentRubric];
  if (!records) return;

  let blob, filename;
  if (format === "json") {
    blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
    filename = `${currentRubric}.json`;
  } else if (format === "csv") {
    const headers = Object.keys(records[0]);
    const rows = records.map(r => headers.map(h => `"${(r[h] || "").replace(/"/g, '""')}"`).join(","));
    rows.unshift(headers.join(","));
    blob = new Blob([rows.join("\n")], { type: "text/csv" });
    filename = `${currentRubric}.csv`;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Init
groupByRubric(data);
createTabs();
showTab(Object.keys(dataByRubric)[0]);
