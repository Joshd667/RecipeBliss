// Recipe detail view module
import { getState, setState } from '../state.js';
import { createIcon, createButton } from '../components/ui.js';
import { escapeHtml, getDisplayAmount, setBackgroundImage } from '../utils/helpers.js';
import { getRecipeShareUrl, copyToClipboard } from '../utils/sharing.js';
import { deleteRecipe } from '../db.js';

/**
 * Render recipe detail view
 */
export function renderRecipeDetail() {
  window.scrollTo(0, 0);
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

  // Set background image
  setBackgroundImage(hero, recipe.image, 'linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.7))');

  const backBtn = document.createElement('button');
  backBtn.className = 'hero-action-btn back-btn';
  backBtn.appendChild(createIcon('ArrowLeft', 24));
  backBtn.onclick = () => setState({ selectedRecipe: null });
  hero.appendChild(backBtn);

  // Favorites button
  const isFav = state.favorites.includes(recipe.id);
  const favBtn = document.createElement('button');
  favBtn.className = `hero-action-btn`;
  favBtn.style.right = '4rem';
  favBtn.appendChild(createIcon('Heart', 22, isFav ? 'filled-heart' : ''));
  favBtn.style.color = isFav ? 'var(--color-danger)' : 'white';

  favBtn.onclick = (e) => {
    e.stopPropagation();
    const currentFavs = getState().favorites;
    const newFavs = isFav
      ? currentFavs.filter(id => id !== recipe.id)
      : [...currentFavs, recipe.id];
    setState({ favorites: newFavs });
    // Re-render to update icon state immediately (or toggle class manually)
    // Simple toggle for now:
    renderRecipeDetail();
  };
  hero.appendChild(favBtn);

  // Share button
  const shareBtn = document.createElement('button');
  shareBtn.className = 'hero-action-btn';
  shareBtn.style.right = '1rem';
  shareBtn.appendChild(createIcon('Share2', 20));
  shareBtn.onclick = () => showRecipeShareModal(recipe);
  hero.appendChild(shareBtn);

  // Delete button (User Created Only)
  if (recipe.isUserCreated) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'hero-action-btn';
    deleteBtn.style.right = '7rem'; // Left of favorites
    deleteBtn.style.color = 'var(--color-danger)';
    deleteBtn.appendChild(createIcon('Trash2', 20));
    deleteBtn.onclick = async () => {
      if (confirm('Are you sure you want to delete this recipe? This cannot be undone.')) {
        try {
          await deleteRecipe(recipe.id);
          // Remove from state
          const state = getState();
          const newRecipes = state.recipes.filter(r => r.id !== recipe.id);
          setState({
            recipes: newRecipes,
            selectedRecipe: null,
            activeTab: 'recipes'
          });
        } catch (e) {
          console.error(e);
          alert('Failed to delete recipe');
        }
      }
    };
    hero.appendChild(deleteBtn);
  }

  const heroContent = document.createElement('div');
  heroContent.className = 'hero-content';

  // Hero badges with difficulty and cooking style
  const badges = [`<div class="badge badge-category">${escapeHtml(recipe.category)}</div>`];
  if (recipe.origin) {
    badges.push(`<div class="badge badge-origin">${escapeHtml(recipe.origin)}</div>`);
  }
  if (recipe.difficulty) {
    badges.push(`<div class="badge badge-difficulty difficulty-${escapeHtml(recipe.difficulty.toLowerCase())}">${escapeHtml(recipe.difficulty)}</div>`);
  }
  if (recipe.cookingStyle) {
    badges.push(`<div class="badge badge-cooking-style">${escapeHtml(recipe.cookingStyle)}</div>`);
  }

  heroContent.innerHTML = `
    <div class="hero-badges">
      ${badges.join('')}
    </div>
    <h1 class="hero-title">${escapeHtml(recipe.title)}</h1>
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
      <span class="ingredient-name">${escapeHtml(ing.name)}</span>
      <span class="ingredient-amount">${escapeHtml(getDisplayAmount(ing, state.useMetric))}</span>
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
      <p class="step-text">${escapeHtml(step)}</p>
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
          <p class="tip-text">${escapeHtml(tip)}</p>
        </div>
      `;
      tipsContainer.appendChild(tipCard);
    });

    tipsSection.appendChild(tipsContainer);
    content.appendChild(tipsSection);
  }

  // Reviews Section (Ratings & Comments)
  renderReviewsSection(content, recipe);

  container.appendChild(content);
}

