// Recipe detail view module
import { getState, setState } from '../state.js';
import { createIcon, createButton } from '../components/ui.js';
import { createHeaderToggle } from './grid.js';
import { getRecipeShareUrl, copyToClipboard } from '../utils/sharing.js';

/**
 * Render recipe detail view
 */
export function renderRecipeDetail() {
  const state = getState();
  const recipe = state.selectedRecipe;
  
  if (!recipe) return;
  
  if (state.recipeViewMode === 'step') {
    renderStepByStepView(recipe);
  } else {
    renderRecipeOverview(recipe);
  }
}

/**
 * Render recipe overview (main detail page)
 */
function renderRecipeOverview(recipe) {
  const state = getState();
  const container = document.getElementById('app');
  container.innerHTML = '';
  container.className = 'recipe-detail-view';
  
  // Hero section
  const hero = document.createElement('div');
  hero.className = 'recipe-hero';
  
  const backBtn = document.createElement('button');
  backBtn.className = 'back-btn';
  backBtn.appendChild(createIcon('ArrowLeft', 24));
  backBtn.onclick = () => setState({ selectedRecipe: null });
  hero.appendChild(backBtn);
  
  // Share button
  const shareBtn = document.createElement('button');
  shareBtn.className = 'share-btn';
  shareBtn.appendChild(createIcon('Share2', 20));
  shareBtn.onclick = () => showRecipeShareModal(recipe);
  hero.appendChild(shareBtn);
  
  const heroContent = document.createElement('div');
  heroContent.className = 'hero-content';
  
  // Hero badges with difficulty and cooking style
  const badges = [`<div class="badge badge-category">${recipe.category}</div>`];
  if (recipe.origin) {
    badges.push(`<div class="badge badge-origin">${recipe.origin}</div>`);
  }
  if (recipe.difficulty) {
    badges.push(`<div class="badge badge-difficulty difficulty-${recipe.difficulty.toLowerCase()}">${recipe.difficulty}</div>`);
  }
  if (recipe.cookingStyle) {
    badges.push(`<div class="badge badge-cooking-style">${recipe.cookingStyle}</div>`);
  }
  
  heroContent.innerHTML = `
    <div class="hero-badges">
      ${badges.join('')}
    </div>
    <h1 class="hero-title">${recipe.title}</h1>
  `;
  hero.appendChild(heroContent);
  container.appendChild(hero);
  
  // Stats bar with separate prep and cook time
  const stats = document.createElement('div');
  stats.className = 'recipe-stats';
  
  const statsHtml = [];
  if (recipe.prepTime) {
    statsHtml.push(`
      <div class="stat">
        ${createIcon('Clock', 20).outerHTML}
        <span class="stat-label">PREP</span>
        <span class="stat-value">${recipe.prepTime}</span>
      </div>
    `);
  }
  if (recipe.cookTime) {
    statsHtml.push(`
      <div class="stat">
        ${createIcon('Flame', 20).outerHTML}
        <span class="stat-label">COOK</span>
        <span class="stat-value">${recipe.cookTime}</span>
      </div>
    `);
  }
  statsHtml.push(`
    <div class="stat">
      ${createIcon('Users', 20).outerHTML}
      <span class="stat-label">SERVES</span>
      <span class="stat-value">${recipe.servings} pp</span>
    </div>
    <div class="stat">
      ${createIcon('FileText', 20).outerHTML}
      <span class="stat-label">STEPS</span>
      <span class="stat-value">${recipe.steps.length}</span>
    </div>
  `);
  
  stats.innerHTML = statsHtml.join('');
  container.appendChild(stats);
  
  // Content
  const content = document.createElement('div');
  content.className = 'recipe-content';
  
  // Description
  const desc = document.createElement('p');
  desc.className = 'recipe-description';
  desc.textContent = recipe.description;
  content.appendChild(desc);
  
  // Tags display
  if (recipe.tags && recipe.tags.length > 0) {
    const tagsSection = document.createElement('div');
    tagsSection.className = 'recipe-tags-section';
    recipe.tags.forEach(tag => {
      const tagChip = document.createElement('span');
      tagChip.className = 'tag-chip-large';
      tagChip.innerHTML = `${createIcon('Tag', 14).outerHTML} ${tag}`;
      tagsSection.appendChild(tagChip);
    });
    content.appendChild(tagsSection);
  }
  
  // Action buttons
  const actions = document.createElement('div');
  actions.className = 'recipe-actions';
  
  const startBtn = createButton({
    text: 'Start Cooking',
    icon: 'Play',
    onClick: () => setState({ 
      currentStepIndex: 0, 
      recipeViewMode: 'step' 
    }),
    variant: 'primary',
    className: 'action-btn-primary'
  });
  
  const addBtn = createButton({
    text: 'Add Items',
    icon: 'ShoppingCart',
    onClick: () => addIngredientsToShoppingList(recipe.ingredients),
    variant: 'outline',
    className: 'action-btn-outline'
  });
  
  actions.appendChild(startBtn);
  actions.appendChild(addBtn);
  content.appendChild(actions);
  
  // Ingredients
  const ingredientsSection = document.createElement('div');
  ingredientsSection.className = 'ingredients-section';
  ingredientsSection.innerHTML = `
    <h2 class="section-title">
      Ingredients <span class="section-count">(${recipe.ingredients.length})</span>
    </h2>
  `;
  
  const ingredientsList = document.createElement('div');
  ingredientsList.className = 'ingredients-list';
  
  recipe.ingredients.forEach((ing, idx) => {
    const item = document.createElement('div');
    item.className = 'ingredient-item';
    item.innerHTML = `
      <span class="ingredient-name">${ing.name}</span>
      <span class="ingredient-amount">${getAmount(ing)}</span>
    `;
    ingredientsList.appendChild(item);
  });
  
  ingredientsSection.appendChild(ingredientsList);
  content.appendChild(ingredientsSection);
  
  // Method
  const methodSection = document.createElement('div');
  methodSection.className = 'method-section';
  methodSection.innerHTML = '<h2 class="section-title">Method</h2>';
  
  const methodList = document.createElement('div');
  methodList.className = 'method-list';
  
  recipe.steps.forEach((step, idx) => {
    const stepItem = document.createElement('div');
    stepItem.className = 'method-step';
    stepItem.innerHTML = `
      <div class="step-number">${idx + 1}</div>
      <p class="step-text">${step}</p>
    `;
    methodList.appendChild(stepItem);
  });
  
  methodSection.appendChild(methodList);
  content.appendChild(methodSection);
  
  // Chef's Tips - Enhanced expandable cards
  if (recipe.tips && recipe.tips.length > 0) {
    const tipsSection = document.createElement('div');
    tipsSection.className = 'tips-section';
    tipsSection.innerHTML = `
      <h2 class="section-title">
        ${createIcon('Lightbulb', 20).outerHTML}
        Chef's Tips
      </h2>
    `;
    
    const tipsContainer = document.createElement('div');
    tipsContainer.className = 'tips-container';
    
    recipe.tips.forEach((tip, idx) => {
      const tipCard = document.createElement('div');
      tipCard.className = 'tip-card';
      tipCard.innerHTML = `
        <div class="tip-icon">${createIcon('Lightbulb', 16).outerHTML}</div>
        <div class="tip-content">
          <p class="tip-text">${tip}</p>
        </div>
      `;
      tipsContainer.appendChild(tipCard);
    });
    
    tipsSection.appendChild(tipsContainer);
    content.appendChild(tipsSection);
  }
  
  container.appendChild(content);
}

