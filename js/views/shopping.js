// Shopping list view module
import { getState, setState, setStateQuiet } from '../state.js';
import { createIcon, createButton } from '../components/ui.js';
import { escapeHtml, getDisplayAmount } from '../utils/helpers.js';
import { encodeBasket, getBasketShareUrl, copyToClipboard } from '../utils/sharing.js';

/**
 * Render shopping list view
 */
export function renderShoppingList() {
  const state = getState();
  const container = document.getElementById('app');
  container.innerHTML = '';
  container.className = 'shopping-list-view';

  if (state.shoppingList.length === 0) {
    renderEmptyState(container);
    return;
  }

  // Header
  const header = document.createElement('div');
  header.className = 'shopping-header';

  const headerTop = document.createElement('div');
  headerTop.className = 'shopping-header-top';
  headerTop.innerHTML = '<h1 class="page-title">Shopping List</h1>';

  const headerActions = document.createElement('div');
  headerActions.className = 'header-actions';

  // Counter
  const checkedCount = state.shoppingList.filter(i => i.checked).length;
  const counter = document.createElement('div');
  counter.className = 'shopping-counter';
  counter.textContent = `${checkedCount}/${state.shoppingList.length}`;
  headerActions.appendChild(counter);

  // Share basket button
  const shareBasketBtn = document.createElement('button');
  shareBasketBtn.className = 'header-icon-btn';
  shareBasketBtn.setAttribute('aria-label', 'Share basket');
  shareBasketBtn.innerHTML = createIcon('Share2', 20).outerHTML;
  shareBasketBtn.onclick = () => showBasketShareModal();
  headerActions.appendChild(shareBasketBtn);

  headerTop.appendChild(headerActions);
  header.appendChild(headerTop);

  // Sort tabs + action buttons row
  const toolbarRow = document.createElement('div');
  toolbarRow.className = 'shopping-toolbar';

  const sortTabs = document.createElement('div');
  sortTabs.className = 'sort-tabs';

  const modes = [
    { id: 'aisle', label: 'By Aisle' },
    { id: 'category', label: 'By Type' },
    { id: 'alpha', label: 'A-Z' }
  ];

  modes.forEach(mode => {
    const tab = document.createElement('button');
    tab.className = `sort-tab ${state.sortMode === mode.id ? 'active' : ''}`;
    tab.textContent = mode.label;
    tab.onclick = () => setState({ sortMode: mode.id });
    sortTabs.appendChild(tab);
  });

  toolbarRow.appendChild(sortTabs);

  // Toolbar right side: clear checked + delete all
  const toolbarActions = document.createElement('div');
  toolbarActions.className = 'toolbar-actions';

  // Clear checked button (proper button with text)
  if (state.shoppingList.some(i => i.checked)) {
    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-checked-btn-inline';
    clearBtn.innerHTML = `${createIcon('Check', 14).outerHTML} <span>Clear</span>`;
    clearBtn.onclick = clearCheckedItems;
    toolbarActions.appendChild(clearBtn);
  }

  // Delete all icon button
  const deleteAllBtn = document.createElement('button');
  deleteAllBtn.className = 'header-icon-btn danger';
  deleteAllBtn.setAttribute('aria-label', 'Delete all items');
  deleteAllBtn.innerHTML = createIcon('Trash2', 18).outerHTML;
  deleteAllBtn.onclick = deleteAllItems;
  toolbarActions.appendChild(deleteAllBtn);

  toolbarRow.appendChild(toolbarActions);
  header.appendChild(toolbarRow);

  // Add item input row
  header.appendChild(createAddItemRow());

  container.appendChild(header);

  // Shopping list content
  const content = document.createElement('div');
  content.className = 'shopping-content';

  const groups = getGroupedItems();

  Object.entries(groups).forEach(([groupName, items]) => {
    const groupSection = document.createElement('div');
    groupSection.className = 'shopping-group';

    const groupTitle = document.createElement('h3');
    groupTitle.className = 'group-title';
    groupTitle.textContent = groupName;
    groupSection.appendChild(groupTitle);

    const groupList = document.createElement('div');
    groupList.className = 'group-list';

    items.forEach(item => {
      const itemEl = createShoppingItem(item);
      groupList.appendChild(itemEl);
    });

    groupSection.appendChild(groupList);
    content.appendChild(groupSection);
  });

  container.appendChild(content);
}

