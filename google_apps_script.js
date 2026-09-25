/**
 * ==============================================================================
 * GEOMETRY DASH LEVEL TRACKER - GOOGLE APPS SCRIPT BACKEND
 * ==============================================================================
 * 
 * Instructions to set up:
 * 1. Open your Google Sheet with the 3 tabs:
 *    - "ashriiiiiiiiiiiiiit"
 *    - "mahmoud arsh im sorry"
 *    - "fun googogoaaaagga"
 * 2. In Google Sheets top menu, click: Extensions > Apps Script
 * 3. Delete any existing code in the editor, and paste ALL of this code.
 * 4. Click the blue "Deploy" button (top right) > "New deployment".
 * 5. Click the gear icon next to "Select type" and choose "Web app".
 * 6. Set Description: "GD Web App Sync"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"  <-- CRITICAL for the website to read/write!
 * 9. Click "Deploy". Authorize permissions if prompted by Google.
 * 10. Copy the "Web app URL" (it ends with /exec) and paste it into the website's Sync modal!
 * ==============================================================================
 */

// Helper to find sheet by possible name variations
function getSheetByFuzzyName(ss, nameKeywords) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var sheetName = sheets[i].getName().toLowerCase().trim();
    for (var j = 0; j < nameKeywords.length; j++) {
      if (sheetName.indexOf(nameKeywords[j].toLowerCase()) !== -1) {
        return sheets[i];
      }
    }
  }
  return null;
}

/**
 * GET Handler: Fetches all levels from all 3 tabs as JSON
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Find sheets
    var ashritSheet = getSheetByFuzzyName(ss, ["ashriiiiiiiiiiiiiit", "ashrit"]);
    var arshSheet = getSheetByFuzzyName(ss, ["mahmoud arsh", "arsh"]);
    var sharedSheet = getSheetByFuzzyName(ss, ["fun googogoaaaagga", "fun", "googogo"]);
    
    var result = {
      status: "success",
      timestamp: new Date().toISOString(),
      data: {
        ashritLevels: ashritSheet ? parsePlayerSheet(ashritSheet, "ash") : [],
        arshLevels: arshSheet ? parsePlayerSheet(arshSheet, "arsh") : [],
        sharedLevels: sharedSheet ? parseSharedSheet(sharedSheet) : []
      }
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Parses individual player sheets (Demon Rating, Name, ID, Attempts, Date, Thoughts, Current Hardest)
 */
function parsePlayerSheet(sheet, prefix) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var levels = [];
  // Row 0 is header (or dropdown indicator), find the row starting with "Demon Rating"
  var startRow = 1;
  for (var r = 0; r < Math.min(data.length, 5); r++) {
    if (data[r][0] && data[r][0].toString().toLowerCase().indexOf("demon rating") !== -1) {
      startRow = r + 1;
      break;
    }
  }

  for (var i = startRow; i < data.length; i++) {
    var row = data[i];
    var name = (row[1] || "").toString().trim();
    if (!name) continue; // Skip completely empty rows
    
    var rating = (row[0] || "").toString().trim() || "Easy Demon";
    var levelId = (row[2] || "").toString().trim();
    var attempts = row[3] !== undefined && row[3] !== null ? row[3].toString().trim() : "";
    var dateVal = row[4];
    var dateStr = "";
    if (dateVal instanceof Date) {
      dateStr = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), "MM/dd/yyyy");
    } else {
      dateStr = (dateVal || "").toString().trim();
    }
    
    var thoughts = (row[5] || "").toString().trim();
    var hardestVal = row[6];
    var isHardest = hardestVal === true || hardestVal === "TRUE" || hardestVal === 1 || hardestVal === "checked";

    levels.push({
      id: prefix + "-" + (i - startRow + 1),
      demonRating: rating,
      name: name,
      levelId: levelId,
      attempts: attempts,
      date: dateStr,
      thoughts: thoughts,
      currentHardest: isHardest
    });
  }
  return levels;
}

/**
 * Parses shared tab (Rating, Name, ID, Level/Extra Info, thoughts after playing, ashrit, arsh)
 */
function parseSharedSheet(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  var levels = [];
  var startRow = 1;
  for (var r = 0; r < Math.min(data.length, 5); r++) {
    if (data[r][0] && (data[r][0].toString().toLowerCase().indexOf("rating") !== -1)) {
      startRow = r + 1;
      break;
    }
  }

  for (var i = startRow; i < data.length; i++) {
    var row = data[i];
    var name = (row[1] || "").toString().trim();
    if (!name) continue;
    
    var rating = (row[0] || "").toString().trim() || "Medium Demon";
    var levelId = (row[2] || "").toString().trim();
    var info = (row[3] || "").toString().trim();
    var thoughts = (row[4] || "").toString().trim();
    var ashritStatus = (row[5] || "").toString().trim().toLowerCase() || "not done";
    var arshStatus = (row[6] || "").toString().trim().toLowerCase() || "not done";

    levels.push({
      id: "shared-" + (i - startRow + 1),
      rating: rating,
      name: name,
      levelId: levelId,
      levelInfo: info,
      thoughts: thoughts,
      ashritStatus: ashritStatus,
      arshStatus: arshStatus
    });
  }
  return levels;
}