/**
 * Render step-by-step cooking mode
 */
function renderStepByStepView(recipe) {
  const state = getState();
  const container = document.getElementById('app');
  container.innerHTML = '';
  container.className = 'step-by-step-view';
  
  const step = recipe.steps[state.currentStepIndex];
  const progress = ((state.currentStepIndex + 1) / recipe.steps.length) * 100;
  
  // Header
  const header = document.createElement('div');
  header.className = 'step-header';
  
  const backBtn = document.createElement('button');
  backBtn.className = 'back-btn-minimal';
  backBtn.appendChild(createIcon('ArrowLeft', 24));
  backBtn.onclick = () => setState({ recipeViewMode: 'overview' });
  header.appendChild(backBtn);
  
  const stepCounter = document.createElement('div');
  stepCounter.className = 'step-counter';
  stepCounter.textContent = `Step ${state.currentStepIndex + 1} of ${recipe.steps.length}`;
  header.appendChild(stepCounter);
  
  const spacer = document.createElement('div');
  spacer.style.width = '32px';
  header.appendChild(spacer);
  
  container.appendChild(header);
  
  // Progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'progress-bar-container';
  progressBar.innerHTML = `<div class="progress-bar" style="width: ${progress}%"></div>`;
  container.appendChild(progressBar);
  
  // Step content
  const stepContent = document.createElement('div');
  stepContent.className = 'step-content';
  stepContent.innerHTML = `
    <div class="step-number-large">${state.currentStepIndex + 1}</div>
    <h2 class="step-text-large">${step}</h2>
  `;
  container.appendChild(stepContent);
  
  // Navigation
  const nav = document.createElement('div');
  nav.className = 'step-navigation';
  
  const prevBtn = createButton({
    text: 'Previous',
    onClick: () => setState({ 
      currentStepIndex: Math.max(0, state.currentStepIndex - 1) 
    }),
    variant: 'secondary',
    className: state.currentStepIndex === 0 ? 'disabled' : ''
  });
  
  let nextBtn;
  if (state.currentStepIndex < recipe.steps.length - 1) {
    nextBtn = createButton({
      text: 'Next Step',
      icon: 'ArrowRight',
      onClick: () => setState({ 
        currentStepIndex: state.currentStepIndex + 1 
      }),
      variant: 'primary'
    });
  } else {
    nextBtn = createButton({
      text: 'Finish',
      icon: 'CheckCircle2',
      onClick: () => setState({ recipeViewMode: 'overview' }),
      variant: 'primary',
      className: 'btn-finish'
    });
  }
  
  nav.appendChild(prevBtn);
  nav.appendChild(nextBtn);
  container.appendChild(nav);
}

