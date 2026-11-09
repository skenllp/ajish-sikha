/**
 * Ajish & Sikha — RSVP → Google Sheet
 *
 * Setup:
 * 1. Create a Google Sheet (any name, e.g. "Ajish & Sikha RSVPs").
 * 2. In the sheet: Extensions → Apps Script. Delete the sample code and paste this whole file.
 * 3. Click Deploy → New deployment → type "Web app".
 *      Execute as:      Me
 *      Who has access:  Anyone
 *    Click Deploy and approve the permission prompts.
 * 4. Copy the Web app URL (ends in /exec) and paste it into js/config.js → rsvp.endpoint.
 * 5. If you edit this script later, use Deploy → Manage deployments → Edit → New version.
 */

var SHEET_NAME = "RSVPs";
var HEADERS = ["Submitted (IST)", "Reference", "Name", "First name", "Last name", "Email", "Response", "Guests", "Message"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Honeypot: real guests never fill this hidden field
    if (d._gotcha) return json_({ result: "success" });

    if (!d.firstName || !d.lastName) return json_({ result: "error", message: "Name is required" });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#f3e3d3");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      Utilities.formatDate(new Date(), "Asia/Kolkata", "dd MMM yyyy, hh:mm a"),
      clean_(d.reference),
      clean_(d.name),
      clean_(d.firstName),
      clean_(d.lastName),
      clean_(d.email),
      clean_(d.attending),
      Number(d.guests) || 0,
      clean_(d.message)
    ]);
    return json_({ result: "success" });
  } catch (err) {
    return json_({ result: "error", message: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

// Opening the Web app URL in a browser shows this, so you can check the deployment works.
function doGet() {
  return json_({ result: "ok", message: "RSVP endpoint is live" });
}

// Stops a guest's text from being run as a spreadsheet formula (=, +, -, @).
function clean_(v) {
  var s = String(v == null ? "" : v).trim().slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
