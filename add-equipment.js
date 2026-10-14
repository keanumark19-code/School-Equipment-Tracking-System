(function () {
  "use strict";

  var form = document.getElementById("add-equipment-form");
  var message = document.getElementById("form-message");
  var viewRecordsLink = document.getElementById("view-records-link");
  var saveButton = form.querySelector('button[type="submit"]');
  var fields = [
    "equipment-id",
    "equipment-name",
    "model",
    "serial-number",
    "purchase-date",
    "location",
    "category",
    "condition",
    "status"
  ];

  function showMessage(text, isSuccess) {
    message.textContent = text;
    message.className = isSuccess ? "message message-success" : "message message-not-found";
    message.hidden = false;
    viewRecordsLink.hidden = !isSuccess;
  }

  function value(id) {
    return document.getElementById(id).value.trim();
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    message.hidden = true;
    saveButton.disabled = true;

    for (var index = 0; index < fields.length; index += 1) {
      var input = document.getElementById(fields[index]);
      if (input.value.trim() === "") {
        showMessage("Please complete all required fields.", false);
        input.focus();
        saveButton.disabled = false;
        return;
      }
    }

    var record = {
      id: value("equipment-id").toUpperCase(),
      name: value("equipment-name"),
      model: value("model"),
      serialNumber: value("serial-number"),
      purchaseDate: value("purchase-date"),
      location: value("location"),
      category: value("category"),
      condition: value("condition"),
      status: value("status")
    };

    if (["Available", "In Use", "Under Maintenance", "Lost", "Damaged"].indexOf(record.status) === -1) {
      showMessage("Select a status from the available options.", false);
      document.getElementById("status").focus();
      saveButton.disabled = false;
      return;
    }

    try {
      await window.EquipmentStorage.add(record);
      form.reset();
      showMessage("Equipment saved successfully. The new record is available in Equipment Records, search, category filters, sorting, and details.", true);
    } catch (error) {
      showMessage(error.message, false);
    } finally {
      saveButton.disabled = false;
    }
  });
}());
