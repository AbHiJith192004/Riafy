const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'];
const CATEGORY_COLORS = {
  Food: '#35D98B',
  Transport: '#39A8C8',
  Shopping: '#68BD75',
  Bills: '#29966C',
  Entertainment: '#6A8FD8',
  Other: '#8FA58A'
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
  scannedText: '',
  ocrSuggestions: {},
  ocrLoading: false,
  loadingStartedAt: Date.now(),
  entryPanelLastFocus: null,
  tourLastFocus: null,
  tourStep: 0
};

const TOUR_STEPS = [
  {
    target: '.summary-card',
    title: 'Monthly summary',
    text: 'This wallet card shows how much you spent this month and which categories are taking the most space.'
  },
  {
    target: '#addEntryButton',
    title: 'Add an entry',
    text: 'Tap this plus button whenever you want to record money that has already been spent.'
  },
  {
    target: '#title',
    openEntryPanel: true,
    title: 'Fill the entry panel',
    text: 'Add the title, amount, category, date, and note inside this panel. Future dates are blocked to keep expenses honest.'
  },
  {
    target: '.receipt-picker',
    openEntryPanel: true,
    title: 'Save bills and invoices',
    text: 'Attach a bill from camera or gallery. Expenso scans readable text and can suggest amount, date, or title.'
  },
  {
    target: '.filter-card',
    title: 'Filter quickly',
    text: 'Use categories, dates, and search to narrow the list without changing the saved data.'
  },
  {
    target: '.list-header',
    title: 'Review your notes',
    text: 'Every add, edit, or delete re-fetches from the server so the list and summary stay in sync.'
  }
];

const els = {
  loadingScreen: document.querySelector('#loadingScreen'),
  currentDate: document.querySelector('#currentDate'),
  addEntryButton: document.querySelector('#addEntryButton'),
  summaryTitle: document.querySelector('#summaryTitle'),
  summaryYear: document.querySelector('#summaryYear'),
  summaryTotal: document.querySelector('#summaryTotal'),
  summaryBreakdown: document.querySelector('#summaryBreakdown'),
  entryPanelBackdrop: document.querySelector('#entryPanelBackdrop'),
  formCard: document.querySelector('#formCard'),
  formTitle: document.querySelector('#formTitle'),
  expenseForm: document.querySelector('#expenseForm'),
  categoryInput: document.querySelector('#category'),
  categoryPills: document.querySelector('#categoryPills'),
  receiptInput: document.querySelector('#receiptImage'),
  receiptPreview: document.querySelector('#receiptPreview'),
  ocrStatus: document.querySelector('#ocrStatus'),
  ocrSuggestions: document.querySelector('#ocrSuggestions'),
  scannedTextPanel: document.querySelector('#scannedTextPanel'),
  scannedTextOutput: document.querySelector('#scannedTextOutput'),
  copyScannedTextButton: document.querySelector('#copyScannedTextButton'),
  closeEntryPanelButton: document.querySelector('#closeEntryPanelButton'),
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
  tourSpotlight: document.querySelector('#tourSpotlight'),
  tourCard: document.querySelector('#tourCard'),
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
  state.scannedText = '';
  state.ocrSuggestions = {};
  state.ocrLoading = false;
  els.receiptInput.value = '';
  renderReceiptPreview();
  renderOcrState();
}

function setOcrLoading(isLoading, message = '') {
  state.ocrLoading = isLoading;
  els.ocrStatus.classList.toggle('is-hidden', !isLoading && !message);
  els.ocrStatus.classList.toggle('is-loading', isLoading);
  els.ocrStatus.textContent = message;
}

function normalizeScannedText(text) {
  return String(text || '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseAmountValue(value) {
  const cleaned = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d{1,2})?/);
  return cleaned ? Number(cleaned[0]) : null;
}

function extractAmount(text) {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const priority = lines.find((line) => /total|amount due|grand total|net payable|balance/i.test(line) && /\d/.test(line));
  const candidates = (priority ? [priority] : lines).flatMap((line) => {
    const matches = line.match(/(?:rs\.?|inr|\u20b9)?\s*[\d,]+(?:\.\d{1,2})?/gi) || [];
    return matches.map(parseAmountValue).filter((value) => Number.isFinite(value) && value > 0);
  });

  if (!candidates.length) {
    return null;
  }

  return Math.max(...candidates);
}

