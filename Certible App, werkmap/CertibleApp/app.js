const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'certible_export.json');
let rawData = fs.readFileSync(dataPath);
let data = JSON.parse(rawData);

// En laad dan je data in de tabel
renderTable(data); // of loadData(data);

const fields = [
  "Certificate Name", "School / Issuer", "Subject", "Part of Series", "Diploma Number",
  "Date Credential", "Language", "Location", "Certification Type", "Accredited?",
  "Accreditation Institute", "Valid Until", "Renewed?", "Status", "Renewed On",
  "Badge", "Badge Platform", "Remarks"
];

function showTab(tab) {
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("active"));
  document.getElementById(tab + "-tab").classList.add("active");
  document.querySelector(".tab-btn[onclick*='" + tab + "']").classList.add("active");
}

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
  const newRow = tableBody.insertRow();
  fields.forEach(f => {
    let cell = newRow.insertCell();
    cell.textContent = document.getElementById(f).value;
  });
  certForm.reset();
  showTab("table");
});
