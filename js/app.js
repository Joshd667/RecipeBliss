// Main application entry point
import { loadAllRecipes } from './data/recipeLoader.js';
import { getState, setState, subscribe, initState } from './state.js';
import { renderRecipesGrid } from './views/grid.js';
import { renderRecipeDetail } from './views/detail.js';
import { renderShoppingList } from './views/shopping.js';
import { createIcon } from './components/ui.js';

/**
 * Initialize the application
 */
async function init() {
  try {
    // Load recipes
    const recipes = await loadAllRecipes();
    initState(recipes);
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('./sw.js');
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
    
    // Subscribe to state changes
    subscribe(render);
    
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

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