/**
 * Create the add-item input row
 */
function createAddItemRow() {
  const wrapper = document.createElement('div');
  wrapper.className = 'add-item-wrapper';

  const row = document.createElement('div');
  row.className = 'add-item-row';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'add-item-input';
  input.placeholder = 'Add item (e.g. 2 onions)...';

  // Category Select
  const categorySelect = document.createElement('select');
  categorySelect.className = 'add-item-select';
  categorySelect.innerHTML = '<option value="">Category (Optional)</option>';
  const categories = [
    'Produce', 'Meat & Poultry', 'Seafood', 'Dairy & Eggs', 'Bakery',
    'Frozen', 'Canned & Jarred', 'Pasta, Rice & Grains', 'Cereal & Breakfast',
    'Baking & Spices', 'Condiments & Sauces', 'Snacks', 'Beverages',
    'World Foods', 'Household'
  ];
  categories.forEach(cat => {
    categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
  });

  // Aisle Select
  const aisleSelect = document.createElement('select');
  aisleSelect.className = 'add-item-select';
  aisleSelect.innerHTML = '<option value="">Aisle (Optional)</option>';
  const aisles = [
    { id: '1', name: '1: Bakery' },
    { id: '2', name: '2: Fruit & Veg' },
    { id: '3', name: '3: Meat & Fish' },
    { id: '4', name: '4: Dairy & Eggs' },
    { id: '5', name: '5: Breakfast' },
    { id: '6', name: '6: Pantry' },
    { id: '7', name: '7: Baking & Spices' },
    { id: '8', name: '8: Snacks' },
    { id: '9', name: '9: Drinks' },
    { id: '10', name: '10: Household' },
    { id: '11', name: '11: Frozen' }
  ];
  aisles.forEach(a => {
    aisleSelect.innerHTML += `<option value="${a.id}">${a.name}</option>`;
  });

  const handleAdd = () => {
    if (input.value.trim()) {
      addManualItem(input.value.trim(), categorySelect.value, aisleSelect.value);
      input.value = '';
      categorySelect.value = '';
      aisleSelect.value = '';
      input.focus();
    }
  };

  input.onkeydown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  const addBtn = document.createElement('button');
  addBtn.className = 'add-item-btn';
  addBtn.innerHTML = createIcon('Plus', 20).outerHTML;
  addBtn.setAttribute('aria-label', 'Add item');
  addBtn.onclick = handleAdd;

  row.appendChild(input);
  row.appendChild(categorySelect);
  row.appendChild(aisleSelect);
  row.appendChild(addBtn);

  wrapper.appendChild(row);
  return wrapper;
}

/**
 * Parse and add a manually entered item
 */
function addManualItem(text, category, aisle) {
  const state = getState();

  // Try to parse amount from the beginning
  const amountMatch = text.match(/^(\d+[\d/.]*\s*(?:g|kg|ml|l|oz|lb|cup|cups|tbsp|tsp|x|pcs)?)\s+(.+)$/i);

  let name, amount;
  if (amountMatch) {
    amount = amountMatch[1].trim();
    name = amountMatch[2].trim();
  } else {
    name = text;
    amount = '';
  }

  const newItem = {
    id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    amount: amount,
    amountMetric: amount,
    checked: false,
    category: category || 'Other',
    aisle: aisle || 'Other'
  };

  setState({
    shoppingList: [...state.shoppingList, newItem]
  });
}

/**
 * Render empty shopping list state
 */
function renderEmptyState(container) {
  const empty = document.createElement('div');
  empty.className = 'empty-state';

  const icon = document.createElement('div');
  icon.className = 'empty-icon';
  icon.appendChild(createIcon('ShoppingCart', 40));
  empty.appendChild(icon);

  const title = document.createElement('h2');
  title.className = 'empty-title';
  title.textContent = 'Your list is empty';
  empty.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'empty-subtitle';
  subtitle.textContent = 'Add items manually below, or browse recipes to add ingredients.';
  empty.appendChild(subtitle);

  // Add item input on empty state too
  empty.appendChild(createAddItemRow());

  const browseBtn = createButton({
    text: 'Browse Recipes',
    onClick: () => setState({ activeTab: 'recipes' }),
    variant: 'primary'
  });
  empty.appendChild(browseBtn);

  container.appendChild(empty);
}

