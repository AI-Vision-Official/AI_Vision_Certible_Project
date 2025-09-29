const fs = require("fs");
const path = require("path");
let dataByRubric = {};
let currentRubric = '';
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

function createTabs() {
  const tabContainer = document.getElementById('tab-buttons');
  tabContainer.innerHTML = '';

  Object.keys(dataByRubric).forEach((rubric, index) => {
    const button = document.createElement('button');
    button.className = 'tab-button';
    button.innerText = rubric;
    button.onclick = () => showTab(rubric);
    tabContainer.appendChild(button);
    if (index === 0) button.classList.add('active');
  });
}

function showTab(rubric) {
  currentRubric = rubric;
  const content = document.getElementById('tab-content');
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  [...document.getElementsByClassName('tab-button')].find(btn => btn.innerText === rubric).classList.add('active');

  const records = dataByRubric[rubric];
  if (!records || records.length === 0) return content.innerHTML = '<p>Geen data.</p>';

  const headers = Object.keys(records[0]);
  if (!visibleColumns[rubric]) {
    visibleColumns[rubric] = {};
    headers.forEach(h => visibleColumns[rubric][h] = true);
  }

  const searchBox = document.createElement('input');
  searchBox.type = 'text';
  searchBox.placeholder = 'Zoek...';
  searchBox.className = 'search-box';

  const table = document.createElement('table');
  const thead = table.createTHead();
  const headRow = thead.insertRow();
  headers.forEach(header => {
    const th = document.createElement('th');
    th.innerText = header;
    th.classList.add('resizable');
    th.onclick = () => {
      records.sort((a, b) => ('' + a[header]).localeCompare(b[header]));
      renderTable(searchBox.value);
    };
    headRow.appendChild(th);
  });

  const tbody = table.createTBody();

  function renderTable(filter = '') {
    tbody.innerHTML = '';
    records.forEach((row, rowIndex) => {
      if (filter && !Object.values(row).some(val => String(val).toLowerCase().includes(filter.toLowerCase()))) return;

      const tr = tbody.insertRow();
      headers.forEach(header => {
        const cell = tr.insertCell();
        if (!visibleColumns[rubric][header]) {
          cell.style.display = 'none';
        }
        const input = document.createElement('input');
        input.type = 'text';
        input.value = row[header] || '';
        input.onchange = (e) => {
          dataByRubric[rubric][rowIndex][header] = e.target.value;
        };
        cell.appendChild(input);
      });
    });
    table.classList.toggle('mini', miniView);
  }

  searchBox.addEventListener('input', () => renderTable(searchBox.value));

  content.innerHTML = '';
  content.appendChild(searchBox);
  content.appendChild(table);

  renderTable();
  updateColumnPicker(headers);
}

function toggleMiniView() {
  miniView = !miniView;
  showTab(currentRubric);
}

function toggleColumnPicker() {
  const picker = document.getElementById('column-picker');
  picker.style.display = picker.style.display === 'block' ? 'none' : 'block';
}

function updateColumnPicker(headers) {
  const picker = document.getElementById('column-picker');
  picker.innerHTML = '';

  headers.forEach(header => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = visibleColumns[currentRubric][header];
    checkbox.onchange = () => {
      visibleColumns[currentRubric][header] = checkbox.checked;
      showTab(currentRubric);
    };
    const label = document.createElement('label');
    label.style.display = 'block';
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + header));
    picker.appendChild(label);
  });
}

function exportCurrentTab(format = 'json') {
  const data = dataByRubric[currentRubric];
  let blob, filename;

  if (format === 'json') {
    blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    filename = `${currentRubric}.json`;
  } else if (format === 'csv') {
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(h => `"${(obj[h] || '').replace(/"/g, '""')}"`).join(','));
    rows.unshift(headers.join(','));
    blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    filename = `${currentRubric}.csv`;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


        const fields = [
            "Certificate Name", "School / Issuer", "Subject", "Part of Series", "Diploma Number",
            "Date Credential", "Level", "Language", "Location", "Certification Type",
            "Accredited?", "Accreditation Institute", "Valid Until", "Renewed?", "Status",
            "Renewed On", "Badge", "Badge Platform", "Remarks"
        ];

        const tableHead = document.getElementById("tableHead");
        const tableBody = document.getElementById("tableBody");
        const certForm = document.getElementById("certForm");

        fields.forEach(f => {
            let th = document.createElement("th");
            th.textContent = f;
            tableHead.appendChild(th);
        });

        certForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newEntry = {};
            fields.forEach(f => {
                newEntry[f] = document.getElementById(f).value;
            });
            fetch("certible_export.json")
                .then(resp => resp.json())
                .catch(() => [])
                .then(data => {
                    data.push(newEntry);
                    return fetch("certible_data.json", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(data, null, 4)
                    });
                }).then(() => {
                    certForm.reset();
                    loadData();
                });
        });

        loadData();


