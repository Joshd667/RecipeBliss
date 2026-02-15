// Recipe grid view module
import { getState, setState } from '../state.js';
import { scaleString } from '../utils/scaling.js';
import { createIcon, createButton } from '../components/ui.js';
import { filterRecipes, getAllUniqueTags, getActiveFilterCount, calculateTotalTime } from '../utils/filters.js';

/**
 * Create recipe card element
 */
function createRecipeCard(recipe, selectedCount, onToggleSelect, onUpdateCount) {
  const card = document.createElement('div');
  card.className = `card recipe-card ${selectedCount ? 'selected' : ''}`;
  
  // Image container
  const imageDiv = document.createElement('div');
  imageDiv.className = 'recipe-card-image';
  
  // Top badges container
  const topBadges = document.createElement('div');
  topBadges.className = 'recipe-top-badges';
  
  // Origin badge
  if (recipe.origin) {
    const originBadge = document.createElement('div');
    originBadge.className = 'recipe-badge-origin';
    originBadge.innerHTML = `${createIcon('Globe', 10).outerHTML} ${recipe.origin}`;
    topBadges.appendChild(originBadge);
  }
  
  // Difficulty badge
  if (recipe.difficulty) {
    const difficultyBadge = document.createElement('div');
    difficultyBadge.className = `recipe-badge-difficulty difficulty-${recipe.difficulty.toLowerCase()}`;
    difficultyBadge.textContent = recipe.difficulty;
    topBadges.appendChild(difficultyBadge);
  }
  
  imageDiv.appendChild(topBadges);
  
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
  
  // Info overlay with enhanced metadata
  const infoOverlay = document.createElement('div');
  infoOverlay.className = 'recipe-info-overlay';
  
  const timeInfo = [];
  if (recipe.prepTime) timeInfo.push(`Prep: ${recipe.prepTime}`);
  if (recipe.cookTime) timeInfo.push(`Cook: ${recipe.cookTime}`);
  const timeText = timeInfo.length > 0 ? timeInfo.join(' • ') : 'Time: N/A';
  
  infoOverlay.innerHTML = `
    <div class="recipe-info-badge">
      ${createIcon('Clock', 12).outerHTML} ${timeText}
    </div>
    <div class="recipe-info-badge">
      ${createIcon('Users', 12).outerHTML} ${recipe.servings}
    </div>
    ${recipe.cookingStyle ? `<div class="recipe-info-badge cooking-style-badge">
      ${getCookingStyleIcon(recipe.cookingStyle)} ${recipe.cookingStyle}
    </div>` : ''}
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
  
  // Tags
  if (recipe.tags && recipe.tags.length > 0) {
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'recipe-tags';
    recipe.tags.slice(0, 3).forEach(tag => {
      const tagChip = document.createElement('span');
      tagChip.className = 'tag-chip';
      tagChip.textContent = tag;
      tagsContainer.appendChild(tagChip);
    });
    content.appendChild(tagsContainer);
  }
  
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
 * Get cooking style icon
 */
function getCookingStyleIcon(style) {
  const iconMap = {
    'One Pot': createIcon('ChefHat', 12).outerHTML,
    'Traybake': createIcon('FileText', 12).outerHTML,
    'Stovetop': createIcon('Flame', 12).outerHTML,
    'Slow Cooker': createIcon('Clock', 12).outerHTML,
    'No Cook': createIcon('Check', 12).outerHTML,
    'Baking': createIcon('ChefHat', 12).outerHTML,
    'Roasting': createIcon('Flame', 12).outerHTML,
    'Grilling/BBQ': createIcon('Flame', 12).outerHTML,
    'Steaming': createIcon('ChefHat', 12).outerHTML
  };
  return iconMap[style] || createIcon('ChefHat', 12).outerHTML;
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
  
  const headerTitle = document.createElement('div');
  headerTitle.className = 'page-title-container';
  headerTitle.innerHTML = `
    ${createIcon('ChefHat', 28).outerHTML}
    <div>
      <h1 class="page-title">RecipeBliss</h1>
      <p class="page-subtitle">What are we cooking today?</p>
    </div>
  `;
  
  header.appendChild(headerTitle);
  
  const headerActions = document.createElement('div');
  headerActions.className = 'header-actions';
  headerActions.appendChild(createHeaderToggle());
  header.appendChild(headerActions);
  
  container.appendChild(header);
  
  // Search bar with filter button
  const searchContainer = document.createElement('div');
  searchContainer.className = 'search-container';
  const searchIcon = createIcon('Search', 20, 'search-icon');
  searchContainer.appendChild(searchIcon);
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search recipes, ingredients...';
  searchInput.className = 'search-input';
  searchInput.value = state.searchQuery || '';
  searchInput.oninput = (e) => {
    setState({ searchQuery: e.target.value });
  };
  searchContainer.appendChild(searchInput);
  
  // Filter button
  const filterBtn = document.createElement('button');
  filterBtn.className = 'filter-btn';
  filterBtn.innerHTML = createIcon('Filter', 20).outerHTML;
  const activeCount = getActiveFilterCount(state.filters);
  if (activeCount > 0) {
    const badge = document.createElement('span');
    badge.className = 'filter-badge';
    badge.textContent = activeCount;
    filterBtn.appendChild(badge);
  }
  filterBtn.onclick = () => setState({ showFilterPanel: !state.showFilterPanel });
  searchContainer.appendChild(filterBtn);
  
  container.appendChild(searchContainer);
  
  // Filter panel
  if (state.showFilterPanel) {
    const filterPanel = createFilterPanel();
    container.appendChild(filterPanel);
  }
  
  // Apply filters and search
  let displayRecipes = [...state.recipes];
  
  // Apply filters
  displayRecipes = filterRecipes(displayRecipes, state.filters);
  
  // Apply search
  if (state.searchQuery && state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase().trim();
    displayRecipes = displayRecipes.filter(recipe => {
      return recipe.title.toLowerCase().includes(query) ||
             recipe.description.toLowerCase().includes(query) ||
             recipe.category.toLowerCase().includes(query) ||
             recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query)) ||
             (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(query)));
    });
  }
  
  // Recipe cards container
  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'recipe-cards-grid';
  
  if (displayRecipes.length === 0) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `
      <p>No recipes found matching your criteria.</p>
    `;
    const clearBtn = createButton({
      text: 'Clear All Filters',
      onClick: () => {
        setState({
          filters: {
            difficulty: [],
            cookingStyle: [],
            tags: [],
            timeRange: [0, 180],
            calorieRange: [0, 1000],
            categories: []
          },
          searchQuery: ''
        });
      },
      variant: 'outline'
    });
    noResults.appendChild(clearBtn);
    cardsContainer.appendChild(noResults);
  } else {
    displayRecipes.forEach(recipe => {
      const card = createRecipeCard(
        recipe,
        state.selectedRecipes[recipe.id],
        toggleRecipeSelection,
        updateServingCount
      );
      cardsContainer.appendChild(card);
    });
  }
  
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

/**
 * Create filter panel
 */
function createFilterPanel() {
  const state = getState();
  const panel = document.createElement('div');
  panel.className = 'filter-panel';
  
  // Panel header
  const header = document.createElement('div');
  header.className = 'filter-panel-header';
  header.innerHTML = `
    <h3>${createIcon('Sliders', 20).outerHTML} Filters</h3>
    <button class="filter-clear-btn">Clear All</button>
  `;
  panel.appendChild(header);
  
  const clearBtn = header.querySelector('.filter-clear-btn');
  clearBtn.onclick = () => {
    setState({
      filters: {
        difficulty: [],
        cookingStyle: [],
        tags: [],
        timeRange: [0, 180],
        calorieRange: [0, 1000],
        categories: []
      }
    });
  };
  
  // Filter sections
  const content = document.createElement('div');
  content.className = 'filter-panel-content';
  
  // Difficulty filter
  content.appendChild(createCheckboxFilter(
    'Difficulty',
    ['Easy', 'Medium', 'Hard'],
    state.filters.difficulty,
    (selected) => {
      const newFilters = { ...state.filters, difficulty: selected };
      setState({ filters: newFilters });
    }
  ));
  
  // Cooking Style filter
  content.appendChild(createCheckboxFilter(
    'Cooking Style',
    ['One Pot', 'Traybake', 'Stovetop', 'Slow Cooker', 'No Cook', 'Baking', 'Roasting', 'Grilling/BBQ', 'Steaming'],
    state.filters.cookingStyle,
    (selected) => {
      const newFilters = { ...state.filters, cookingStyle: selected };
      setState({ filters: newFilters });
    }
  ));
  
  // Tags filter
  const allTags = getAllUniqueTags(state.recipes);
  content.appendChild(createCheckboxFilter(
    'Tags',
    allTags,
    state.filters.tags,
    (selected) => {
      const newFilters = { ...state.filters, tags: selected };
      setState({ filters: newFilters });
    }
  ));
  
  // Category filter
  const categories = ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Appetizer', 'Side', 'Snack', 'Dessert', 'Drink', 'Spice Mix', 'Sauce/Dip', 'Soup/Stew', 'Salad', 'Baking'];
  content.appendChild(createCheckboxFilter(
    'Category',
    categories,
    state.filters.categories,
    (selected) => {
      const newFilters = { ...state.filters, categories: selected };
      setState({ filters: newFilters });
    }
  ));
  
  // Time range filter
  content.appendChild(createRangeFilter(
    'Total Time (minutes)',
    0,
    180,
    state.filters.timeRange,
    (range) => {
      const newFilters = { ...state.filters, timeRange: range };
      setState({ filters: newFilters });
    }
  ));
  
  // Calorie range filter
  content.appendChild(createRangeFilter(
    'Calories',
    0,
    1000,
    state.filters.calorieRange,
    (range) => {
      const newFilters = { ...state.filters, calorieRange: range };
      setState({ filters: newFilters });
    }
  ));
  
  panel.appendChild(content);
  
  return panel;
}

/**
 * Create checkbox filter section
 */
function createCheckboxFilter(title, options, selectedOptions, onChange) {
  const section = document.createElement('div');
  section.className = 'filter-section';
  
  const titleEl = document.createElement('h4');
  titleEl.className = 'filter-section-title';
  titleEl.textContent = title;
  section.appendChild(titleEl);
  
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'filter-options';
  
  options.forEach(option => {
    const label = document.createElement('label');
    label.className = 'filter-checkbox-label';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selectedOptions.includes(option);
    checkbox.onchange = (e) => {
      let newSelected = [...selectedOptions];
      if (e.target.checked) {
        newSelected.push(option);
      } else {
        newSelected = newSelected.filter(item => item !== option);
      }
      onChange(newSelected);
    };
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(option));
    optionsContainer.appendChild(label);
  });
  
  section.appendChild(optionsContainer);
  return section;
}

/**
 * Create range filter section
 */
function createRangeFilter(title, min, max, currentRange, onChange) {
  const section = document.createElement('div');
  section.className = 'filter-section';
  
  const titleEl = document.createElement('h4');
  titleEl.className = 'filter-section-title';
  titleEl.textContent = `${title}: ${currentRange[0]} - ${currentRange[1]}`;
  section.appendChild(titleEl);
  
  const rangeContainer = document.createElement('div');
  rangeContainer.className = 'filter-range-container';
  
  // Min slider
  const minInput = document.createElement('input');
  minInput.type = 'range';
  minInput.min = min;
  minInput.max = max;
  minInput.value = currentRange[0];
  minInput.className = 'filter-range-input';
  minInput.oninput = (e) => {
    const newMin = parseInt(e.target.value);
    const newMax = Math.max(newMin, currentRange[1]);
    onChange([newMin, newMax]);
  };
  rangeContainer.appendChild(minInput);
  
  // Max slider
  const maxInput = document.createElement('input');
  maxInput.type = 'range';
  maxInput.min = min;
  maxInput.max = max;
  maxInput.value = currentRange[1];
  maxInput.className = 'filter-range-input';
  maxInput.oninput = (e) => {
    const newMax = parseInt(e.target.value);
    const newMin = Math.min(currentRange[0], newMax);
    onChange([newMin, newMax]);
  };
  rangeContainer.appendChild(maxInput);
  
  section.appendChild(rangeContainer);
  return section;
}
