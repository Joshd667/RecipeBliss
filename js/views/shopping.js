// Shopping list view module
import { getState, setState } from '../state.js';
import { createIcon, createButton } from '../components/ui.js';
import { createHeaderToggle } from './grid.js';

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
  headerActions.appendChild(createHeaderToggle());
  
  const checkedCount = state.shoppingList.filter(i => i.checked).length;
  const counter = document.createElement('div');
  counter.className = 'shopping-counter';
  counter.textContent = `${checkedCount}/${state.shoppingList.length}`;
  headerActions.appendChild(counter);
  
  headerTop.appendChild(headerActions);
  header.appendChild(headerTop);
  
  // Sort tabs
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
  
  header.appendChild(sortTabs);
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
  
  // Clear checked button
  if (state.shoppingList.some(i => i.checked)) {
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

/**
 * Render empty shopping list state
 */
function renderEmptyState(container) {
  const empty = document.createElement('div');
  empty.className = 'empty-state';
  
  const headerToggle = createHeaderToggle();
  headerToggle.classList.add('empty-header-toggle');
  empty.appendChild(headerToggle);
  
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
  subtitle.textContent = 'Start browsing recipes and add ingredients to build your shopping plan.';
  empty.appendChild(subtitle);
  
  const browseBtn = createButton({
    text: 'Browse Recipes',
    onClick: () => setState({ activeTab: 'recipes' }),
    variant: 'primary'
  });
  empty.appendChild(browseBtn);
  
  container.appendChild(empty);
}

/**
 * Create shopping item element
 */
function createShoppingItem(item) {
  const state = getState();
  const itemEl = document.createElement('div');
  itemEl.className = `shopping-item ${item.checked ? 'checked' : ''}`;
  itemEl.onclick = () => toggleShoppingItem(item.id);
  
  const checkbox = document.createElement('div');
  checkbox.className = `shopping-checkbox ${item.checked ? 'checked' : ''}`;
  if (item.checked) {
    checkbox.appendChild(createIcon('CheckCircle2', 14));
  }
  itemEl.appendChild(checkbox);
  
  const content = document.createElement('div');
  content.className = 'shopping-item-content';
  content.innerHTML = `
    <div class="shopping-item-name ${item.checked ? 'checked' : ''}">${item.name}</div>
    <div class="shopping-item-meta">${getAmount(item)} • ${item.category}</div>
  `;
  itemEl.appendChild(content);
  
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
  setState({ shoppingList: newList });
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
 * Get amount based on metric preference
 */
function getAmount(item) {
  const state = getState();
  return state.useMetric ? item.amountMetric : item.amount;
}
