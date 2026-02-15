// Recipe grid view module
import { getState, setState } from '../state.js';
import { scaleString } from '../utils/scaling.js';
import { createIcon, createButton } from '../components/ui.js';

/**
 * Create recipe card element
 */
function createRecipeCard(recipe, selectedCount, onToggleSelect, onUpdateCount) {
  const card = document.createElement('div');
  card.className = `card recipe-card ${selectedCount ? 'selected' : ''}`;
  
  // Image container
  const imageDiv = document.createElement('div');
  imageDiv.className = 'recipe-card-image';
  
  // Origin badge
  if (recipe.origin) {
    const originBadge = document.createElement('div');
    originBadge.className = 'recipe-badge-origin';
    originBadge.innerHTML = `${createIcon('Globe', 10).outerHTML} ${recipe.origin}`;
    imageDiv.appendChild(originBadge);
  }
  
  // Count control (only if selected)
  if (selectedCount) {
    const countControl = createCountControl(selectedCount, recipe.id, onUpdateCount);
    imageDiv.appendChild(countControl);
  }
  
  // Selection toggle button
  const selectBtn = document.createElement('button');
  selectBtn.className = `recipe-select-btn ${selectedCount ? 'selected' : ''}`;
  selectBtn.innerHTML = selectedCount ? createIcon('Check', 16).outerHTML : createIcon('Plus', 16).outerHTML;
  selectBtn.onclick = (e) => onToggleSelect(e, recipe.id, recipe.servings);
  imageDiv.appendChild(selectBtn);
  
  // Info overlay
  const infoOverlay = document.createElement('div');
  infoOverlay.className = 'recipe-info-overlay';
  infoOverlay.innerHTML = `
    <div class="recipe-info-badge">
      ${createIcon('Clock', 12).outerHTML} ${recipe.cookTime}
    </div>
    <div class="recipe-info-badge">
      ${createIcon('Users', 12).outerHTML} ${recipe.servings}
    </div>
  `;
  imageDiv.appendChild(infoOverlay);
  
  card.appendChild(imageDiv);
  
  // Card content
  const content = document.createElement('div');
  content.className = 'recipe-card-content';
  content.innerHTML = `
    <div class="recipe-category">${recipe.category}</div>
    <h3 class="recipe-title">${recipe.title}</h3>
    <div class="recipe-meta">
      <span>${recipe.ingredients.length} ingredients</span>
      <span>${recipe.calories} kcal</span>
    </div>
  `;
  card.appendChild(content);
  
  // Click to view recipe detail
  card.onclick = () => {
    setState({ 
      selectedRecipe: recipe,
      recipeViewMode: 'overview',
      currentStepIndex: 0
    });
  };
  
  return card;
}

/**
 * Create count control component (for serving adjustment)
 */
function createCountControl(count, recipeId, onUpdateCount) {
  const control = document.createElement('button');
  control.className = 'count-control';
  control.innerHTML = `${createIcon('Users', 12).outerHTML} ${count} pp`;
  
  let timer = null;
  let isLongPress = false;
  
  const handlePointerDown = (e) => {
    e.stopPropagation();
    isLongPress = false;
    timer = setTimeout(() => {
      isLongPress = true;
      onUpdateCount(e, recipeId, -1);
    }, 500);
  };
  
  const handlePointerUp = (e) => {
    e.stopPropagation();
    if (timer) clearTimeout(timer);
    if (!isLongPress) {
      onUpdateCount(e, recipeId, 1);
    }
  };
  
  const handlePointerLeave = () => {
    if (timer) clearTimeout(timer);
  };
  
  control.addEventListener('pointerdown', handlePointerDown);
  control.addEventListener('pointerup', handlePointerUp);
  control.addEventListener('pointerleave', handlePointerLeave);
  control.addEventListener('contextmenu', (e) => e.preventDefault());
  
  return control;
}

/**
 * Create header toggle (metric/US switcher)
 */
