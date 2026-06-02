const expenseRepository = require('../repositories/expenseRepository');
const logger = require('../utils/logger');
const { currentMonthInfo } = require('../utils/dateUtils');
const {
  normalizeExpenseFilters,
  normalizeExpensePayload,
  parseExpenseId
} = require('../validators/expenseValidator');

function sendValidationError(req, res, errors) {
  logger.warn('Validation failed', {
    method: req.method,
    path: req.originalUrl,
    errors
  });

  return res.status(400).json({
    error: 'Validation failed.',
    details: errors
  });
}

function listExpenses(req, res) {
  const { filters, errors } = normalizeExpenseFilters(req.query);

  if (Object.keys(errors).length) {
    return sendValidationError(req, res, errors);
  }

  const expenses = expenseRepository.findAll(filters);
  logger.info('Expenses fetched', {
    count: expenses.length,
    filters
  });

  return res.json({ expenses });
}

function createExpense(req, res) {
  const { data, errors } = normalizeExpensePayload(req.body);

  if (Object.keys(errors).length) {
    return sendValidationError(req, res, errors);
  }

  const expense = expenseRepository.create(data);
  logger.info('Expense created', {
    id: expense.id,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    hasReceipt: Boolean(expense.receipt_image)
  });

  return res.status(201).json({ expense });
}

function updateExpense(req, res) {
  const parsed = parseExpenseId(req.params.id);

  if (Object.keys(parsed.errors).length) {
    return sendValidationError(req, res, parsed.errors);
  }

  const existing = expenseRepository.findById(parsed.id);
  if (!existing) {
    logger.warn('Expense update missed', { id: parsed.id });
    return res.status(404).json({ error: 'Expense not found.' });
  }

  const { data, errors } = normalizeExpensePayload(req.body);
  if (Object.keys(errors).length) {
    return sendValidationError(req, res, errors);
  }

  const expense = expenseRepository.update(parsed.id, data);
  logger.info('Expense updated', {
    id: expense.id,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    hasReceipt: Boolean(expense.receipt_image)
  });

  return res.json({ expense });
}

function deleteExpense(req, res) {
  const parsed = parseExpenseId(req.params.id);

  if (Object.keys(parsed.errors).length) {
    return sendValidationError(req, res, parsed.errors);
  }

  const changes = expenseRepository.remove(parsed.id);
  if (changes === 0) {
    logger.warn('Expense delete missed', { id: parsed.id });
    return res.status(404).json({ error: 'Expense not found.' });
  }

  logger.info('Expense deleted', { id: parsed.id });
  return res.json({ success: true });
}

function getSummary(req, res) {
  const { month, monthLabel } = currentMonthInfo();
  const total = expenseRepository.currentMonthTotal(month);
  const breakdown = expenseRepository.currentMonthBreakdown(month, total);

  logger.info('Summary fetched', {
    month,
    total,
    activeCategories: breakdown.filter((item) => item.amount > 0).length
  });

  return res.json({
    month,
    monthLabel,
    total,
    breakdown
  });
}

module.exports = {
  createExpense,
  deleteExpense,
  getSummary,
  listExpenses,
  updateExpense
};
