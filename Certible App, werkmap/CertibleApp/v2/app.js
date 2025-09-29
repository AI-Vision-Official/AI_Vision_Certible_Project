let dataByRubric = {};

fetch('certible_export.json')
  .then(res => res.json())
  .then(data => {
    groupByRubric(data);
    createTabs();
    showTab(Object.keys(dataByRubric)[0]);
  });

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
  const content = document.getElementById('tab-content');
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  [...document.getElementsByClassName('tab-button')].find(btn => btn.innerText === rubric).classList.add('active');

  const records = dataByRubric[rubric];
  if (!records || records.length === 0) return content.innerHTML = '<p>Geen data.</p>';

  const headers = Object.keys(records[0]);

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
        const input = document.createElement('input');
        input.type = 'text';
        input.value = row[header] || '';
        input.onchange = (e) => {
          dataByRubric[rubric][rowIndex][header] = e.target.value;
        };
        cell.appendChild(input);
      });
    });
  }

  searchBox.addEventListener('input', () => {
    renderTable(searchBox.value);
  });

  content.innerHTML = '';
  content.appendChild(searchBox);
  content.appendChild(table);

  renderTable();
}