/**
 * Show basket share modal
 */
async function showBasketShareModal() {
  const state = getState();
  const encodedBasket = await encodeBasket(state.shoppingList, state.selectedRecipes, state.useMetric);

  if (!encodedBasket) {
    alert('Failed to encode shopping list. This may be due to serialization issues with your basket data. Please try removing some items and try again.');
    return;
  }

  const shareUrl = getBasketShareUrl(encodedBasket);

  if (!shareUrl) {
    alert('Shopping list is too large to share via URL. Please reduce the number of items and try again.');
    return;
  }

  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content share-modal">
      <div class="modal-header">
        <h2>Share Shopping List</h2>
        <button class="modal-close-btn">${createIcon('X', 24).outerHTML}</button>
      </div>
      <div class="modal-body">
        <p class="share-subtitle">${state.shoppingList.length} items • ${state.useMetric ? 'Metric' : 'US'} measurements</p>
        <div class="share-url-container">
          <input type="text" class="share-url-input" value="${shareUrl}" readonly />
          <button class="btn btn-primary copy-btn">
            ${createIcon('Copy', 18).outerHTML}
            <span>Copy</span>
          </button>
        </div>
        <p class="share-hint">Share this link with friends to let them import your shopping list!</p>
      </div>
    </div>
  `;

  // Add event listeners
  const closeBtn = modal.querySelector('.modal-close-btn');
  closeBtn.onclick = () => document.body.removeChild(modal);

  const copyBtn = modal.querySelector('.copy-btn');
  const urlInput = modal.querySelector('.share-url-input');

  copyBtn.onclick = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      copyBtn.innerHTML = `${createIcon('Check', 18).outerHTML} <span>Copied!</span>`;
      copyBtn.classList.add('copied');
      urlInput.select();
      setTimeout(() => {
        copyBtn.innerHTML = `${createIcon('Copy', 18).outerHTML} <span>Copy</span>`;
        copyBtn.classList.remove('copied');
      }, 2000);
    }
  };

  // Close on overlay click
  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  };

  document.body.appendChild(modal);
}

/**
 * Create shopping item element
 */
function createShoppingItem(item) {
  const state = getState();
  const itemEl = document.createElement('div');
  itemEl.className = `shopping-item ${item.checked ? 'checked' : ''}`;
  itemEl.dataset.itemId = item.id;
  itemEl.onclick = () => toggleShoppingItem(item.id);

  // Custom Checkbox Container
  const checkboxContainer = document.createElement('div');
  checkboxContainer.className = 'shopping-checkbox-container';

  const checkbox = document.createElement('div');
  checkbox.className = `shopping-checkbox ${item.checked ? 'checked' : ''}`;
  if (item.checked) {
    checkbox.innerHTML = createIcon('Check', 12).outerHTML;
  }
  checkboxContainer.appendChild(checkbox);
  itemEl.appendChild(checkboxContainer);

  // Content
  const content = document.createElement('div');
  content.className = 'shopping-item-content';

  const nameEl = document.createElement('div');
  nameEl.className = `shopping-item-name ${item.checked ? 'checked' : ''}`;
  nameEl.textContent = item.name;

  const metaEl = document.createElement('div');
  metaEl.className = 'shopping-item-meta';

  // Create badges for amount and category
  const amountBadge = document.createElement('span');
  amountBadge.className = 'shopping-badge amount';
  amountBadge.textContent = getAmount(item);

  const catBadge = document.createElement('span');
  catBadge.className = 'shopping-badge category';
  catBadge.textContent = item.category;

  if (getAmount(item)) metaEl.appendChild(amountBadge);
  if (item.category) metaEl.appendChild(catBadge);

  content.appendChild(nameEl);
  content.appendChild(metaEl);
  itemEl.appendChild(content);

  // Aisle indicator if available
  if (item.aisle) {
    const aisleEl = document.createElement('div');
    aisleEl.className = 'shopping-aisle';
    aisleEl.textContent = `Aisle ${item.aisle}`;
    itemEl.appendChild(aisleEl);
  }

  return itemEl;
}

/**
 * Get sorted and grouped items
 */
function getGroupedItems() {
  const state = getState();
  let sorted = [...state.shoppingList];

  // Sort
  if (state.sortMode === 'alpha') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sortMode === 'category') {
    sorted.sort((a, b) => a.category.localeCompare(b.category));
  } else if (state.sortMode === 'aisle') {
    sorted.sort((a, b) => {
      const aisleA = parseInt(a.aisle) || 99;
      const aisleB = parseInt(b.aisle) || 99;
      return aisleA - aisleB;
    });
  }

  // Group
  const grouped = {};
  sorted.forEach(item => {
    let key = 'All Items';
    if (state.sortMode === 'category') key = item.category;
    if (state.sortMode === 'aisle') key = `Aisle ${item.aisle || '?'}`;
    if (state.sortMode === 'alpha') key = item.name[0].toUpperCase();

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  return grouped;
}

/**
 * Toggle shopping item checked state
 */
function toggleShoppingItem(id) {
  const state = getState();
  const newList = state.shoppingList.map(item =>
    item.id === id ? { ...item, checked: !item.checked } : item
  );

  // Update state without triggering full re-render
  setStateQuiet({ shoppingList: newList });

  // Targeted DOM update: Find and update only the changed item
  const itemEl = document.querySelector(`.shopping-item[data-item-id="${id}"]`);
  if (itemEl) {
    const item = newList.find(i => i.id === id);
    if (item) {
      // Update classes
      if (item.checked) {
        itemEl.classList.add('checked');
      } else {
        itemEl.classList.remove('checked');
      }

      // Update checkbox
      const checkbox = itemEl.querySelector('.shopping-checkbox');
      if (checkbox) {
        if (item.checked) {
          checkbox.classList.add('checked');
          checkbox.innerHTML = createIcon('Check', 12).outerHTML;
        } else {
          checkbox.classList.remove('checked');
          checkbox.innerHTML = '';
        }
      }

      // Update item name
      const nameEl = itemEl.querySelector('.shopping-item-name');
      if (nameEl) {
        if (item.checked) {
          nameEl.classList.add('checked');
        } else {
          nameEl.classList.remove('checked');
        }
      }
    }
  }

  // Update the counter in the header
  const counter = document.querySelector('.shopping-counter');
  if (counter) {
    const checkedCount = newList.filter(i => i.checked).length;
    counter.textContent = `${checkedCount}/${newList.length}`;
  }

  // Update or show clear button
  const existingClearBtn = document.querySelector('.clear-checked-btn');
  const hasCheckedItems = newList.some(i => i.checked);

  if (!hasCheckedItems && existingClearBtn) {
    existingClearBtn.remove();
  } else if (hasCheckedItems && !existingClearBtn) {
    const container = document.querySelector('.shopping-list-view');
    if (container) {
      const clearBtn = document.createElement('button');
      clearBtn.className = 'clear-checked-btn';
      clearBtn.appendChild(createIcon('Trash2', 18));
      const text = document.createElement('span');
      text.textContent = 'Clear Checked';
      clearBtn.appendChild(text);
      clearBtn.onclick = clearCheckedItems;
      container.appendChild(clearBtn);
    }
  }

  // Manually update bottom nav badge
  const nav = document.getElementById('bottom-nav');
  if (nav) {
    const badge = nav.querySelector('.nav-badge');
    if (badge) {
      badge.textContent = newList.length;
      if (newList.length > 0) {
        badge.classList.add('visible');
      } else {
        badge.classList.remove('visible');
      }
    }
  }
}

/**
 * Clear all checked items
 */
function clearCheckedItems() {
  const state = getState();
  const newList = state.shoppingList.filter(item => !item.checked);
  setState({ shoppingList: newList });
}

/**
 * Delete all items from shopping list
 * Note: Uses native confirm() for simplicity. In production, consider
 * implementing a custom modal with proper ARIA attributes for better accessibility.
 */
function deleteAllItems() {
  if (confirm('Are you sure you want to delete all items from your shopping list?')) {
    setState({ shoppingList: [] });
  }
}

/**
 * Get amount based on metric preference
 */
function getAmount(item) {
  const state = getState();
  return getDisplayAmount(item, state.useMetric);
}
