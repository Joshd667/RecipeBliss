// Recipe grid view module
import { getState, setState } from '../state.js';
import { scaleString } from '../utils/scaling.js';
import { createIcon, createButton } from '../components/ui.js';
import { escapeHtml, setBackgroundImage } from '../utils/helpers.js';
import { filterRecipes, getAllUniqueTags, getActiveFilterCount } from '../utils/filters.js';

/**
 * Create recipe card element
 */
function createRecipeCard(recipe, selectedCount, onToggleSelect, onUpdateCount) {
  const card = document.createElement('div');
  card.className = `card recipe-card ${selectedCount ? 'selected' : ''}`;
  const state = getState();
  const isFavorite = state.favorites.includes(recipe.id);
  const userRating = state.ratings[recipe.id] || 0;

  // Image container
  const imageDiv = document.createElement('div');
  imageDiv.className = 'recipe-card-image';

  // Set background image
  setBackgroundImage(imageDiv, recipe.image);

  // Selection toggle button (Floating Top Right)
  const selectBtn = document.createElement('button');
  selectBtn.className = `recipe-select-btn ${selectedCount ? 'selected' : ''}`;
  selectBtn.setAttribute('aria-label', selectedCount ? 'Unselect recipe' : 'Select recipe');
  selectBtn.innerHTML = selectedCount ? createIcon('Check', 18).outerHTML : createIcon('Plus', 18).outerHTML;
  selectBtn.onclick = (e) => {
    e.stopPropagation();
    onToggleSelect(e, recipe.id, recipe.servings);
  };
  imageDiv.appendChild(selectBtn);

  // Favorite Button (Floating Top Left)
  const favBtn = document.createElement('button');
  favBtn.className = `recipe-fav-btn ${isFavorite ? 'active' : ''}`;
  favBtn.innerHTML = createIcon('Heart', 18, isFavorite ? 'filled-heart' : '').outerHTML;
  favBtn.onclick = (e) => {
    e.stopPropagation();
    const currentFavs = getState().favorites;
    const newFavs = isFavorite
      ? currentFavs.filter(id => id !== recipe.id)
      : [...currentFavs, recipe.id];
    setState({ favorites: newFavs });
  };
  imageDiv.appendChild(favBtn);

  // Origin Badge (Floating Top Left)
  // Origin Badge (Floating Bottom Left now, to make room for heart)
  if (recipe.origin) {
    const originBadge = document.createElement('div');
    originBadge.className = 'recipe-badge-origin';
    originBadge.style.top = 'auto'; // Reset top
    originBadge.style.bottom = '0.75rem'; // Move to bottom
    originBadge.innerHTML = `${createIcon('Globe', 12).outerHTML} ${recipe.origin}`;
    imageDiv.appendChild(originBadge);
  }

  // Count control (only if selected) - positioned over image
  if (selectedCount) {
    const countControl = createCountControl(selectedCount, recipe.id, onUpdateCount);
    imageDiv.appendChild(countControl);
  }

  card.appendChild(imageDiv);

  // Card Content
  const content = document.createElement('div');
  content.className = 'recipe-card-content';

  // Row 1: Category & Time
  const metaRow = document.createElement('div');
  metaRow.style.display = 'flex';
  metaRow.style.justifyContent = 'space-between';
  metaRow.style.alignItems = 'center';
  metaRow.style.marginBottom = '0.5rem';

  // Show Rating if exists
  if (userRating > 0) {
    const ratingBadge = document.createElement('span');
    ratingBadge.className = 'recipe-rating-badge';
    ratingBadge.innerHTML = `${createIcon('Star', 12, 'star-filled').outerHTML} ${userRating}`;
    // Insert rating before category or after? Let's put it at the start
    // Actually, let's just append it to metaRow or insert it
    ratingBadge.style.marginRight = '0.5rem';
    ratingBadge.style.display = 'flex';
    ratingBadge.style.alignItems = 'center';
    ratingBadge.style.gap = '0.25rem';
    ratingBadge.style.color = 'var(--color-accent-500)';
    ratingBadge.style.fontWeight = '600';
    ratingBadge.style.fontSize = '0.75rem';
    metaRow.appendChild(ratingBadge);
  }

  const category = document.createElement('span');
  category.className = 'recipe-category';
  category.textContent = recipe.category;

  const totalMinutes = (parseInt(recipe.prepTime) || 0) + (parseInt(recipe.cookTime) || 0);
  // Simple heuristic for time display if totalMinutes is available, else use prep/cook string
  const timeText = totalMinutes > 0 ? `${totalMinutes} min` : (recipe.cookTime || recipe.prepTime || 'N/A');

  const timeBadge = document.createElement('span');
  timeBadge.className = 'recipe-meta-text';
  timeBadge.style.fontSize = '0.75rem';
  timeBadge.style.color = 'var(--color-surface-500)';
  timeBadge.style.display = 'flex';
  timeBadge.style.alignItems = 'center';
  timeBadge.style.gap = '0.25rem';
  timeBadge.innerHTML = `${createIcon('Clock', 12).outerHTML} ${timeText}`;

  metaRow.appendChild(category);
  metaRow.appendChild(timeBadge);
  content.appendChild(metaRow);

  // Row 2: Title
  const title = document.createElement('h3');
  title.className = 'recipe-title';
  title.textContent = recipe.title;
  content.appendChild(title);

  // Row 3: Badges — Difficulty (color-coded), Cooking Style, then Tags
  const tagsRow = document.createElement('div');
  tagsRow.className = 'recipe-tags';

  if (recipe.difficulty) {
    const diffBadge = document.createElement('span');
    diffBadge.className = `recipe-badge difficulty-${recipe.difficulty.toLowerCase()}`;
    diffBadge.textContent = recipe.difficulty;
    tagsRow.appendChild(diffBadge);
  }

  if (recipe.cookingStyle) {
    const styleBadge = document.createElement('span');
    styleBadge.className = 'recipe-badge badge-cooking-style';
    styleBadge.innerHTML = `${getCookingStyleIcon(recipe.cookingStyle)} ${recipe.cookingStyle}`;
    tagsRow.appendChild(styleBadge);
  }

  if (recipe.tags && recipe.tags.length > 0) {
    recipe.tags.slice(0, 2).forEach(tag => {
      const tagChip = document.createElement('span');
      tagChip.className = 'recipe-badge badge-tag';
      tagChip.textContent = tag;
      tagsRow.appendChild(tagChip);
    });
  }
  content.appendChild(tagsRow);

  // Row 4: Key Stats (Calories, Ingredients, Servings)
  const statsRow = document.createElement('div');
  statsRow.className = 'recipe-meta';
  statsRow.style.paddingTop = '0.75rem';
  statsRow.style.borderTop = '1px solid var(--color-surface-100)';
  statsRow.style.justifyContent = 'space-between';

  const stats = [
    { icon: 'Flame', val: `${recipe.calories || '-'} kcal` },
    { icon: 'List', val: `${recipe.ingredients.length} items` },
    { icon: 'Users', val: `${recipe.servings} pp` }
  ];

  stats.forEach(stat => {
    const s = document.createElement('span');
    s.style.display = 'flex';
    s.style.alignItems = 'center';
    s.style.gap = '0.375rem';
    s.innerHTML = `${createIcon(stat.icon, 14).outerHTML} ${stat.val}`;
    statsRow.appendChild(s);
  });

  content.appendChild(statsRow);
  card.appendChild(content);

  // Check interaction
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
 * Render the full-page Settings view
 */
export function renderSettingsPage() {
  const state = getState();
  const container = document.getElementById('app');
  container.innerHTML = '';
  container.className = 'settings-view';

  // Header
  const header = document.createElement('div');
  header.className = 'settings-header';

  const backBtn = document.createElement('button');
  // backBtn.className = 'settings-back-btn';
  // backBtn.innerHTML = createIcon('ArrowLeft', 22).outerHTML;
  // backBtn.onclick = () => setState({ showSettings: false });
  // header.appendChild(backBtn);

  const title = document.createElement('h1');
  title.className = 'settings-title';
  title.textContent = 'Settings';
  header.appendChild(title);

  const spacer = document.createElement('div');
  spacer.style.width = '2.75rem';
  header.appendChild(spacer);

  container.appendChild(header);

  // Settings content
  const content = document.createElement('div');
  content.className = 'settings-content';

  // — Measurement Section —
  const measureSection = document.createElement('div');
  measureSection.className = 'settings-section';

  const measureLabel = document.createElement('div');
  measureLabel.className = 'settings-section-label';
  measureLabel.textContent = 'Measurement System';
  measureSection.appendChild(measureLabel);

  const measureGroup = document.createElement('div');
  measureGroup.className = 'settings-option-group';

  const options = [
    { label: 'US Customary', value: false, desc: 'Cups, oz, tablespoons' },
    { label: 'UK Metric', value: true, desc: 'Grams, ml, litres' }
  ];

  options.forEach(opt => {
    const row = document.createElement('button');
    row.className = `settings-option ${state.useMetric === opt.value ? 'active' : ''}`;
    row.innerHTML = `
      <div class="settings-option-text">
        <span class="settings-option-label">${opt.label}</span>
        <span class="settings-option-desc">${opt.desc}</span>
      </div>
      <div class="settings-radio ${state.useMetric === opt.value ? 'active' : ''}"></div>
    `;
    row.onclick = () => setState({ useMetric: opt.value });
    measureGroup.appendChild(row);
  });

  measureSection.appendChild(measureGroup);
  content.appendChild(measureSection);

  // — Theme Section —
  const themeSection = document.createElement('div');
  themeSection.className = 'settings-section';

  const themeLabel = document.createElement('div');
  themeLabel.className = 'settings-section-label';
  themeLabel.textContent = 'Appearance';
  themeSection.appendChild(themeLabel);

  const themeGroup = document.createElement('div');
  themeGroup.className = 'settings-option-group';

  const themeOptions = [
    { label: 'Light', value: 'light', icon: 'Sun' },
    { label: 'Dark', value: 'dark', icon: 'Moon' },
    { label: 'System', value: 'system', icon: 'Monitor' }
  ];

  themeOptions.forEach(opt => {
    const row = document.createElement('button');
    row.className = `settings-option ${state.darkModePreference === opt.value ? 'active' : ''}`;
    row.innerHTML = `
      <div class="settings-option-text">
        ${createIcon(opt.icon, 18).outerHTML}
        <span class="settings-option-label">${opt.label}</span>
      </div>
      <div class="settings-radio ${state.darkModePreference === opt.value ? 'active' : ''}"></div>
    `;
    row.onclick = () => setState({ darkModePreference: opt.value });
    themeGroup.appendChild(row);
  });

  themeSection.appendChild(themeGroup);
  content.appendChild(themeSection);


  // — Data Management —
  const dataSection = document.createElement('div');
  dataSection.className = 'settings-section';
  dataSection.innerHTML = `<div class="settings-section-label">Data Management</div>`;

  const exportBtn = createButton({
    text: 'Export All Data (JSON)',
    icon: 'Download',
    variant: 'outline',
    className: 'btn-block',
    onClick: async () => {
      // Import needed potentially for user recipes
      const { getAllUserRecipes } = await import('../db.js');
      const userRecipes = await getAllUserRecipes();

      const exportObj = {
        favorites: state.favorites,
        ratings: state.ratings,
        comments: state.comments,
        userRecipes: userRecipes,
        shoppingList: state.shoppingList,
        settings: {
          useMetric: state.useMetric,
          darkMode: state.darkModePreference
        },
        exportDate: new Date().toISOString()
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "recipebliss_backup.json");
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  });

  dataSection.appendChild(exportBtn);
  content.appendChild(dataSection);

  container.appendChild(content);
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
      <h1 class="page-title">${state.activeTab === 'favorites' ? 'Favorites' : 'RecipeBliss'}</h1>
      <p class="page-subtitle">${state.activeTab === 'favorites' ? 'Your saved collections' : 'What are we cooking today?'}</p>
    </div>
  `;

  header.appendChild(headerTitle);

  const headerActions = document.createElement('div');
  headerActions.className = 'header-actions';
  // headerActions.appendChild(createHeaderToggle()); // Removed as it's now in bottom nav
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
  let searchDebounceTimer = null;
  searchInput.oninput = (e) => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      setState({ searchQuery: e.target.value });
    }, 250);
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

  // Filter by favorites if active tab is favorites
  if (state.activeTab === 'favorites') {
    displayRecipes = displayRecipes.filter(r => state.favorites.includes(r.id));
  }

  // Apply filters
  displayRecipes = filterRecipes(displayRecipes, state.filters, state.ratings);

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
 * Create filter panel (Drawer)
 */
function createFilterPanel() {
  const state = getState();

  // Work with a local copy of filters so we don't re-render the whole app
  let localFilters = JSON.parse(JSON.stringify(state.filters));

  // Create modal backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'filter-modal-backdrop';
  backdrop.style.justifyContent = 'flex-end';
  backdrop.onclick = () => {
    // Apply filters when closing by clicking backdrop
    setState({ filters: localFilters, showFilterPanel: false });
  };

  const panel = document.createElement('div');
  panel.className = 'filter-panel';
  panel.onclick = (e) => e.stopPropagation();

  // Panel header
  const header = document.createElement('div');
  header.className = 'filter-panel-header';

  const headerLeft = document.createElement('div');
  headerLeft.innerHTML = `<h3 style="font-family: var(--font-heading);">${createIcon('Sliders', 20).outerHTML} Filters</h3>`;

  const headerRight = document.createElement('div');
  headerRight.className = 'filter-panel-header-actions';

  const clearBtn = document.createElement('button');
  clearBtn.className = 'filter-clear-btn';
  clearBtn.textContent = 'Reset';
  clearBtn.onclick = () => {
    localFilters = {
      difficulty: [],
      cookingStyle: [],
      tags: [],
      minRating: 0,
      timeRange: [0, 180],
      calorieRange: [0, 1000],
      categories: []
    };
    // Re-render filter content
    renderFilterContent(content, localFilters, state.recipes);
  };

  const closeBtn = document.createElement('button');
  closeBtn.className = 'filter-close-btn';
  closeBtn.innerHTML = createIcon('X', 24).outerHTML;
  closeBtn.setAttribute('aria-label', 'Close filters');
  closeBtn.onclick = () => setState({ filters: localFilters, showFilterPanel: false });

  headerRight.appendChild(clearBtn);
  headerRight.appendChild(closeBtn);

  header.appendChild(headerLeft);
  header.appendChild(headerRight);
  panel.appendChild(header);

  // Filter sections
  const content = document.createElement('div');
  content.className = 'filter-panel-content';

  renderFilterContent(content, localFilters, state.recipes);

  panel.appendChild(content);

  // Apply Button (Floating bottom)
  const footer = document.createElement('div');
  footer.className = 'filter-panel-footer';

  const applyBtn = createButton({
    text: 'Show Results',
    variant: 'primary',
    className: 'btn-block',
    onClick: () => setState({ filters: localFilters, showFilterPanel: false })
  });
  applyBtn.style.width = '100%';
  applyBtn.style.justifyContent = 'center';

  footer.appendChild(applyBtn);
  panel.appendChild(footer);

  backdrop.appendChild(panel);

  return backdrop;

  // Helper: render filter content into container
  function renderFilterContent(container, filters, recipes) {
    container.innerHTML = '';

    // Rating Filter
    container.appendChild(createRatingFilter(
      'Minimum Rating',
      filters.minRating,
      (rating) => { filters.minRating = rating; }
    ));

    // Time range filter (sliders at top)
    container.appendChild(createRangeFilter(
      'Total Time (minutes)',
      0,
      180,
      filters.timeRange,
      (range) => { filters.timeRange = range; }
    ));

    // Calorie range filter
    container.appendChild(createRangeFilter(
      'Calories',
      0,
      1000,
      filters.calorieRange,
      (range) => { filters.calorieRange = range; }
    ));

    // Category filter
    const categories = ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Appetizer', 'Side', 'Snack', 'Dessert', 'Drink', 'Spice Mix', 'Sauce/Dip', 'Soup/Stew', 'Salad', 'Baking'];
    container.appendChild(createCollapsibleCheckboxFilter(
      'Category',
      categories,
      filters.categories,
      (selected) => { filters.categories = selected; }
    ));

    // Difficulty filter
    container.appendChild(createCollapsibleCheckboxFilter(
      'Difficulty',
      ['Easy', 'Medium', 'Hard'],
      filters.difficulty,
      (selected) => { filters.difficulty = selected; },
      true // start expanded
    ));

    // Cooking Style filter
    container.appendChild(createCollapsibleCheckboxFilter(
      'Cooking Style',
      ['One Pot', 'Traybake', 'Stovetop', 'Slow Cooker', 'No Cook', 'Baking', 'Roasting', 'Grilling/BBQ', 'Steaming'],
      filters.cookingStyle,
      (selected) => { filters.cookingStyle = selected; }
    ));

    // Tags filter
    const allTags = getAllUniqueTags(recipes);
    container.appendChild(createCollapsibleCheckboxFilter(
      'Tags',
      allTags,
      filters.tags,
      (selected) => { filters.tags = selected; }
    ));
  }
}

/**
 * Create rating filter (star buttons)
 */
function createRatingFilter(title, currentRating, onChange) {
  const section = document.createElement('div');
  section.className = 'filter-section';

  const header = document.createElement('div');
  header.className = 'filter-section-header';
  header.innerHTML = `<span class="filter-section-title">${title}</span>`;
  section.appendChild(header);

  const starsContainer = document.createElement('div');
  starsContainer.style.display = 'flex';
  starsContainer.style.gap = '0.5rem';
  starsContainer.style.padding = '0.5rem 0';

  [1, 2, 3, 4, 5].forEach(star => {
    const btn = document.createElement('button');
    btn.className = `star-filter-btn ${star <= currentRating ? 'active' : ''}`;
    btn.style.background = 'none';
    btn.style.border = 'none';
    btn.style.cursor = 'pointer';
    btn.style.padding = '0.25rem';
    btn.style.color = star <= currentRating ? 'var(--color-accent-400)' : 'var(--color-surface-300)';
    btn.innerHTML = createIcon('Star', 24, star <= currentRating ? 'star-filled' : '').outerHTML;

    btn.onclick = () => {
      // Toggle off if clicking the same rating? No, standard logic is set to X.
      // To clear, user uses "Reset" button.
      onChange(star);
      // Re-rendering happens when Apply is clicked or implicitly via local state update logic in parent

      // Update visual state immediately for feedback within this modal instance (which uses localFilters)
      // We need to re-render the whole filter context or just update stars. 
      // Since renderFilterContent re-runs on reset, but here we are inside the DOM.
      // Easiest is to update all buttons in this container.
      const buttons = starsContainer.querySelectorAll('button');
      buttons.forEach((b, idx) => {
        const s = idx + 1;
        const isActive = s <= star;
        b.style.color = isActive ? 'var(--color-accent-400)' : 'var(--color-surface-300)';
        // Update icon fill
        b.innerHTML = createIcon('Star', 24, isActive ? 'star-filled' : '').outerHTML;
      });
    };

    starsContainer.appendChild(btn);
  });

  section.appendChild(starsContainer);
  return section;
}

/**
 * Create collapsible checkbox filter section
 */
function createCollapsibleCheckboxFilter(title, options, selectedOptions, onChange, startExpanded = false) {
  const section = document.createElement('div');
  section.className = 'filter-section';

  const activeCount = selectedOptions.length;

  // Clickable title/header
  const titleRow = document.createElement('button');
  titleRow.className = 'filter-section-header';
  titleRow.innerHTML = `
    <span class="filter-section-title">${title}${activeCount > 0 ? ` <span class="filter-count">${activeCount}</span>` : ''}</span>
    <span class="filter-chevron ${startExpanded ? 'expanded' : ''}">${createIcon('ChevronRight', 16).outerHTML}</span>
  `;

  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'filter-options-wrap';
  optionsContainer.style.display = startExpanded ? 'flex' : 'none';

  titleRow.onclick = () => {
    const isOpen = optionsContainer.style.display !== 'none';
    optionsContainer.style.display = isOpen ? 'none' : 'flex';
    titleRow.querySelector('.filter-chevron').classList.toggle('expanded', !isOpen);
  };

  section.appendChild(titleRow);

  // Options as pill-toggle buttons
  options.forEach(option => {
    const pill = document.createElement('button');
    pill.className = `filter-pill ${selectedOptions.includes(option) ? 'active' : ''}`;
    pill.textContent = option;
    pill.onclick = () => {
      let newSelected = [...selectedOptions];
      if (newSelected.includes(option)) {
        newSelected = newSelected.filter(item => item !== option);
        pill.classList.remove('active');
      } else {
        newSelected.push(option);
        pill.classList.add('active');
      }
      // Update the reference in-place
      selectedOptions.length = 0;
      selectedOptions.push(...newSelected);
      onChange(newSelected);

      // Update count in title
      const countEl = titleRow.querySelector('.filter-count');
      if (newSelected.length > 0) {
        if (countEl) {
          countEl.textContent = newSelected.length;
        } else {
          const titleSpan = titleRow.querySelector('.filter-section-title');
          titleSpan.innerHTML = `${title} <span class="filter-count">${newSelected.length}</span>`;
        }
      } else if (countEl) {
        countEl.remove();
      }
    };
    optionsContainer.appendChild(pill);
  });

  section.appendChild(optionsContainer);
  return section;
}



/**
 * Create dual-handle range filter section
 */
function createRangeFilter(title, min, max, currentRange, onChange) {
  const section = document.createElement('div');
  section.className = 'filter-section';

  const header = document.createElement('div');
  header.className = 'range-header';

  const titleEl = document.createElement('h4');
  titleEl.className = 'filter-section-title';
  titleEl.style.marginBottom = '0';

  const valueLabel = document.createElement('span');
  valueLabel.className = 'range-value-label';

  const updateLabels = () => {
    titleEl.textContent = title;
    const maxLabel = currentRange[1] >= max ? `${max}+` : currentRange[1];
    valueLabel.textContent = `${currentRange[0]} – ${maxLabel}`;
  };
  updateLabels();

  header.appendChild(titleEl);
  header.appendChild(valueLabel);
  section.appendChild(header);

  // Dual-range slider container
  const sliderWrap = document.createElement('div');
  sliderWrap.className = 'dual-range-wrap';

  // Track background
  const track = document.createElement('div');
  track.className = 'dual-range-track';

  // Fill bar (between the two handles)
  const fill = document.createElement('div');
  fill.className = 'dual-range-fill';
  track.appendChild(fill);
  sliderWrap.appendChild(track);

  const updateFill = () => {
    const leftPct = ((currentRange[0] - min) / (max - min)) * 100;
    const rightPct = ((currentRange[1] - min) / (max - min)) * 100;
    fill.style.left = leftPct + '%';
    fill.style.width = (rightPct - leftPct) + '%';
  };
  updateFill();

  // Min handle
  const minInput = document.createElement('input');
  minInput.type = 'range';
  minInput.min = min;
  minInput.max = max;
  minInput.value = currentRange[0];
  minInput.className = 'dual-range-input';
  minInput.oninput = (e) => {
    let newMin = parseInt(e.target.value);
    if (newMin > currentRange[1]) newMin = currentRange[1];
    currentRange[0] = newMin;
    e.target.value = newMin;
    onChange(currentRange);
    updateLabels();
    updateFill();
  };
  sliderWrap.appendChild(minInput);

  // Max handle
  const maxInput = document.createElement('input');
  maxInput.type = 'range';
  maxInput.min = min;
  maxInput.max = max;
  maxInput.value = currentRange[1];
  maxInput.className = 'dual-range-input';
  maxInput.oninput = (e) => {
    let newMax = parseInt(e.target.value);
    if (newMax < currentRange[0]) newMax = currentRange[0];
    currentRange[1] = newMax;
    e.target.value = newMax;
    onChange(currentRange);
    updateLabels();
    updateFill();
  };
  sliderWrap.appendChild(maxInput);

  section.appendChild(sliderWrap);

  // Min/Max labels below
  const rangeLabels = document.createElement('div');
  rangeLabels.className = 'range-min-max';
  rangeLabels.innerHTML = `<span>${min}</span><span>${max}+</span>`;
  section.appendChild(rangeLabels);

  return section;
}
