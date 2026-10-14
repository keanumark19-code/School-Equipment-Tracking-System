(function () {
  "use strict";

  var form = document.getElementById("search-form");
  var searchValue = document.getElementById("search-value");
  var searchField = document.getElementById("search-field");
  var message = document.getElementById("search-message");
  var result = document.getElementById("search-result");

  function showResult() {
    if (searchValue.value.trim() === "") {
      return;
    }
    var record = window.EquipmentAlgorithms.linearSearch(
      window.EquipmentApp.getRecords(),
      searchValue.value,
      searchField.value
    );

    if (record === null) {
      result.hidden = true;
      message.className = "message message-not-found";
      message.textContent = "Equipment not found.";
      message.hidden = false;
      return;
    }

    message.hidden = true;
    renderResult(record);
  }

  function addDetail(parent, label, value) {
    var item = document.createElement("div");
    item.className = "detail-item";
    var term = document.createElement("dt");
    term.textContent = label;
    var description = document.createElement("dd");
    description.textContent = value;
    item.appendChild(term);
    item.appendChild(description);
    parent.appendChild(item);
  }

  function renderResult(record) {
    result.textContent = "";
    var title = document.createElement("h2");
    title.textContent = record.name;
    result.appendChild(title);
    var subtitle = document.createElement("p");
    subtitle.className = "detail-subtitle";
    subtitle.textContent = "Equipment ID: " + record.id;
    result.appendChild(subtitle);

    var grid = document.createElement("dl");
    grid.className = "detail-grid";
    addDetail(grid, "Equipment Name", record.name);
    addDetail(grid, "Identification Number", record.id);
    addDetail(grid, "Model", record.model);
    addDetail(grid, "Serial Number", record.serialNumber);
    addDetail(grid, "Purchase Date", record.purchaseDate);
    addDetail(grid, "Location", record.location);
    addDetail(grid, "Category", record.category);
    addDetail(grid, "Condition", record.condition);
    addDetail(grid, "Current Status", record.status);
    result.appendChild(grid);

    var actions = document.createElement("div");
    actions.className = "detail-actions";
    var link = document.createElement("a");
    link.className = "button button-secondary";
    link.href = "details.html?id=" + encodeURIComponent(record.id);
    link.textContent = "Open full equipment details";
    actions.appendChild(link);
    result.appendChild(actions);
    result.hidden = false;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    showResult();
  });

  window.EquipmentApp.onRecordsChange(showResult);
  window.EquipmentApp.initialize().catch(function () {
    form.querySelector('button[type="submit"]').disabled = true;
  });
}());
