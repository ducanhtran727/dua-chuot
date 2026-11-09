const SHEET_ID = 'DIEN_ID_GOOGLE_SHEET';
const TAB_NAME = 'Don hang';

function doPost(e) {
  const data = e && e.parameter;
  const name = (data?.name || '').trim();
  const phone = (data?.phone || '').trim();
  const address = (data?.address || '').trim();
  const note = (data?.note || '').trim();
  const quantity = Number(data?.quantity);

  if (!name || name.length > 100 || !/^(0|84|\+84)\d{9}$/.test(phone) ||
      !address || address.length > 300 || note.length > 500 ||
      !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
    return json({ ok: false });
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(TAB_NAME) || spreadsheet.insertSheet(TAB_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Thời gian', 'Họ và tên', 'Số điện thoại', 'Địa chỉ', 'Số gói', 'Ghi chú']);
    }
    // Force customer-provided values to remain text, including phone numbers.
    sheet.appendRow([new Date(), "'" + name, "'" + phone, "'" + address, quantity, "'" + note]);
    SpreadsheetApp.flush();
    return json({ ok: true });
  } catch {
    return json({ ok: false });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}

