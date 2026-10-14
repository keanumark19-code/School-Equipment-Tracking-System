(function () {
  "use strict";

  var requestedId = new URLSearchParams(window.location.search).get("id");
  var message = document.getElementById("details-message");
  var details = document.getElementById("equipment-details");

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

  function renderRecord(records) {
    var record = null;
    for (var index = 0; index < records.length; index += 1) {
      if (records[index].id === requestedId) {
        record = records[index];
        break;
      }
    }

    details.textContent = "";
    if (record === null) {
      details.hidden = true;
      message.className = "message message-not-found";
      message.textContent = "Equipment not found. Select a record from the equipment records page.";
      message.hidden = false;
      return;
    }

    message.hidden = true;
    var title = document.createElement("h2");
    title.textContent = record.name;
    details.appendChild(title);

    var subtitle = document.createElement("p");
    subtitle.className = "detail-subtitle";
    subtitle.textContent = "Identification number: " + record.id;
    details.appendChild(subtitle);

    var grid = document.createElement("dl");
    grid.className = "detail-grid";
    addDetail(grid, "Name", record.name);
    addDetail(grid, "Identification Number", record.id);
    addDetail(grid, "Model", record.model);
    addDetail(grid, "Serial Number", record.serialNumber);
    addDetail(grid, "Purchase Date", record.purchaseDate);
    addDetail(grid, "Location", record.location);
    addDetail(grid, "Category", record.category);
    addDetail(grid, "Condition", record.condition);

    var statusItem = document.createElement("div");
    statusItem.className = "detail-item";
    var statusTerm = document.createElement("dt");
    statusTerm.textContent = "Current Status";
    var statusDescription = document.createElement("dd");
    var statusLabel = document.createElement("span");
    statusLabel.className = "status " + statusClass(record.status);
    statusLabel.textContent = record.status;
    statusDescription.appendChild(statusLabel);
    statusItem.appendChild(statusTerm);
    statusItem.appendChild(statusDescription);
    grid.appendChild(statusItem);
    details.appendChild(grid);
    details.hidden = false;
  }

  window.EquipmentApp.onRecordsChange(renderRecord);
  window.EquipmentApp.initialize().catch(function () {
    details.hidden = true;
  });
}());
