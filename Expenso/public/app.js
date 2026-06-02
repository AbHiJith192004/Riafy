const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];
const CATEGORY_COLORS = {
  Food: '#E8956D',
  Transport: '#6B9FD4',
  Shopping: '#C47EB5',
  Bills: '#D4826A',
  Entertainment: '#8B7EC8',
  Other: '#9CAF88'
};

const CATEGORY_ICONS = {
  Food: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3v8M11 3v8M7 7h4M9 11v10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 4c2.2 1.2 3.2 3.2 3.2 6.1 0 2.7-1.1 4.8-3.2 5.8V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  Transport: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 11h14l-1.2-4.2A3 3 0 0 0 14.9 5H9.1a3 3 0 0 0-2.9 1.8L5 11Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M5 11v6h14v-6M7.5 17v2M16.5 17v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 14h.1M16 14h.1" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  Shopping: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 8h12l-1 13H7L6 8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8a3 3 0 0 1 6 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  Bills: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h10v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2V3Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9.5 8H15M9.5 12H15M9.5 16h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  Entertainment: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 8h10a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 11v4M6 13h4M16 12h.1M18 15h.1" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
  Other: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5h6v6H5V5ZM13 5h6v6h-6V5ZM5 13h6v6H5v-6ZM13 13h6v6h-6v-6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'
};

const state = {
  expenses: [],
  activeFilters: {},
  editingId: null,
  pendingDeleteId: null,
  filterTimer: null,
  receiptImage: null,
  receiptName: '',
  tourStep: 0
};

const TOUR_STEPS = [
  {
    title: 'Welcome to Expenso',
    text: 'Track daily spending, save receipts, and review the month from one warm little wallet.'
  },
  {
    title: 'Add an entry',
    text: 'Write a title, amount, date, category, and an optional note whenever money moves.'
  },
  {
    title: 'Attach bills',
    text: 'Use your camera or upload a bill image, then keep the receipt with that entry.'
  },
  {
    title: 'Review your month',
    text: 'The wallet card and category bars update after every add, edit, or delete.'
  }
];

const els = {
  currentDate: document.querySelector('#currentDate'),
  summaryTitle: document.querySelector('#summaryTitle'),
  summaryYear: document.querySelector('#summaryYear'),
  summaryTotal: document.querySelector('#summaryTotal'),
  summaryBreakdown: document.querySelector('#summaryBreakdown'),
  formCard: document.querySelector('#formCard'),
  formTitle: document.querySelector('#formTitle'),
  expenseForm: document.querySelector('#expenseForm'),
  categoryInput: document.querySelector('#category'),
  categoryPills: document.querySelector('#categoryPills'),
  receiptInput: document.querySelector('#receiptImage'),
  receiptPreview: document.querySelector('#receiptPreview'),
  submitButton: document.querySelector('#submitButton'),
  cancelEditButton: document.querySelector('#cancelEditButton'),
  filtersForm: document.querySelector('#filtersForm'),
  filterCategoryInput: document.querySelector('#filterCategory'),
  filterCategoryPills: document.querySelector('#filterCategoryPills'),
  filterToggle: document.querySelector('#filterToggle'),
  filterHint: document.querySelector('#filterHint'),
  clearFiltersButton: document.querySelector('#clearFiltersButton'),
  expenseList: document.querySelector('#expenseList'),
  expenseCount: document.querySelector('#expenseCount'),
  toastRoot: document.querySelector('#toastRoot'),
  tourOverlay: document.querySelector('#tourOverlay'),
  tourStepCount: document.querySelector('#tourStepCount'),
  tourTitle: document.querySelector('#tourTitle'),
  tourText: document.querySelector('#tourText'),
  tourSkip: document.querySelector('#tourSkip'),
  tourNext: document.querySelector('#tourNext')
};

const formatCurrency = (value) => Number(value || 0).toLocaleString('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const formatDate = (value) => {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
};

const todayIso = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const categoryClass = (category) => `cat-${category.toLowerCase().replace(/\s+/g, '-')}`;

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || 'Something went wrong. Please try again.';
    const error = new Error(message);
    error.details = data.details || {};
    throw error;
  }

  return data;
}

function buildQuery(filters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : '';
}

async function fetchExpenses(filters = {}) {
  const data = await requestJson(`/api/expenses${buildQuery(filters)}`);
  state.expenses = data.expenses;
  return data.expenses;
}

async function fetchSummary() {
  return requestJson('/api/summary');
}