function toIsoDate(day, month, year) {
  const normalizedYear = Number(year) < 100 ? Number(`20${year}`) : Number(year);
  const date = new Date(Date.UTC(Number(normalizedYear), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(normalizedYear) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return '';
  }
  return `${normalizedYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function extractDate(text) {
  const numeric = text.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/);
  if (numeric) {
    return toIsoDate(numeric[1], numeric[2], numeric[3]);
  }

  const iso = text.match(/\b(20\d{2})[\/.-](\d{1,2})[\/.-](\d{1,2})\b/);
  if (iso) {
    return toIsoDate(iso[3], iso[2], iso[1]);
  }

  const monthNames = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
  };
  const named = text.match(/\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(20\d{2}|\d{2})\b/i);
  if (named) {
    return toIsoDate(named[1], monthNames[named[2].slice(0, 3).toLowerCase()], named[3]);
  }

  return '';
}

function extractTitle(text) {
  const ignored = /invoice|receipt|bill|tax|gst|date|time|total|amount|cash|card|upi|qty|price|subtotal/i;
  const line = text
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length >= 3 && item.length <= 60)
    .find((item) => !ignored.test(item) && /[a-z]/i.test(item));

  return line || '';
}

function buildOcrSuggestions(text) {
  const suggestions = {};
  const amount = extractAmount(text);
  const date = extractDate(text);
  const title = extractTitle(text);

  if (amount) {
    suggestions.amount = amount;
  }
  if (date) {
    suggestions.date = date;
  }
  if (title) {
    suggestions.title = title;
  }

  return suggestions;
}

function renderOcrState() {
  if (!state.scannedText) {
    els.scannedTextPanel.classList.add('is-hidden');
    els.scannedTextOutput.textContent = '';
  } else {
    els.scannedTextPanel.classList.remove('is-hidden');
    els.scannedTextOutput.textContent = state.scannedText;
  }

  const chips = [];
  if (state.ocrSuggestions.amount) {
    chips.push(`<button class="suggestion-chip" type="button" data-action="use-suggestion" data-field="amount">Use amount ${formatCurrency(state.ocrSuggestions.amount)}</button>`);
  }
  if (state.ocrSuggestions.date) {
    chips.push(`<button class="suggestion-chip" type="button" data-action="use-suggestion" data-field="date">Use date ${formatDate(state.ocrSuggestions.date)}</button>`);
  }
  if (state.ocrSuggestions.title) {
    chips.push(`<button class="suggestion-chip" type="button" data-action="use-suggestion" data-field="title">Use title ${escapeHtml(state.ocrSuggestions.title)}</button>`);
  }

  els.ocrSuggestions.innerHTML = chips.join('');
  els.ocrSuggestions.classList.toggle('is-hidden', chips.length === 0);
}

async function scanReceiptImage(imageData) {
  if (!window.Tesseract || !imageData) {
    setOcrLoading(false, 'Scanner unavailable. The bill image is still attached.');
    return;
  }

  try {
    setOcrLoading(true, 'Scanning bill...');
    const result = await window.Tesseract.recognize(imageData, 'eng', {
      logger(message) {
        if (message.status === 'recognizing text' && Number.isFinite(message.progress)) {
          const progress = Math.round(message.progress * 100);
          setOcrLoading(true, `Scanning bill... ${progress}%`);
        }
      }
    });
    state.scannedText = normalizeScannedText(result.data.text);
    state.ocrSuggestions = buildOcrSuggestions(state.scannedText);
    setOcrLoading(false, state.scannedText ? 'Scan complete.' : 'No readable text found.');
    renderOcrState();
  } catch (error) {
    state.scannedText = '';
    state.ocrSuggestions = {};
    renderOcrState();
    setOcrLoading(false, 'Could not scan this image. Try a clearer photo.');
  }
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
          ${expense.scanned_text ? `
            <span class="scan-badge">Text scanned</span>
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
    els.summaryBreakdown.innerHTML = '<div class="empty-summary">Nothing logged yet.</div>';
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

function getFocusableElements(container) {
  return Array.from(container.querySelectorAll([
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(','))).filter((element) => element.offsetParent !== null || element === document.activeElement);
}

function trapFocus(event, container) {
  if (event.key !== 'Tab') {
    return;
  }

  const focusable = getFocusableElements(container);
  if (!focusable.length) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openEntryPanel({ focusTitle = true, rememberFocus = true } = {}) {
  if (rememberFocus) {
    state.entryPanelLastFocus = document.activeElement;
  }
  els.formCard.inert = false;
  document.body.classList.add('is-entry-panel-open');
  els.entryPanelBackdrop.classList.remove('is-hidden');
  els.formCard.setAttribute('aria-hidden', 'false');

  if (focusTitle) {
    window.setTimeout(() => {
      els.expenseForm.elements.title.focus({ preventScroll: true });
    }, 80);
  }
}

function closeEntryPanel({ restoreFocus = true } = {}) {
  document.body.classList.remove('is-entry-panel-open');
  els.entryPanelBackdrop.classList.add('is-hidden');
  els.formCard.setAttribute('aria-hidden', 'true');
  els.formCard.inert = true;

  if (restoreFocus && state.entryPanelLastFocus && document.contains(state.entryPanelLastFocus)) {
    state.entryPanelLastFocus.focus({ preventScroll: true });
  }
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
  state.scannedText = expense.scanned_text || '';
  state.ocrSuggestions = state.scannedText ? buildOcrSuggestions(state.scannedText) : {};
  renderReceiptPreview();
  renderOcrState();

  clearFormErrors();
  openEntryPanel();
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
  closeEntryPanel();
}

function jumpToAddEntry() {
  if (state.editingId) {
    exitEditMode();
  }

  els.formCard.classList.add('is-highlighted');
  openEntryPanel();
  window.setTimeout(() => els.formCard.classList.remove('is-highlighted'), 850);
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
  } else if (form.date.value > todayIso()) {
    errors.date = 'Future expenses are not supported yet. Use today or an earlier date.';
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
    receipt_image: state.receiptImage,
    scanned_text: state.scannedText
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

async function hideLoadingScreen() {
  if (!els.loadingScreen || els.loadingScreen.classList.contains('is-hidden')) {
    return;
  }

  const elapsed = Date.now() - state.loadingStartedAt;
  const remaining = Math.max(0, 850 - elapsed);

  if (remaining) {
    await new Promise((resolve) => window.setTimeout(resolve, remaining));
  }

  els.loadingScreen.classList.add('is-leaving');
  window.setTimeout(() => {
    els.loadingScreen.classList.add('is-hidden');
  }, 380);
}

function setSubmitLoading(isLoading) {
  els.submitButton.disabled = isLoading;
  if (isLoading) {
    els.submitButton.textContent = state.editingId ? 'Updating...' : 'Adding...';
    return;
  }
  els.submitButton.textContent = state.editingId ? 'Update Entry' : 'Add Entry';
}

function getTourTarget(step) {
  return document.querySelector(step.target);
}

function updateTourSpotlight() {
  if (els.tourOverlay.classList.contains('is-hidden')) {
    return;
  }

  const step = TOUR_STEPS[state.tourStep];
  const target = getTourTarget(step);

  if (!target) {
    return;
  }

  const padding = window.innerWidth <= 480 ? 8 : 12;
  const rect = target.getBoundingClientRect();
  const left = Math.max(12, rect.left - padding);
  const top = Math.max(12, rect.top - padding);
  const width = Math.min(window.innerWidth - left - 12, rect.width + padding * 2);
  const height = Math.min(window.innerHeight - top - 12, rect.height + padding * 2);

  els.tourSpotlight.style.left = `${left}px`;
  els.tourSpotlight.style.top = `${top}px`;
  els.tourSpotlight.style.width = `${Math.max(44, width)}px`;
  els.tourSpotlight.style.height = `${Math.max(44, height)}px`;

  const cardWidth = Math.min(420, window.innerWidth - 32);
  const cardHeight = els.tourCard.offsetHeight || 230;
  const gap = 18;
  let cardTop = rect.bottom + gap;
  let cardLeft = Math.min(Math.max(16, rect.left), window.innerWidth - cardWidth - 16);

  if (cardTop + cardHeight > window.innerHeight - 16) {
    cardTop = rect.top - cardHeight - gap;
  }

  if (cardTop < 16) {
    cardTop = Math.min(window.innerHeight - cardHeight - 16, 16);
  }

  if (window.innerWidth <= 480) {
    cardLeft = 16;
    const belowTop = rect.bottom + 12;
    const aboveTop = rect.top - cardHeight - 12;

    if (belowTop + cardHeight <= window.innerHeight - 16) {
      cardTop = belowTop;
    } else if (aboveTop >= 16) {
      cardTop = aboveTop;
    } else if (rect.top < window.innerHeight / 2) {
      cardTop = Math.max(16, window.innerHeight - cardHeight - 16);
    } else {
      cardTop = 16;
    }
  }

  els.tourCard.style.setProperty('--tour-card-left', `${cardLeft}px`);
  els.tourCard.style.setProperty('--tour-card-top', `${cardTop}px`);
}

function prepareTourStep() {
  const step = TOUR_STEPS[state.tourStep];

  if (step.openEntryPanel) {
    openEntryPanel({ focusTitle: false, rememberFocus: false });
  } else if (document.body.classList.contains('is-entry-panel-open')) {
    closeEntryPanel({ restoreFocus: false });
  }

  const target = getTourTarget(step);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
  }

  window.setTimeout(updateTourSpotlight, 260);
}

function completeTour() {
  localStorage.setItem('expensoTourSeen', 'true');
  els.tourOverlay.classList.add('is-hidden');
  document.body.classList.remove('is-tour-open');
  closeEntryPanel({ restoreFocus: false });

  if (state.tourLastFocus && document.contains(state.tourLastFocus)) {
    state.tourLastFocus.focus({ preventScroll: true });
  }
}

function renderTourStep() {
  const step = TOUR_STEPS[state.tourStep];
  els.tourStepCount.textContent = `${state.tourStep + 1} of ${TOUR_STEPS.length}`;
  els.tourTitle.textContent = step.title;
  els.tourText.textContent = step.text;
  els.tourNext.textContent = state.tourStep === TOUR_STEPS.length - 1 ? 'Start tracking' : 'Next';
  prepareTourStep();
}

function maybeShowTour() {
  if (localStorage.getItem('expensoTourSeen') === 'true') {
    return;
  }

  state.tourStep = 0;
  state.tourLastFocus = document.activeElement;
  renderTourStep();
  els.tourOverlay.classList.remove('is-hidden');
  document.body.classList.add('is-tour-open');
  window.setTimeout(() => els.tourNext.focus({ preventScroll: true }), 80);
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
    state.scannedText = '';
    state.ocrSuggestions = {};
    renderReceiptPreview();
    showToast('Bill image attached.', 'success');
    await scanReceiptImage(state.receiptImage);
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

els.ocrSuggestions.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="use-suggestion"]');
  if (!button) {
    return;
  }

  const field = button.dataset.field;
  const form = els.expenseForm.elements;

  if (field === 'amount') {
    form.amount.value = state.ocrSuggestions.amount;
  }
  if (field === 'date') {
    form.date.value = state.ocrSuggestions.date;
  }
  if (field === 'title') {
    form.title.value = state.ocrSuggestions.title;
  }

  clearFormErrors();
  showToast('Suggestion applied.', 'success');
});

els.copyScannedTextButton.addEventListener('click', () => {
  if (!state.scannedText) {
    return;
  }

  const note = els.expenseForm.elements.note;
  note.value = note.value.trim() ? `${note.value.trim()}\n\n${state.scannedText}` : state.scannedText;
  showToast('Scanned text copied to note.', 'success');
});

els.addEntryButton.addEventListener('click', jumpToAddEntry);

els.closeEntryPanelButton.addEventListener('click', () => {
  exitEditMode();
});

els.entryPanelBackdrop.addEventListener('click', () => {
  exitEditMode();
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
      closeEntryPanel();
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

document.addEventListener('keydown', (event) => {
  if (!els.tourOverlay.classList.contains('is-hidden')) {
    if (event.key === 'Escape') {
      event.preventDefault();
      completeTour();
      return;
    }

    trapFocus(event, els.tourOverlay);
    return;
  }

  if (document.body.classList.contains('is-entry-panel-open')) {
    if (event.key === 'Escape') {
      event.preventDefault();
      exitEditMode();
      return;
    }

    trapFocus(event, els.formCard);
  }
});

window.addEventListener('resize', updateTourSpotlight);
window.addEventListener('scroll', updateTourSpotlight, { passive: true });

document.addEventListener('DOMContentLoaded', async () => {
  const now = new Date();
  els.currentDate.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    year: 'numeric'
  });
  els.currentDate.setAttribute('datetime', now.toISOString());
  els.expenseForm.elements.date.value = todayIso();
  els.expenseForm.elements.date.max = todayIso();
  els.formCard.inert = true;
  renderCategoryPills(els.categoryPills, '', 'form');
  renderCategoryPills(els.filterCategoryPills, '', 'filter');
  renderReceiptPreview();
  updateClearFiltersVisibility();
  await refreshAll();
  await hideLoadingScreen();
  maybeShowTour();
});