/**
 * POST Handler: Updates rows or adds new levels from the website directly into the Sheet
 */
function doPost(e) {
  try {
    var payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = payload.action;
    var tab = payload.tab; // 'ashrit' | 'arsh' | 'shared'
    
    var targetSheet;
    if (tab === "ashrit") {
      targetSheet = getSheetByFuzzyName(ss, ["ashriiiiiiiiiiiiiit", "ashrit"]);
    } else if (tab === "arsh") {
      targetSheet = getSheetByFuzzyName(ss, ["mahmoud arsh", "arsh"]);
    } else {
      targetSheet = getSheetByFuzzyName(ss, ["fun googogoaaaagga", "fun", "googogo"]);
    }

    if (!targetSheet) {
      throw new Error("Target sheet could not be found for tab: " + tab);
    }

    if (action === "updateRow") {
      updateLevelRow(targetSheet, tab, payload.row);
    } else if (action === "addRow") {
      appendLevelRow(targetSheet, tab, payload.row);
    } else if (action === "syncAll") {
      // Sync full data array
      syncFullTab(targetSheet, tab, payload.rows);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Sheet updated successfully",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Finds and updates a row by Level ID or Level Name
 */
function updateLevelRow(sheet, tab, rowData) {
  var data = sheet.getDataRange().getValues();
  var startRow = 1;
  for (var r = 0; r < Math.min(data.length, 5); r++) {
    if (data[r][0] && data[r][0].toString().toLowerCase().indexOf("rating") !== -1) {
      startRow = r + 1;
      break;
    }
  }

  var foundRowIdx = -1;
  for (var i = startRow; i < data.length; i++) {
    var rowName = (data[i][1] || "").toString().trim().toLowerCase();
    var rowId = (data[i][2] || "").toString().trim();
    if ((rowData.levelId && rowId === rowData.levelId.toString()) || 
        (rowName === (rowData.name || "").toLowerCase().trim())) {
      foundRowIdx = i + 1; // 1-indexed for Sheets
      break;
    }
  }

  if (foundRowIdx === -1) {
    // If not found, append it
    appendLevelRow(sheet, tab, rowData);
    return;
  }

  if (tab === "ashrit" || tab === "arsh") {
    sheet.getRange(foundRowIdx, 1).setValue(rowData.demonRating || "Easy Demon");
    sheet.getRange(foundRowIdx, 2).setValue(rowData.name);
    sheet.getRange(foundRowIdx, 3).setValue(rowData.levelId);
    sheet.getRange(foundRowIdx, 4).setValue(rowData.attempts !== undefined ? rowData.attempts : "");
    sheet.getRange(foundRowIdx, 5).setValue(rowData.date || "");
    sheet.getRange(foundRowIdx, 6).setValue(rowData.thoughts || "");
    sheet.getRange(foundRowIdx, 7).setValue(rowData.currentHardest === true);
  } else {
    // Shared tab
    sheet.getRange(foundRowIdx, 1).setValue(rowData.rating || "Medium Demon");
    sheet.getRange(foundRowIdx, 2).setValue(rowData.name);
    sheet.getRange(foundRowIdx, 3).setValue(rowData.levelId);
    sheet.getRange(foundRowIdx, 4).setValue(rowData.levelInfo || "W Speed");
    sheet.getRange(foundRowIdx, 5).setValue(rowData.thoughts || "");
    sheet.getRange(foundRowIdx, 6).setValue(rowData.ashritStatus || "not done");
    sheet.getRange(foundRowIdx, 7).setValue(rowData.arshStatus || "not done");
  }
}

/**
 * Appends a new level row
 */
function appendLevelRow(sheet, tab, rowData) {
  if (tab === "ashrit" || tab === "arsh") {
    sheet.appendRow([
      rowData.demonRating || "Easy Demon",
      rowData.name,
      rowData.levelId,
      rowData.attempts !== undefined ? rowData.attempts : "",
      rowData.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy"),
      rowData.thoughts || "",
      rowData.currentHardest === true
    ]);
  } else {
    sheet.appendRow([
      rowData.rating || "Medium Demon",
      rowData.name,
      rowData.levelId,
      rowData.levelInfo || "W Speed",
      rowData.thoughts || "",
      rowData.ashritStatus || "not done",
      rowData.arshStatus || "not done"
    ]);
  }
}

/**
 * Full tab sync
 */
function syncFullTab(sheet, tab, rows) {
  if (!rows || !rows.length) return;
  for (var i = 0; i < rows.length; i++) {
    updateLevelRow(sheet, tab, rows[i]);
  }
}
