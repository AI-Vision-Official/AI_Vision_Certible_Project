const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'certible_export.json');
const tableHead = document.getElementById('tableHead');
const tableBody = document.getElementById('tableBody');
const tabsDiv = document.getElementById('tabs');

let allData = [];
let currentRubric = '';

function loadData() {
  fs.readFile(dataFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Failed to load data:', err);
      return;
    }
    try {
      allData = JSON.parse(data);
      renderTabs();
      renderTable(allData.filter(row => row.Rubric === currentRubric));
    } catch (parseErr) {
      console.error('Failed to parse JSON:', parseErr);
    }
  });
}

function renderTabs() {
  const rubrics = [...new Set(allData.map(item => item.Rubric || 'Other'))];
  tabsDiv.innerHTML = '';
  rubrics.forEach(rubric => {
    const btn = document.createElement('button');
    btn.textContent = rubric;
    btn.onclick = () => {
      currentRubric = rubric;
      renderTable(allData.filter(row => row.Rubric === rubric));
    };
    tabsDiv.appendChild(btn);
  });
  currentRubric = rubrics[0] || '';
}

function renderTable(data) {
  if (!data.length) return;

  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  const headers = Object.keys(data[0]);
  const trHead = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    trHead.appendChild(th);
  });
  tableHead.appendChild(trHead);

  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(key => {
      const td = document.createElement('td');
      td.textContent = row[key] || '';
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

loadData();