fetch("certible_export.json")
  .then(response => response.json())
  .then(data => {
    const grouped = {};

    // === 1. Groepeer op Rubriek > School-Issuer
    data.forEach(entry => {
      const rubric = entry["School-Issuer"]?.split(" - ")[0]?.trim() || "Uncategorized";
      const school = entry["School-Issuer"] || "Unknown School";

      if (!grouped[rubric]) grouped[rubric] = {};
      if (!grouped[rubric][school]) grouped[rubric][school] = [];
      grouped[rubric][school].push(entry);
    });

    // === 2. Bovenste tabs (Rubrieken)
    const tabsDiv = document.getElementById("tabs");
    const subtabsDiv = document.createElement("div");
    const tableDiv = document.getElementById("table-container");
    tabsDiv.appendChild(subtabsDiv);

    const allRubrics = Object.keys(grouped);

    allRubrics.forEach((rubric, index) => {
      const tab = document.createElement("div");
      tab.className = "tab" + (index === 0 ? " active" : "");
      tab.innerText = rubric;
      tab.onclick = () => showSubtabs(rubric);
      tabsDiv.appendChild(tab);
    });

    function showSubtabs(rubric) {
      // Active hoofdtab
      document.querySelectorAll("#tabs > .tab").forEach(tab => tab.classList.remove("active"));
      [...tabsDiv.children].find(tab => tab.innerText === rubric).classList.add("active");

      subtabsDiv.innerHTML = "";
      const schools = Object.keys(grouped[rubric]);

      schools.forEach((school, i) => {
        const subtab = document.createElement("div");
        subtab.className = "tab small-tab" + (i === 0 ? " active" : "");
        subtab.innerText = school;
        subtab.onclick = () => showTable(rubric, school);
        subtabsDiv.appendChild(subtab);
      });

      showTable(rubric, schools[0]);
    }

    function showTable(rubric, school) {
      // Active subtab
      document.querySelectorAll("#tabs .small-tab").forEach(tab => tab.classList.remove("active"));
      [...subtabsDiv.children].find(tab => tab.innerText === school).classList.add("active");

      const dataRows = grouped[rubric][school];
      if (!dataRows || dataRows.length === 0) return;

      const headers = Object.keys(dataRows[0]);
      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tr = document.createElement("tr");
      headers.forEach(h => {
        const th = document.createElement("th");
        th.innerText = h;
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      dataRows.forEach(row => {
        const tr = document.createElement("tr");
        headers.forEach(h => {
          const td = document.createElement("td");
          td.innerText = row[h] || "";
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);

      tableDiv.innerHTML = "";
      tableDiv.appendChild(table);
    }

    showSubtabs(allRubrics[0]); // Toon eerste rubriek met subtab
  });
