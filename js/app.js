// Main application entry point
import { loadAllRecipes } from './data/recipeLoader.js';
import { getState, setState, subscribe, initState } from './state.js';
import { renderRecipesGrid } from './views/grid.js';
import { renderRecipeDetail } from './views/detail.js';
import { renderShoppingList } from './views/shopping.js';
import { createIcon } from './components/ui.js';
import { decodeBasket, clearUrlParams } from './utils/sharing.js';

/**
 * Initialize the application
 */
async function init() {
  try {
    // Load recipes
    const recipes = await loadAllRecipes();
    const urlParams = initState(recipes);
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('./sw.js');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
    
    // Subscribe to state changes
    subscribe(render);
    
    // Handle URL parameters
    if (urlParams.recipe) {
      // Auto-open recipe from URL
      const recipeId = parseInt(urlParams.recipe);
      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        setState({ 
          selectedRecipe: recipe,
          recipeViewMode: 'overview',
          currentStepIndex: 0
        });
      }
      clearUrlParams();
    } else if (urlParams.basket) {
      // Show basket import modal
      showBasketImportModal(urlParams.basket);
      clearUrlParams();
    }
    
    // Initial render
    render();
    
    // Render bottom navigation
    renderBottomNav();
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
    document.getElementById('app').innerHTML = `
      <div class="error-state">
        <h2>Failed to load recipes</h2>
        <p>Please refresh the page to try again.</p>
      </div>
    `;
  }
}

/**
 * Main render function - routes to appropriate view
 */
function render() {
  const state = getState();
  
  if (state.selectedRecipe) {
    renderRecipeDetail();
    hideBottomNav();
  } else if (state.activeTab === 'recipes') {
    renderRecipesGrid();
    showBottomNav();
  } else {
    renderShoppingList();
    showBottomNav();
  }
}

/**
 * Render bottom navigation tabs
 */
function renderBottomNav() {
  const nav = document.createElement('div');
  nav.id = 'bottom-nav';
  nav.className = 'bottom-nav';
  
  // Recipes tab
  const recipesTab = createTab({
    id: 'recipes',
    icon: 'ChefHat',
    label: 'Recipes'
  });
  nav.appendChild(recipesTab);
  
  // Shopping tab
  const shoppingTab = createTab({
    id: 'shopping',
    icon: 'ShoppingCart',
    label: 'Shop',
    showBadge: true
  });
  nav.appendChild(shoppingTab);
  
  document.body.appendChild(nav);
}

/**
 * Create navigation tab
 */
function createTab({ id, icon, label, showBadge = false }) {
  const state = getState();
  const tab = document.createElement('button');
  tab.className = `nav-tab ${state.activeTab === id ? 'active' : ''}`;
  tab.onclick = () => setState({ activeTab: id });
  
  const iconContainer = document.createElement('div');
  iconContainer.className = 'nav-tab-icon-container';
  
  iconContainer.appendChild(createIcon(icon, 24));
  
  // Always create badge element when showBadge is true
  if (showBadge) {
    const badge = document.createElement('span');
    badge.className = 'nav-badge';
    if (state.shoppingList.length > 0) {
      badge.classList.add('visible');
      badge.textContent = state.shoppingList.length;
    }
    iconContainer.appendChild(badge);
  }
  
  tab.appendChild(iconContainer);
  
  const labelEl = document.createElement('span');
  labelEl.className = 'nav-tab-label';
  labelEl.textContent = label;
  tab.appendChild(labelEl);
  
  return tab;
}

/**
 * Update bottom navigation state
 */
function updateBottomNav() {
  const state = getState();
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  
  // Update active state
  nav.querySelectorAll('.nav-tab').forEach((tab, index) => {
    const tabId = index === 0 ? 'recipes' : 'shopping';
    if (tabId === state.activeTab) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Update shopping badge
  const badge = nav.querySelector('.nav-badge');
  if (badge) {
    if (state.shoppingList.length > 0) {
      badge.textContent = state.shoppingList.length;
      badge.classList.add('visible');
    } else {
      badge.classList.remove('visible');
    }
  }
}

/**
 * Show bottom navigation
 */
function showBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (nav) {
    nav.style.display = 'flex';
    updateBottomNav();
  }
}

/**
 * Hide bottom navigation
 */
function hideBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (nav) nav.style.display = 'none';
}

/**
 * Show basket import modal
 * @param {string} encodedBasket - Encoded basket data from URL
 */
function showBasketImportModal(encodedBasket) {
  const decodedData = decodeBasket(encodedBasket);
  
  if (!decodedData) {
    alert('Invalid basket link. Please check the URL and try again.');
    return;
  }
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content basket-import-modal">
      <div class="modal-header">
        <h2>Import Shopping List</h2>
        <button class="modal-close-btn">${createIcon('X', 24).outerHTML}</button>
      </div>
      <div class="modal-body">
        <p class="import-message">
          ${createIcon('ShoppingCart', 20).outerHTML}
          <span>A shared shopping list with ${decodedData.items.length} items has been found.</span>
        </p>
        <p class="import-subtitle">What would you like to do?</p>
      </div>
      <div class="modal-actions import-actions">
        <button class="btn btn-outline import-btn" data-action="add">
          ${createIcon('Plus', 18).outerHTML}
          <span>Add to Current</span>
        </button>
        <button class="btn btn-primary import-btn" data-action="replace">
          ${createIcon('Download', 18).outerHTML}
          <span>Replace Basket</span>
        </button>
        <button class="btn btn-secondary import-btn" data-action="ignore">
          <span>Ignore</span>
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners
  const closeBtn = modal.querySelector('.modal-close-btn');
  closeBtn.onclick = () => document.body.removeChild(modal);
  
  const importBtns = modal.querySelectorAll('.import-btn');
  importBtns.forEach(btn => {
    btn.onclick = () => {
      const action = btn.getAttribute('data-action');
      handleBasketImport(action, decodedData);
      document.body.removeChild(modal);
    };
  });
  
  // Close on overlay click
  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  };
  
  document.body.appendChild(modal);
}

/**
 * Handle basket import action
 * @param {string} action - 'add', 'replace', or 'ignore'
 * @param {Object} decodedData - Decoded basket data
 */
function handleBasketImport(action, decodedData) {
  const state = getState();
  
  if (action === 'add') {
    // Add to current basket
    setState({
      shoppingList: [...state.shoppingList, ...decodedData.items],
      activeTab: 'shopping'
    });
  } else if (action === 'replace') {
    // Replace current basket
    setState({
      shoppingList: decodedData.items,
      selectedRecipes: decodedData.selectedRecipes,
      useMetric: decodedData.useMetric,
      activeTab: 'shopping'
    });
  }
  // If 'ignore', do nothing
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
