(function () {
  "use strict";

  var records = [];
  var initialization = null;
  var recordListeners = [];
  var realtimeAvailable = false;
  var refreshInProgress = false;

  function setState(text, type) {
    var state = document.getElementById("equipment-state");
    if (!state) {
      return;
    }
    state.textContent = text;
    state.className = "message" + (type ? " message-" + type : "");
    state.hidden = !text;
  }

  function notifyListeners() {
    for (var index = 0; index < recordListeners.length; index += 1) {
      recordListeners[index](records);
    }
  }

  function updateSummary() {
    var categoryNames = [];
    var availableCount = 0;
    var otherStatusCount = 0;

    for (var index = 0; index < records.length; index += 1) {
      var record = records[index];
      var categorySeen = false;
      for (var categoryIndex = 0; categoryIndex < categoryNames.length; categoryIndex += 1) {
        if (categoryNames[categoryIndex] === record.category) {
          categorySeen = true;
          break;
        }
      }
      if (!categorySeen) {
        categoryNames[categoryNames.length] = record.category;
      }
      if (record.status === "Available") {
        availableCount += 1;
      } else {
        otherStatusCount += 1;
      }
    }

    setText("summary-total", String(records.length));
    setText("summary-categories", String(categoryNames.length));
    setText("summary-available", String(availableCount));
    setText("summary-other-statuses", String(otherStatusCount));
  }

  function setText(id, text) {
    var element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  async function reloadRecords() {
    if (refreshInProgress) {
      return;
    }
    refreshInProgress = true;
    try {
      records = await window.EquipmentStorage.getAll();
      updateSummary();
      notifyListeners();
      if (realtimeAvailable) {
        setState("", "");
      }
    } catch (error) {
      setState(error.message, "not-found");
    } finally {
      refreshInProgress = false;
    }
  }

  function initialize() {
    if (initialization) {
      return initialization;
    }

    setState("Loading equipment records from Supabase…", "");
    initialization = (async function () {
      var user = await window.AdminAuth.getCurrentAdmin();
      if (!user) {
        throw new Error("Your administrator session has expired. Please sign in again.");
      }

      records = await window.EquipmentStorage.getAll();
      updateSummary();
      notifyListeners();
      setState("", "");

      try {
        window.EquipmentStorage.subscribe(function () {
          reloadRecords();
        }, function () {
          realtimeAvailable = false;
          setState("Live updates are unavailable. The current records loaded successfully; refresh this page to check for newer records.", "not-found");
        }, function (status) {
          if (status === "SUBSCRIBED") {
            realtimeAvailable = true;
            reloadRecords();
          }
        });
      } catch (error) {
        realtimeAvailable = false;
        setState("Live updates could not be started. The current records loaded successfully; refresh this page to check for newer records.", "not-found");
      }
      return records;
    }()).catch(function (error) {
      setState(error.message || "Unable to load equipment records.", "not-found");
      throw error;
    });
    return initialization;
  }

  initialize().catch(function () {
    // The page-level state displays the failure; no local records are substituted.
  });

  window.EquipmentApp = {
    initialize: initialize,
    getRecords: function () {
      return records;
    },
    onRecordsChange: function (listener) {
      recordListeners.push(listener);
    },
    refresh: reloadRecords,
    hasRealtime: function () {
      return realtimeAvailable;
    },
    setState: setState
  };
}());
