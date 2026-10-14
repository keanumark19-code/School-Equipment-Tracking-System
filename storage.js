(function () {
  "use strict";

  var TABLE_NAME = "equipment";
  var LEGACY_STORAGE_KEY = "schoolEquipmentRecords";
  var realtimeChannel = null;

  function getClient() {
    if (!window.AdminAuth || typeof window.AdminAuth.getClient !== "function") {
      throw new Error("Supabase authentication is not initialized.");
    }
    return window.AdminAuth.getClient();
  }

  function throwDatabaseError(error, operation) {
    if (error.code === "23505") {
      throw new Error("An equipment record with this ID already exists.");
    }
    if (error.code === "42501") {
      throw new Error("Supabase denied access to equipment records. Check the equipment table RLS policies and administrator email.");
    }
    if (error.code === "PGRST205" || error.code === "PGRST204" ||
        error.code === "42P01" || error.code === "42703" ||
        error.code === "22P02") {
      throw new Error("The Supabase equipment table is not set up yet. Run the SQL setup in supabase/equipment.sql.");
    }
    throw new Error("Unable to " + operation + " equipment records: " + error.message);
  }

  function fromDatabaseRow(row) {
    return {
      id: row.id,
      name: row.name,
      model: row.model,
      serialNumber: row.serial_number,
      purchaseDate: row.purchase_date,
      location: row.location,
      category: row.category,
      condition: row.condition,
      status: row.status
    };
  }

  function toDatabaseRow(record) {
    return {
      id: record.id.trim(),
      name: record.name.trim(),
      model: record.model.trim(),
      serial_number: record.serialNumber.trim(),
      purchase_date: record.purchaseDate,
      location: record.location.trim(),
      category: record.category.trim(),
      condition: record.condition.trim(),
      status: record.status
    };
  }

  async function getAll() {
    var result = await getClient()
      .from(TABLE_NAME)
      .select("id,name,model,serial_number,purchase_date,location,category,condition,status")
      .order("created_at", { ascending: true });

    if (result.error) {
      throwDatabaseError(result.error, "load");
    }
    return result.data.map(fromDatabaseRow);
  }

  async function add(record) {
    var existingRecords = await getAll();
    var normalizedId = record.id.trim().toUpperCase();
    for (var index = 0; index < existingRecords.length; index += 1) {
      if (existingRecords[index].id.trim().toUpperCase() === normalizedId) {
        throw new Error("An equipment record with this ID already exists.");
      }
    }

    var result = await getClient()
      .from(TABLE_NAME)
      .insert(toDatabaseRow(record))
      .select("id,name,model,serial_number,purchase_date,location,category,condition,status")
      .single();

    if (result.error) {
      throwDatabaseError(result.error, "save");
    }
    return fromDatabaseRow(result.data);
  }

  function readLegacyRecords() {
    var storedRecords;
    try {
      storedRecords = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!storedRecords) {
        return [];
      }
      var records = JSON.parse(storedRecords);
      if (!Array.isArray(records)) {
        throw new Error("Saved equipment data is not a list.");
      }
      return records;
    } catch (error) {
      throw new Error("Unable to read this browser's previous equipment records: " + error.message);
    }
  }

  async function importLegacyRecords() {
    var records = readLegacyRecords();
    if (records.length === 0) {
      return { attempted: 0 };
    }

    var rows = [];
    for (var index = 0; index < records.length; index += 1) {
      var record = records[index];
      if (!record || !record.id || !record.name || !record.model ||
          !record.serialNumber || !record.purchaseDate || !record.location ||
          !record.category || !record.condition || !record.status) {
        throw new Error("The browser's saved records contain an incomplete record and were not imported.");
      }
      rows.push(toDatabaseRow(record));
    }

    var result = await getClient()
      .from(TABLE_NAME)
      .upsert(rows, { onConflict: "id", ignoreDuplicates: true });
    if (result.error) {
      throwDatabaseError(result.error, "import");
    }
    return { attempted: rows.length };
  }

  function subscribe(onChange, onError, onStatus) {
    var client = getClient();
    if (realtimeChannel) {
      client.removeChannel(realtimeChannel);
    }

    realtimeChannel = client
      .channel("school-equipment-records")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: TABLE_NAME
      }, function () {
        onChange();
      })
      .subscribe(function (status, error) {
        if (onStatus) {
          onStatus(status);
        }
        if ((status === "CHANNEL_ERROR" || status === "TIMED_OUT") && onError) {
          onError(error || new Error("Realtime connection is unavailable."));
        }
      });
    return realtimeChannel;
  }

  window.EquipmentStorage = {
    getAll: getAll,
    add: add,
    importLegacyRecords: importLegacyRecords,
    subscribe: subscribe
  };
}());
