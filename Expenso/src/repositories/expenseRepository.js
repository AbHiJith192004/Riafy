const db = require('../db/database');
const { CATEGORIES } = require('../config/categories');

const expenseFields = 'id, title, amount, category, date, note, receipt_image, created_at';

function findAll(filters = {}) {
  const where = [];
  const params = {};

  if (filters.category) {
    where.push('category = @category');
    params.category = filters.category;
  }

  if (filters.from) {
    where.push('date >= @from');
    params.from = filters.from;
  }

  if (filters.to) {
    where.push('date <= @to');
    params.to = filters.to;
  }

  if (filters.title) {
    where.push('LOWER(title) LIKE LOWER(@title)');
    params.title = `%${filters.title}%`;
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  return db.prepare(`
    SELECT ${expenseFields}
    FROM expenses
    ${whereClause}
    ORDER BY date DESC, created_at DESC, id DESC
  `).all(params);
}

function findById(id) {
  return db.prepare(`
    SELECT ${expenseFields}
    FROM expenses
    WHERE id = ?
  `).get(id);
}

function create(data) {
  const result = db.prepare(`
    INSERT INTO expenses (title, amount, category, date, note, receipt_image)
    VALUES (@title, @amount, @category, @date, @note, @receipt_image)
  `).run(data);

  return findById(result.lastInsertRowid);
}

function update(id, data) {
  const result = db.prepare(`
    UPDATE expenses
    SET title = @title,
        amount = @amount,
        category = @category,
        date = @date,
        note = @note,
        receipt_image = @receipt_image
    WHERE id = @id
  `).run({ ...data, id });

  return result.changes > 0 ? findById(id) : null;
}

function remove(id) {
  return db.prepare('DELETE FROM expenses WHERE id = ?').run(id).changes;
}

function currentMonthTotal(month) {
  const row = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM expenses
    WHERE substr(date, 1, 7) = ?
  `).get(month);

  return Number(row.total || 0);
}

function currentMonthBreakdown(month, total) {
  const rows = db.prepare(`
    SELECT category, COALESCE(SUM(amount), 0) AS amount, COUNT(*) AS count
    FROM expenses
    WHERE substr(date, 1, 7) = ?
    GROUP BY category
  `).all(month);

  const rowMap = new Map(rows.map((row) => [row.category, row]));

  return CATEGORIES.map((category) => {
    const row = rowMap.get(category);
    const amount = row ? Number(row.amount) : 0;

    return {
      category,
      amount,
      count: row ? row.count : 0,
      percentage: total > 0 ? (amount / total) * 100 : 0
    };
  });
}

module.exports = {
  create,
  currentMonthBreakdown,
  currentMonthTotal,
  findAll,
  findById,
  remove,
  update
};
