(function () {
  "use strict";

  function valueForField(record, field) {
    if (field === "id") {
      return record.id;
    }
    if (field === "category") {
      return record.category;
    }
    return record.name;
  }

  function linearSearch(records, searchValue, field) {
    var query = searchValue.trim().toLowerCase();
    if (query === "") {
      return null;
    }

    for (var index = 0; index < records.length; index += 1) {
      var record = records[index];
      var matches = false;

      if (field === "all" || field === "name") {
        matches = record.name.toLowerCase().indexOf(query) !== -1;
      }
      if (!matches && (field === "all" || field === "id")) {
        matches = record.id.toLowerCase().indexOf(query) !== -1;
      }
      if (!matches && (field === "all" || field === "category")) {
        matches = record.category.toLowerCase().indexOf(query) !== -1;
      }

      if (matches) {
        return record;
      }
    }
    return null;
  }

  function bubbleSort(records, field) {
    var sortedRecords = [];
    for (var copyIndex = 0; copyIndex < records.length; copyIndex += 1) {
      sortedRecords[copyIndex] = records[copyIndex];
    }

    for (var end = sortedRecords.length - 1; end > 0; end -= 1) {
      var swapped = false;
      for (var index = 0; index < end; index += 1) {
        var left = valueForField(sortedRecords[index], field).toLowerCase();
        var right = valueForField(sortedRecords[index + 1], field).toLowerCase();
        if (left > right) {
          var temporary = sortedRecords[index];
          sortedRecords[index] = sortedRecords[index + 1];
          sortedRecords[index + 1] = temporary;
          swapped = true;
        }
      }
      if (!swapped) {
        break;
      }
    }
    return sortedRecords;
  }

  window.EquipmentAlgorithms = {
    linearSearch: linearSearch,
    bubbleSort: bubbleSort
  };
}());