export function createHeaderToggle() {
  const state = getState();
  const container = document.createElement('div');
  container.className = 'header-toggle';
  
  // Metric toggle
  const toggle = document.createElement('div');
  toggle.className = 'metric-toggle';
  toggle.innerHTML = `
    <div class="metric-option ${!state.useMetric ? 'active' : ''}">US</div>
    <div class="metric-option ${state.useMetric ? 'active' : ''}">UK</div>
  `;
  toggle.onclick = () => setState({ useMetric: !state.useMetric });
  container.appendChild(toggle);
  
  return container;
}

/**
 * Render the recipes grid view
 */
export function renderRecipesGrid() {
  const state = getState();
  const container = document.getElementById('app');
  container.innerHTML = '';
  container.className = 'recipes-grid-view';
  
  // Header
  const header = document.createElement('div');
  header.className = 'grid-header';
  header.innerHTML = `
    <div>
      <h1 class="page-title">Discover</h1>
      <p class="page-subtitle">What are we cooking today?</p>
    </div>
    <div class="header-actions">
      ${createHeaderToggle().outerHTML}
      <div class="avatar"></div>
    </div>
  `;
  container.appendChild(header);
  
  // Search bar
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  const searchIcon = createIcon('Search', 20, 'search-icon');
  searchContainer.appendChild(searchIcon);
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search recipes, ingredients...';
  searchInput.className = 'search-input';
  searchContainer.appendChild(searchInput);
  container.appendChild(searchContainer);
  
  // Recipe cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'recipe-cards-grid';
  
  state.recipes.forEach(recipe => {
    const card = createRecipeCard(
      recipe,
      state.selectedRecipes[recipe.id],
      toggleRecipeSelection,
      updateServingCount
    );
    cardsContainer.appendChild(card);
  });
  
  container.appendChild(cardsContainer);
  
  // Selection banner
  const selectedCount = Object.keys(state.selectedRecipes).length;
  if (selectedCount > 0) {
    const banner = document.createElement('div');
    banner.className = 'selection-banner';
    banner.innerHTML = `
      <div class="selection-text">
        <span class="selection-count">${selectedCount}</span>
        <span class="selection-label">recipes selected</span>
      </div>
    `;
    const addBtn = createButton({
      text: 'Add Ingredients',
      onClick: addSelectedRecipesToShopping,
      variant: 'primary',
      className: 'selection-btn'
    });
    banner.appendChild(addBtn);
    container.appendChild(banner);
  }
}

/**
 * Toggle recipe selection
 */
function toggleRecipeSelection(e, id, defaultServings) {
  e.stopPropagation();
  const state = getState();
  const newSelected = { ...state.selectedRecipes };
  
  if (newSelected[id]) {
    delete newSelected[id];
  } else {
    newSelected[id] = defaultServings;
  }
  
  setState({ selectedRecipes: newSelected });
}

/**
 * Update serving count for selected recipe
 */
function updateServingCount(e, id, change) {
  e.stopPropagation();
  const state = getState();
  const newSelected = { ...state.selectedRecipes };
  
  if (!newSelected[id]) return;
  
  const newCount = newSelected[id] + change;
  if (newCount < 1) {
    delete newSelected[id];
  } else {
    newSelected[id] = newCount;
  }
  
  setState({ selectedRecipes: newSelected });
}

/**
 * Add selected recipes' ingredients to shopping list
 */
function addSelectedRecipesToShopping() {
  const state = getState();
  let allIngredients = [];
  
  Object.keys(state.selectedRecipes).forEach(idStr => {
    const id = parseInt(idStr);
    const recipe = state.recipes.find(r => r.id === id);
    if (!recipe) return;
    
    const selectedCount = state.selectedRecipes[id];
    const originalServings = recipe.servings;
    const factor = selectedCount / originalServings;
    
    // Scale ingredients
    const scaledIngredients = recipe.ingredients.map(ing => ({
      ...ing,
      amount: scaleString(ing.amount, factor),
      amountMetric: scaleString(ing.amountMetric, factor),
    }));
    
    allIngredients = [...allIngredients, ...scaledIngredients];
  });
  
  // Add to shopping list
  const newItems = allIngredients.map(ing => ({
    ...ing,
    id: Date.now() + Math.random(),
    checked: false
  }));
  
  setState({
    shoppingList: [...state.shoppingList, ...newItems],
    selectedRecipes: {},
    activeTab: 'shopping'
  });
}
