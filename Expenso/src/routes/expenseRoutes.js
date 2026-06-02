const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

router.get('/expenses', asyncHandler(expenseController.listExpenses));
router.post('/expenses', asyncHandler(expenseController.createExpense));
router.put('/expenses/:id', asyncHandler(expenseController.updateExpense));
router.delete('/expenses/:id', asyncHandler(expenseController.deleteExpense));
router.get('/summary', asyncHandler(expenseController.getSummary));

module.exports = router;