/**
 * Render Reviews Section
 */
function renderReviewsSection(container, recipe) {
  const state = getState();
  const rating = state.ratings[recipe.id] || 0;
  const comments = state.comments[recipe.id] || [];

  const section = document.createElement('div');
  section.className = 'rating-section';

  // Header & Rating
  const header = document.createElement('div');
  header.className = 'rating-header';

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.style.margin = '0';
  title.textContent = 'Reviews';
  header.appendChild(title);

  // Star Rating Input
  const starsContainer = document.createElement('div');
  starsContainer.className = 'rating-stars';

  [1, 2, 3, 4, 5].forEach(star => {
    const starBtn = document.createElement('button');
    starBtn.className = `star-btn ${star <= rating ? 'active' : ''}`;
    starBtn.appendChild(createIcon('Star', 24, star <= rating ? 'star-filled' : ''));
    starBtn.onclick = () => {
      const newRatings = { ...state.ratings, [recipe.id]: star };
      setState({ ratings: newRatings });
      renderRecipeDetail(); // Re-render to show update
    };
    starsContainer.appendChild(starBtn);
  });

  header.appendChild(starsContainer);
  section.appendChild(header);

  // Comments List
  const list = document.createElement('div');
  list.className = 'comments-list';

  if (comments.length === 0) {
    list.innerHTML = `<p style="color: var(--color-surface-500); font-style: italic;">No comments yet. Be the first!</p>`;
  } else {
    comments.slice().reverse().forEach(comment => {
      const item = document.createElement('div');
      item.className = 'comment-item';
      const date = new Date(comment.date).toLocaleDateString();
      item.innerHTML = `
        <div class="comment-header">
          <span style="font-weight: 600;">User</span>
          <span>${escapeHtml(date)}</span>
        </div>
        <p class="comment-text">${escapeHtml(comment.text)}</p>
      `;
      list.appendChild(item);
    });
  }
  section.appendChild(list);

  // Add Comment Form
  const form = document.createElement('div');
  form.className = 'add-comment-form';

  const input = document.createElement('textarea'); // changed to textarea for multi-line
  input.className = 'comment-input';
  input.placeholder = 'Add a note or comment...';

  const submitBtn = createButton({
    icon: 'Share2', // Use Send icon lookalike or just text
    variant: 'primary',
    onClick: () => {
      const text = input.value.trim();
      if (!text) return;

      const newComment = { text, date: Date.now() };
      const currentComments = state.comments[recipe.id] || [];
      const newCommentsMap = { ...state.comments, [recipe.id]: [...currentComments, newComment] };

      setState({ comments: newCommentsMap });
      renderRecipeDetail();
    }
  });
  // Override icon to be 'Send' if available, or just use Plus/Check
  // We can use 'ChevronsRight' or just text 'Post'
  submitBtn.innerHTML = createIcon('Check', 20).outerHTML;
  submitBtn.style.width = '3rem';
  submitBtn.style.flexShrink = '0';

  form.appendChild(input);
  form.appendChild(submitBtn);
  section.appendChild(form);

  container.appendChild(section);
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
    <h2 class="step-text-large">${escapeHtml(step)}</h2>
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
async function showRecipeShareModal(recipe) {
  // Show spinner or waiting state if needed, but for now just await
  const shareBtn = document.querySelector('.hero-action-btn i.fa-share-alt')?.parentElement || document.activeElement;
  if (shareBtn) shareBtn.disabled = true;

  let shareUrl;
  try {
    shareUrl = await getRecipeShareUrl(recipe);
  } catch (e) {
    console.error('Failed to generate share URL', e);
    alert('Failed to generate share URL');
    if (shareBtn) shareBtn.disabled = false;
    return;
  }

  if (shareBtn) shareBtn.disabled = false;

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
        <p class="share-title">${escapeHtml(recipe.title)}</p>
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
