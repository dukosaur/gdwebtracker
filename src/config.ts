/**
 * Configuration for the Google Sheets backend.
 * Everything is automatically configured and directly integrated!
 */
export const GOOGLE_SHEET_CONFIG = {
  // Google Spreadsheet ID
  sheetId: '1mT8nuuo76m6aIRQBzUrtxue4HXsgQMZH-e1FbgoHUyg',

  // Exact GIDs for the 3 tabs
  tabs: {
    ashritGid: '0',           // ashriiiiiiiiiiiiiiit
    arshGid: '1541242599',     // mahmoud arsh I'm sorry
    sharedGid: '1195648140',   // fun googogoaaaagga
  },

  // Google Apps Script Web App URL (for 2-way write push)
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbya58wkoH4hup_QFuFpjEqLKTGDVKOPW1-5S89c9T48pKNzPGI7WQoWw1f1NmfbPb9ZPA/exec',
};