async function addExpense(data) {
  return requestJson('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

async function updateExpense(id, data) {
  return requestJson(`/api/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

async function deleteExpense(id) {
  return requestJson(`/api/expenses/${id}`, {
    method: 'DELETE'
  });
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1200;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.76));
      };
      image.onerror = () => reject(new Error('Could not read that image.'));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });
}

function renderReceiptPreview() {
  if (!state.receiptImage) {
    els.receiptPreview.classList.add('is-hidden');
    els.receiptPreview.innerHTML = '';
    return;
  }

  els.receiptPreview.classList.remove('is-hidden');
  els.receiptPreview.innerHTML = `
    <img src="${state.receiptImage}" alt="Selected bill preview" />
    <span title="${escapeHtml(state.receiptName || 'Attached bill')}">${escapeHtml(state.receiptName || 'Attached bill')}</span>
    <button class="receipt-remove" type="button" data-action="remove-receipt">Remove</button>
  `;
}

function clearReceipt() {
  state.receiptImage = null;
  state.receiptName = '';
  els.receiptInput.value = '';
  renderReceiptPreview();
}

function renderCategoryPills(container, selectedValue = '', mode = 'form') {
  container.innerHTML = CATEGORIES.map((category) => {
    const selected = selectedValue === category;
    const action = mode === 'filter' ? 'filter-category' : 'form-category';

    return `
      <button
        class="category-pill ${categoryClass(category)} ${selected ? 'is-selected' : ''}"
        style="--category-color: ${CATEGORY_COLORS[category]}"
        type="button"
        role="radio"
        aria-checked="${selected}"
        data-action="${action}"
        data-category="${category}"
      >
        <span class="category-icon" aria-hidden="true">${CATEGORY_ICONS[category]}</span>
        ${escapeHtml(category)}
      </button>
    `;
  }).join('');
}

function setFormCategory(category) {
  els.categoryInput.value = category;
  renderCategoryPills(els.categoryPills, category, 'form');
}

function setFilterCategory(category) {
  const nextValue = els.filterCategoryInput.value === category ? '' : category;
  els.filterCategoryInput.value = nextValue;
  renderCategoryPills(els.filterCategoryPills, nextValue, 'filter');
  updateClearFiltersVisibility();
}

function iconSvg(name) {
  const icons = {
    edit: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20h9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8 6V4h8v2m-9 0 1 15h8l1-15" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 11v6m4-6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  return icons[name] || '';
}

function emptyIllustration() {
  return `
    <svg viewBox="0 0 180 130" role="img" aria-label="Empty receipt illustration">
      <path d="M55 21h70c6 0 10 4 10 10v78l-10-6-10 6-10-6-10 6-10-6-10 6-10-6-10 6V31c0-6 4-10 10-10Z" fill="#FFFDF7" stroke="#D97757" stroke-width="3" stroke-linejoin="round"/>
      <path d="M72 47h36M72 65h28M72 83h42" stroke="#A8A29E" stroke-width="4" stroke-linecap="round"/>
      <path d="M44 112c25 8 67 8 92 0" stroke="#E5DDD0" stroke-width="5" stroke-linecap="round"/>
    </svg>
  `;
}

function renderExpenseList(expenses) {
  els.expenseCount.textContent = `${expenses.length} ${expenses.length === 1 ? 'entry' : 'entries'}`;

  if (!expenses.length) {
    const hasFilters = Object.values(state.activeFilters).some(Boolean);
    els.expenseList.innerHTML = `
      <div class="empty-state">
        ${emptyIllustration()}
        <h3>Nothing here yet</h3>
        <p>${hasFilters ? 'No entries match this little search trail.' : 'Add your first entry using the form.'}</p>
      </div>
    `;
    return;
  }

  els.expenseList.innerHTML = expenses.map((expense) => {
    const color = CATEGORY_COLORS[expense.category];
    const note = expense.note ? escapeHtml(expense.note) : 'No note added';
    const isConfirming = state.pendingDeleteId === expense.id;

    return `
      <article class="expense-card ${categoryClass(expense.category)}" style="--category-color: ${color}; max-height: 180px;" data-id="${expense.id}">
        <span class="category-bar" aria-hidden="true"></span>
        <div class="expense-copy">
          <span class="expense-title" title="${escapeHtml(expense.title)}">${escapeHtml(expense.title)}</span>
          <span class="expense-note" title="${note}">${note}</span>
          <span class="category-badge">
            <span class="category-icon" aria-hidden="true">${CATEGORY_ICONS[expense.category]}</span>
            ${escapeHtml(expense.category)}
          </span>
          ${expense.receipt_image ? `
            <button class="receipt-thumb" type="button" data-action="view-receipt" data-id="${expense.id}">
              <img src="${expense.receipt_image}" alt="" />
              Bill saved
            </button>
          ` : ''}
        </div>
        <div class="expense-side">
          <span class="expense-amount">${formatCurrency(expense.amount)}</span>
          <time class="expense-date" datetime="${expense.date}">${formatDate(expense.date)}</time>
          <div class="expense-actions">
            <button class="icon-btn" type="button" title="Edit entry" aria-label="Edit ${escapeHtml(expense.title)}" data-action="edit" data-id="${expense.id}">
              ${iconSvg('edit')}
            </button>
            <button class="icon-btn ${isConfirming ? 'is-confirming' : ''}" type="button" title="${isConfirming ? 'Confirm delete' : 'Delete entry'}" aria-label="${isConfirming ? 'Confirm delete' : 'Delete'} ${escapeHtml(expense.title)}" data-action="delete" data-id="${expense.id}">
              ${isConfirming ? 'Sure?' : iconSvg('trash')}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderSummary(data) {
  const [monthName, year] = data.monthLabel.split(' ');
  els.summaryTitle.textContent = monthName;
  els.summaryYear.textContent = year;
  els.summaryTotal.textContent = formatCurrency(data.total);

  const activeItems = data.breakdown.filter((item) => item.amount > 0);

  if (!activeItems.length) {
    els.summaryBreakdown.innerHTML = '<div class="empty-summary">Nothing logged yet ✎</div>';
    return;
  }

  els.summaryBreakdown.innerHTML = activeItems.map((item) => `
    <div class="summary-item ${categoryClass(item.category)}" style="--category-color: ${CATEGORY_COLORS[item.category]}">
      <div class="summary-row">
        <span class="category-label">
          <span class="summary-icon" aria-hidden="true">${CATEGORY_ICONS[item.category]}</span>
          <span>${escapeHtml(item.category)}</span>
        </span>
        <span class="summary-amount">${formatCurrency(item.amount)}</span>
      </div>
      <div class="summary-bar" aria-hidden="true">
        <span style="width: ${Math.max(item.percentage, 3)}%"></span>
      </div>
    </div>
  `).join('');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<p>${escapeHtml(message)}</p>`;
  els.toastRoot.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    window.setTimeout(() => toast.remove(), 200);
  }, 3000);
}

function enterEditMode(expense) {
  state.editingId = expense.id;
  els.formTitle.textContent = 'Update Entry';
  els.submitButton.textContent = 'Update Entry';
  els.cancelEditButton.classList.remove('is-hidden');
  els.formCard.classList.add('is-editing', 'is-highlighted');

  els.expenseForm.elements.title.value = expense.title;
  els.expenseForm.elements.amount.value = expense.amount;
  setFormCategory(expense.category);
  els.expenseForm.elements.date.value = expense.date;
  els.expenseForm.elements.note.value = expense.note || '';
  state.receiptImage = expense.receipt_image || null;
  state.receiptName = expense.receipt_image ? 'Saved bill image' : '';
  renderReceiptPreview();

  clearFormErrors();
  els.formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => els.formCard.classList.remove('is-highlighted'), 850);
}

function exitEditMode() {
  state.editingId = null;
  els.formTitle.textContent = 'Add Entry';
  els.submitButton.textContent = 'Add Entry';
  els.cancelEditButton.classList.add('is-hidden');
  els.formCard.classList.remove('is-editing', 'is-highlighted');
  els.expenseForm.reset();
  els.expenseForm.elements.date.value = todayIso();
  setFormCategory('');
  clearReceipt();
  clearFormErrors();
}

function validateForm() {
  const form = els.expenseForm.elements;
  const errors = {};
  const amount = Number(form.amount.value);

  if (!form.title.value.trim()) {
    errors.title = 'Title is required.';
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than 0.';
  }

  if (!CATEGORIES.includes(form.category.value)) {
    errors.category = 'Choose a category.';
  }

  if (!form.date.value) {
    errors.date = 'Choose a date.';
  }

  return errors;
}

function getFormData() {
  const form = els.expenseForm.elements;
  return {
    title: form.title.value.trim(),
    amount: Number(form.amount.value),
    category: form.category.value,
    date: form.date.value || todayIso(),
    note: form.note.value.trim(),
    receipt_image: state.receiptImage
  };
}

function renderFormErrors(errors) {
  clearFormErrors();

  Object.entries(errors).forEach(([field, message]) => {
    const control = els.expenseForm.elements[field];
    const errorEl = document.querySelector(`[data-error-for="${field}"]`);
    if (control) {
      control.closest('.field').classList.add('is-invalid');
    }
    if (errorEl) {
      errorEl.textContent = message;
    }
  });
}

function clearFormErrors() {
  document.querySelectorAll('.field.is-invalid').forEach((field) => field.classList.remove('is-invalid'));
  document.querySelectorAll('[data-error-for]').forEach((errorEl) => {
    errorEl.textContent = '';
  });
}

function getFilterData() {
  const form = els.filtersForm.elements;
  return {
    category: form.category.value,
    from: form.from.value,
    to: form.to.value,
    title: form.title.value.trim()
  };
}

function setFilterHint(message = '') {
  els.filterHint.textContent = message;
}

function updateClearFiltersVisibility() {
  const hasFilters = Object.values(getFilterData()).some(Boolean);
  els.clearFiltersButton.classList.toggle('is-hidden', !hasFilters);
}

async function applyFiltersFromForm() {
  const filters = getFilterData();

  if (filters.from && filters.to && filters.from > filters.to) {
    setFilterHint('From date cannot be after to date.');
    showToast('Check the date range.', 'error');
    return;
  }

  setFilterHint('');
  state.activeFilters = filters;
  updateClearFiltersVisibility();
  await refreshAll();
}

function queueFilterApply() {
  window.clearTimeout(state.filterTimer);
  state.filterTimer = window.setTimeout(() => {
    applyFiltersFromForm();
  }, 250);
}

async function refreshAll() {
  try {
    const [expenses, summary] = await Promise.all([
      fetchExpenses(state.activeFilters),
      fetchSummary()
    ]);
    renderExpenseList(expenses);
    renderSummary(summary);
  } catch (error) {
    showToast(error.message || 'Could not connect to the server.', 'error');
  }
}

function setSubmitLoading(isLoading) {
  els.submitButton.disabled = isLoading;
  if (isLoading) {
    els.submitButton.textContent = state.editingId ? 'Updating...' : 'Adding...';
    return;
  }
  els.submitButton.textContent = state.editingId ? 'Update Entry' : 'Add Entry';
}

function completeTour() {
  localStorage.setItem('expensoTourSeen', 'true');
  els.tourOverlay.classList.add('is-hidden');
}

function renderTourStep() {
  const step = TOUR_STEPS[state.tourStep];
  els.tourStepCount.textContent = `${state.tourStep + 1} of ${TOUR_STEPS.length}`;
  els.tourTitle.textContent = step.title;
  els.tourText.textContent = step.text;
  els.tourNext.textContent = state.tourStep === TOUR_STEPS.length - 1 ? 'Start tracking' : 'Next';
}

function maybeShowTour() {
  if (localStorage.getItem('expensoTourSeen') === 'true') {
    return;
  }

  state.tourStep = 0;
  renderTourStep();
  els.tourOverlay.classList.remove('is-hidden');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

els.categoryPills.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="form-category"]');
  if (!button) {
    return;
  }

  setFormCategory(button.dataset.category);
  clearFormErrors();
});

els.receiptInput.addEventListener('change', async () => {
  const [file] = els.receiptInput.files;
  if (!file) {
    return;
  }

  try {
    state.receiptImage = await compressImage(file);
    state.receiptName = file.name;
    renderReceiptPreview();
    showToast('Bill image attached.', 'success');
  } catch (error) {
    clearReceipt();
    showToast(error.message || 'Could not attach image.', 'error');
  }
});

els.receiptPreview.addEventListener('click', (event) => {
  if (event.target.closest('[data-action="remove-receipt"]')) {
    clearReceipt();
    showToast('Bill image removed.', 'info');
  }
});

els.filterCategoryPills.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action="filter-category"]');
  if (!button) {
    return;
  }

  setFilterCategory(button.dataset.category);
  state.activeFilters = getFilterData();
  setFilterHint('');
  await refreshAll();
});

els.expenseForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const errors = validateForm();
  if (Object.keys(errors).length) {
    renderFormErrors(errors);
    showToast('A few details need attention.', 'error');
    return;
  }

  const payload = getFormData();
  setSubmitLoading(true);

  try {
    if (state.editingId) {
      await updateExpense(state.editingId, payload);
      showToast('Entry updated.', 'success');
      exitEditMode();
    } else {
      await addExpense(payload);
      showToast('Entry added.', 'success');
      els.expenseForm.reset();
      els.expenseForm.elements.date.value = todayIso();
      setFormCategory('');
      clearReceipt();
      els.formCard.classList.add('is-success');
      window.setTimeout(() => els.formCard.classList.remove('is-success'), 550);
    }

    await refreshAll();
  } catch (error) {
    if (error.details && Object.keys(error.details).length) {
      renderFormErrors(error.details);
    }
    showToast(error.message || 'Unable to save entry.', 'error');
  } finally {
    setSubmitLoading(false);
  }
});

els.cancelEditButton.addEventListener('click', () => {
  exitEditMode();
  showToast('Edit cancelled.', 'info');
});

els.filtersForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await applyFiltersFromForm();
});

els.filtersForm.addEventListener('input', (event) => {
  if (event.target.matches('#filterTitle')) {
    updateClearFiltersVisibility();
    queueFilterApply();
  }
});

els.filtersForm.addEventListener('change', (event) => {
  if (event.target.matches('#filterFrom, #filterTo')) {
    updateClearFiltersVisibility();
    queueFilterApply();
  } else {
    updateClearFiltersVisibility();
  }
});

els.clearFiltersButton.addEventListener('click', async () => {
  els.filtersForm.reset();
  els.filterCategoryInput.value = '';
  renderCategoryPills(els.filterCategoryPills, '', 'filter');
  state.activeFilters = {};
  setFilterHint('');
  updateClearFiltersVisibility();
  await refreshAll();
});

els.filterToggle.addEventListener('click', () => {
  const isOpen = els.filtersForm.classList.toggle('is-open');
  els.filterToggle.setAttribute('aria-expanded', String(isOpen));
});

els.expenseList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const id = Number(button.dataset.id);
  const expense = state.expenses.find((item) => item.id === id);

  if (!expense) {
    showToast('Entry is no longer available.', 'error');
    await refreshAll();
    return;
  }

  if (action === 'edit') {
    state.pendingDeleteId = null;
    renderExpenseList(state.expenses);
    enterEditMode(expense);
    return;
  }

  if (action === 'view-receipt') {
    const image = expense.receipt_image;
    if (image) {
      const viewer = window.open('', '_blank', 'noopener,noreferrer');
      if (viewer) {
        viewer.document.write(`<title>Bill image</title><body style="margin:0;background:#10100f;display:grid;place-items:center;min-height:100vh;"><img src="${image}" alt="Bill image" style="max-width:96vw;max-height:96vh;border-radius:18px;"></body>`);
        viewer.document.close();
      }
    }
    return;
  }

  if (action === 'delete') {
    if (state.pendingDeleteId !== id) {
      state.pendingDeleteId = id;
      renderExpenseList(state.expenses);
      return;
    }

    const row = els.expenseList.querySelector(`[data-id="${id}"]`);
    if (row) {
      row.classList.add('is-removing');
      await new Promise((resolve) => window.setTimeout(resolve, 170));
    }

    try {
      await deleteExpense(id);
      state.pendingDeleteId = null;
      if (state.editingId === id) {
        exitEditMode();
      }
      showToast('Entry deleted.', 'success');
      await refreshAll();
    } catch (error) {
      showToast(error.message || 'Unable to delete entry.', 'error');
      await refreshAll();
    }
  }
});

els.tourSkip.addEventListener('click', completeTour);

els.tourNext.addEventListener('click', () => {
  if (state.tourStep >= TOUR_STEPS.length - 1) {
    completeTour();
    return;
  }

  state.tourStep += 1;
  renderTourStep();
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('[data-action="delete"]')) {
    if (state.pendingDeleteId !== null) {
      state.pendingDeleteId = null;
      renderExpenseList(state.expenses);
    }
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const now = new Date();
  els.currentDate.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    year: 'numeric'
  });
  els.currentDate.setAttribute('datetime', now.toISOString());
  els.expenseForm.elements.date.value = todayIso();
  renderCategoryPills(els.categoryPills, '', 'form');
  renderCategoryPills(els.filterCategoryPills, '', 'filter');
  renderReceiptPreview();
  updateClearFiltersVisibility();
  await refreshAll();
  maybeShowTour();
});
