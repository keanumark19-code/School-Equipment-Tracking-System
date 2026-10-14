(function () {
  "use strict";

  var records = [];
  var categoryFilter = document.getElementById("category-filter");
  var sortField = document.getElementById("sort-field");
  var tableBody = document.getElementById("equipment-table-body");
  var emptyMessage = document.getElementById("empty-records");
  var countMessage = document.getElementById("records-count");
  var importButton = document.getElementById("import-legacy-records");
  var importState = document.getElementById("import-state");
  var activeSortField = "name";

  function appendCell(row, value, label) {
    var cell = document.createElement("td");
    cell.setAttribute("data-label", label);
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
  }

  function statusClass(status) {
    if (status === "Available") {
      return "status-available";
    }
    if (status === "In Use") {
      return "status-in-use";
    }
    if (status === "Lost") {
      return "status-lost";
    }
    if (status === "Damaged") {
      return "status-damaged";
    }
    return "status-under-maintenance";
  }

  function populateCategoryFilter() {
    var selectedCategory = categoryFilter.value;
    while (categoryFilter.options.length > 1) {
      categoryFilter.remove(1);
    }

    for (var index = 0; index < records.length; index += 1) {
      var category = records[index].category;
      var exists = false;
      for (var optionIndex = 0; optionIndex < categoryFilter.options.length; optionIndex += 1) {
        if (categoryFilter.options[optionIndex].value === category) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        var option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
      }
    }
    categoryFilter.value = selectedCategory;
  }

  function renderRecords(updatedRecords) {
    records = updatedRecords || window.EquipmentApp.getRecords();
    populateCategoryFilter();

    var visibleRecords = [];
    var selectedCategory = categoryFilter.value;
    for (var index = 0; index < records.length; index += 1) {
      if (selectedCategory === "" || records[index].category === selectedCategory) {
        visibleRecords[visibleRecords.length] = records[index];
      }
    }
    visibleRecords = window.EquipmentAlgorithms.bubbleSort(visibleRecords, activeSortField);

    tableBody.textContent = "";
    for (var rowIndex = 0; rowIndex < visibleRecords.length; rowIndex += 1) {
      var record = visibleRecords[rowIndex];
      var row = document.createElement("tr");
      appendCell(row, record.id, "Equipment ID");
      appendCell(row, record.name, "Equipment Name");
      appendCell(row, record.model, "Model");
      appendCell(row, record.serialNumber, "Serial Number");
      appendCell(row, record.purchaseDate, "Purchase Date");
      appendCell(row, record.location, "Location");

      var categoryCell = appendCell(row, "", "Category");
      var categoryLabel = document.createElement("span");
      categoryLabel.className = "category-label";
      categoryLabel.textContent = record.category;
      categoryCell.appendChild(categoryLabel);

      appendCell(row, record.condition, "Condition");
      var statusCell = appendCell(row, "", "Status");
      var statusLabel = document.createElement("span");
      statusLabel.className = "status " + statusClass(record.status);
      statusLabel.textContent = record.status;
      statusCell.appendChild(statusLabel);

      var actionCell = document.createElement("td");
      actionCell.setAttribute("data-label", "Details");
      var detailsLink = document.createElement("a");
      detailsLink.className = "table-link";
      detailsLink.href = "details.html?id=" + encodeURIComponent(record.id);
      detailsLink.textContent = "View details";
      actionCell.appendChild(detailsLink);
      row.appendChild(actionCell);
      tableBody.appendChild(row);
    }

    countMessage.textContent = "Showing " + visibleRecords.length + " of " + records.length + " equipment records.";
    emptyMessage.hidden = visibleRecords.length !== 0;
  }

  categoryFilter.addEventListener("change", function () {
    renderRecords(records);
  });
  document.getElementById("sort-button").addEventListener("click", function () {
    activeSortField = sortField.value;
    renderRecords(records);
  });
  importButton.addEventListener("click", async function () {
    importButton.disabled = true;
    importState.textContent = "Importing this browser’s saved records…";
    try {
      var result = await window.EquipmentStorage.importLegacyRecords();
      await window.EquipmentApp.refresh();
      importState.textContent = result.attempted === 0
        ? "No previous browser records were found."
        : "Processed " + result.attempted + " previous records. Existing cloud IDs were preserved; records are now refreshed.";
    } catch (error) {
      importState.textContent = error.message;
    } finally {
      importButton.disabled = false;
    }
  });

  window.EquipmentApp.onRecordsChange(renderRecords);
  window.EquipmentApp.initialize().catch(function () {
    tableBody.textContent = "";
    countMessage.textContent = "";
    emptyMessage.hidden = true;
  });
}());
