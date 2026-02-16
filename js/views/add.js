import { getState, setState } from '../state.js';
import { createIcon, createButton } from '../components/ui.js';
import { saveRecipe } from '../db.js';

/**
 * Render Add/Edit Recipe View
 */
export function renderAddRecipeView() {
    const container = document.getElementById('app');
    container.innerHTML = '';
    container.className = 'add-recipe-view';

    // State for form data (internal to this view, or use setState if we want persistence during navigation)
    let formData = {
        title: '',
        description: '',
        category: 'Dinner',
        prepTime: '',
        cookTime: '',
        servings: 4,
        difficulty: 'Medium',
        cookingStyle: 'Stovetop',
        origin: '',
        image: null,
        ingredients: [{ amount: '', name: '', amountMetric: '' }],
        steps: [''],
        tips: [],
        tags: ''
    };

    // Header
    const header = document.createElement('div');
    header.className = 'view-header';
    header.innerHTML = `
    <h1>Add New Recipe</h1>
  `;
    container.appendChild(header);

    // Form Container
    const form = document.createElement('div');
    form.className = 'add-recipe-form';

    // --- Basic Info ---
    form.appendChild(createSectionTitle('Basic Info'));

    form.appendChild(createInput('Title', 'text', 'Recipe Title (e.g. Spicy Tacos)', (val) => formData.title = val));
    form.appendChild(createTextarea('Description', 'Short description...', (val) => formData.description = val));

    // Category & Origin Row
    const row1 = document.createElement('div');
    row1.className = 'form-row';
    row1.appendChild(createSelect('Category', ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Baking', 'Soups/Stews', 'Salads', 'Sides'], (val) => formData.category = val, 'Dinner'));
    row1.appendChild(createInput('Origin', 'text', 'e.g. Italian', (val) => formData.origin = val));
    form.appendChild(row1);

    // --- Image Upload ---
    form.appendChild(createSectionTitle('Photo'));
    const imageUpload = createImageUpload((base64) => formData.image = base64);
    form.appendChild(imageUpload);

    // --- Details ---
    form.appendChild(createSectionTitle('Details'));

    const row2 = document.createElement('div');
    row2.className = 'form-row';
    row2.appendChild(createInput('Prep Time', 'text', 'e.g. 15 min', (val) => formData.prepTime = val));
    row2.appendChild(createInput('Cook Time', 'text', 'e.g. 30 min', (val) => formData.cookTime = val));
    form.appendChild(row2);

    const row3 = document.createElement('div');
    row3.className = 'form-row';
    row3.appendChild(createInput('Servings', 'number', '4', (val) => formData.servings = parseInt(val) || 4));
    row3.appendChild(createSelect('Difficulty', ['Easy', 'Medium', 'Hard'], (val) => formData.difficulty = val, 'Medium'));
    form.appendChild(row3);

    form.appendChild(createSelect('Cooking Style', ['Stovetop', 'Oven', 'Baking', 'Roasting', 'Slow Cooker', 'No Cook', 'One Pot', 'Traybake', 'Grilling/BBQ', 'Steaming'], (val) => formData.cookingStyle = val, 'Stovetop'));

    // --- Ingredients ---
    form.appendChild(createSectionTitle('Ingredients'));
    const ingContainer = document.createElement('div');
    ingContainer.className = 'dynamic-list';

    const renderIngredients = () => {
        ingContainer.innerHTML = '';
        formData.ingredients.forEach((ing, idx) => {
            const row = document.createElement('div');
            row.className = 'ingredient-row';

            const amountInput = document.createElement('input');
            amountInput.type = 'text';
            amountInput.placeholder = 'Amount (e.g. 2 cups)';
            amountInput.value = ing.amount;
            amountInput.oninput = (e) => {
                formData.ingredients[idx].amount = e.target.value;
                formData.ingredients[idx].amountMetric = e.target.value; // Simplification: use same string for both unless user specifies
            };

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.placeholder = 'Ingredient (e.g. Flour)';
            nameInput.value = ing.name;
            nameInput.oninput = (e) => formData.ingredients[idx].name = e.target.value;

            const delBtn = createButton({
                icon: 'Trash2',
                variant: 'ghost',
                onClick: () => {
                    if (formData.ingredients.length > 1) {
                        formData.ingredients.splice(idx, 1);
                        renderIngredients();
                    }
                }
            });

            row.appendChild(amountInput);
            row.appendChild(nameInput);
            row.appendChild(delBtn);
            ingContainer.appendChild(row);
        });

        // Add Ingredient Button
        const addIngBtn = createButton({
            text: 'Add Ingredient',
            icon: 'Plus',
            variant: 'secondary',
            onClick: () => {
                formData.ingredients.push({ amount: '', name: '', amountMetric: '' });
                renderIngredients();
            }
        });
        ingContainer.appendChild(addIngBtn);
    };
    renderIngredients();
    form.appendChild(ingContainer);


    // --- Steps ---
    form.appendChild(createSectionTitle('Method'));
    const stepContainer = document.createElement('div');
    stepContainer.className = 'dynamic-list';

    const renderSteps = () => {
        stepContainer.innerHTML = '';
        formData.steps.forEach((step, idx) => {
            const row = document.createElement('div');
            row.className = 'step-row';

            const stepNum = document.createElement('span');
            stepNum.className = 'step-num';
            stepNum.textContent = idx + 1;

            const textInput = document.createElement('textarea');
            textInput.placeholder = `Step ${idx + 1} instructions...`;
            textInput.value = step;
            textInput.oninput = (e) => formData.steps[idx] = e.target.value;

            const delBtn = createButton({
                icon: 'Trash2',
                variant: 'ghost',
                onClick: () => {
                    if (formData.steps.length > 1) {
                        formData.steps.splice(idx, 1);
                        renderSteps();
                    }
                }
            });

            row.appendChild(stepNum);
            row.appendChild(textInput);
            row.appendChild(delBtn);
            stepContainer.appendChild(row);
        });

        const addStepBtn = createButton({
            text: 'Add Step',
            icon: 'Plus',
            variant: 'secondary',
            onClick: () => {
                formData.steps.push('');
                renderSteps();
            }
        });
        stepContainer.appendChild(addStepBtn);
    };
    renderSteps();
    form.appendChild(stepContainer);

    // --- Tags ---
    form.appendChild(createSectionTitle('Tags'));
    form.appendChild(createInput('Tags', 'text', 'Comma separated (e.g. Healthy, Quick, Spicy)', (val) => formData.tags = val));


    // --- Actions ---
    const actions = document.createElement('div');
    actions.className = 'form-actions';

    const saveBtn = createButton({
        text: 'Save Recipe',
        icon: 'Check',
        variant: 'primary',
        className: 'btn-block',
        onClick: async () => {
            // Validate
            if (!formData.title) {
                alert('Please enter a title');
                return;
            }

            // Process tags
            const tagArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

            // Clean up empty ingredients/steps
            const finalIngredients = formData.ingredients.filter(i => i.name.trim());
            const finalSteps = formData.steps.filter(s => s.trim());

            const recipe = {
                ...formData,
                tags: tagArray,
                ingredients: finalIngredients,
                steps: finalSteps,
                createdAt: new Date().toISOString()
            };

            try {
                const id = await saveRecipe(recipe);
                recipe.id = id;

                // Update state with new recipe
                const state = getState();
                setState({
                    recipes: [...state.recipes, recipe],
                    selectedRecipe: recipe, // Go to detail view
                    activeTab: 'recipes' // Reset tab
                });

                // Use standard renderer to show detail
                // Detail view will be rendered because selectedRecipe is set
                // But app.js render loop might need to be triggered or is it auto?
                // setState calls notifyListeners, app.js subscribes to it.
                // So render() will be called.

            } catch (err) {
                console.error(err);
                alert('Failed to save recipe');
            }
        }
    });

    actions.appendChild(saveBtn);
    form.appendChild(actions);
    container.appendChild(form);
}

// --- Helper Components ---

function createSectionTitle(text) {
    const h3 = document.createElement('h3');
    h3.className = 'form-section-title';
    h3.textContent = text;
    return h3;
}

function createInput(label, type, placeholder, onChange, initialValue = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;

    const input = document.createElement('input');
    input.type = type;
    input.placeholder = placeholder;
    input.className = 'form-input';
    if (initialValue) input.value = initialValue;
    input.oninput = (e) => onChange(e.target.value);

    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    return wrapper;
}

function createTextarea(label, placeholder, onChange) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;

    const input = document.createElement('textarea');
    input.placeholder = placeholder;
    input.className = 'form-input';
    input.rows = 3;
    input.oninput = (e) => onChange(e.target.value);

    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    return wrapper;
}

function createSelect(label, options, onChange, initialValue = '') {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-group';

    const labelEl = document.createElement('label');
    labelEl.textContent = label;

    const select = document.createElement('select');
    select.className = 'form-select';

    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (opt === initialValue) option.selected = true;
        select.appendChild(option);
    });

    select.onchange = (e) => onChange(e.target.value);

    wrapper.appendChild(labelEl);
    wrapper.appendChild(select);
    return wrapper;
}

function createImageUpload(onImageSelected) {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-upload-wrapper';

    const preview = document.createElement('div');
    preview.className = 'image-preview';
    preview.innerHTML = createIcon('Camera', 24).outerHTML + '<span>Add Photo</span>';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    wrapper.onclick = () => input.click();

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result;
                preview.style.backgroundImage = `url("${base64}")`;
                preview.innerHTML = ''; // Clear text
                onImageSelected(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    wrapper.appendChild(preview);
    wrapper.appendChild(input);
    return wrapper;
}