/**
 * Get amount based on metric preference
 */
function getAmount(item) {
  const state = getState();
  return state.useMetric ? item.amountMetric : item.amount;
}

/**
 * Add ingredients to shopping list
 */
function addIngredientsToShoppingList(ingredients) {
  const state = getState();
  const newItems = ingredients.map(ing => ({
    ...ing,
    id: Date.now() + Math.random(),
    checked: false
  }));
  
  setState({
    shoppingList: [...state.shoppingList, ...newItems],
    activeTab: 'shopping',
    selectedRecipe: null
  });
}

/**
 * Show recipe share modal
 */
function showRecipeShareModal(recipe) {
  const shareUrl = getRecipeShareUrl(recipe.id);
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content share-modal">
      <div class="modal-header">
        <h2>Share Recipe</h2>
        <button class="modal-close-btn">${createIcon('X', 24).outerHTML}</button>
      </div>
      <div class="modal-body">
        <p class="share-title">${recipe.title}</p>
        <div class="share-url-container">
          <input type="text" class="share-url-input" value="${shareUrl}" readonly />
          <button class="btn btn-primary copy-btn">
            ${createIcon('Copy', 18).outerHTML}
            <span>Copy</span>
          </button>
        </div>
        <p class="share-hint">Share this link with friends to let them view this recipe!</p>
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
