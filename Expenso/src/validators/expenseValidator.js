const { CATEGORIES } = require('../config/categories');
const { isValidDate, todayIsoLocal } = require('../utils/dateUtils');

function normalizeExpensePayload(body = {}) {
  const errors = {};
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const amount = Number(body.amount);
  const category = typeof body.category === 'string' ? body.category.trim() : '';
  const date = typeof body.date === 'string' && body.date.trim() ? body.date.trim() : todayIsoLocal();
  const note = typeof body.note === 'string' && body.note.trim() ? body.note.trim() : null;
  const receiptImage = typeof body.receipt_image === 'string' && body.receipt_image.trim() ? body.receipt_image.trim() : null;
  const scannedText = typeof body.scanned_text === 'string' && body.scanned_text.trim() ? body.scanned_text.trim() : null;

  if (!title) {
    errors.title = 'Title is required.';
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than 0.';
  }

  if (!CATEGORIES.includes(category)) {
    errors.category = 'Choose a valid category.';
  }

  if (!isValidDate(date)) {
    errors.date = 'Use a valid date in YYYY-MM-DD format.';
  }

  if (receiptImage && !/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(receiptImage)) {
    errors.receipt_image = 'Receipt must be a JPG, PNG, or WebP image.';
  }

  if (receiptImage && receiptImage.length > 1_600_000) {
    errors.receipt_image = 'Receipt image is too large. Please choose a smaller image.';
  }

  if (scannedText && scannedText.length > 20000) {
    errors.scanned_text = 'Scanned text is too long.';
  }

  return {
    data: { title, amount, category, date, note, receipt_image: receiptImage, scanned_text: scannedText },
    errors
  };
}

function normalizeExpenseFilters(query = {}) {
  const errors = {};
  const filters = {
    category: typeof query.category === 'string' ? query.category.trim() : '',
    from: typeof query.from === 'string' ? query.from.trim() : '',
    to: typeof query.to === 'string' ? query.to.trim() : '',
    title: typeof query.title === 'string' ? query.title.trim() : ''
  };

  if (filters.category && !CATEGORIES.includes(filters.category)) {
    errors.category = 'Choose a valid category.';
  }

  if (filters.from && !isValidDate(filters.from)) {
    errors.from = 'Use a valid from date.';
  }

  if (filters.to && !isValidDate(filters.to)) {
    errors.to = 'Use a valid to date.';
  }

  if (filters.from && filters.to && filters.from > filters.to) {
    errors.range = 'From date cannot be after to date.';
  }

  return { filters, errors };
}

function parseExpenseId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return {
      id: null,
      errors: { id: 'Expense id must be a positive integer.' }
    };
  }

  return { id, errors: {} };
}

module.exports = {
  normalizeExpenseFilters,
  normalizeExpensePayload,
  parseExpenseId
};
