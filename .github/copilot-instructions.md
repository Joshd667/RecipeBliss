# GitHub Copilot Instructions for RecipeBliss

## Project Context

RecipeBliss is a Progressive Web App (PWA) for managing and displaying recipes. The application uses vanilla JavaScript, CSS, and HTML with a focus on clean, maintainable code.

## Recipe Data Generation

**CRITICAL**: When generating or modifying recipe data files, you MUST follow the comprehensive guide in `RECIPE_GENERATION_GUIDE.md`.

### Key Requirements:

1. **Schema Compliance**: All recipe JSON files must match the exact schema defined in `RECIPE_GENERATION_GUIDE.md`
   - Do not add or remove fields
   - Respect data types (strings, numbers, arrays)
   - Follow the template structure exactly

2. **Naming Conventions**:
   - Recipe titles: Use "Adjective + Noun" format (e.g., "Smoky Chorizo Chilli")
   - Image filenames: Use kebab-case (e.g., "creamy-chicken-bake.jpg")
   - Keep it restaurant-quality and appetizing

3. **Strict Enums**: Only use the predefined values for:
   - `difficulty`: "Easy", "Medium", "Hard"
   - `cookingStyle`: "One Pot", "Traybake", "Stovetop", "Slow Cooker", "No Cook", "Baking", "Roasting", "Grilling/BBQ", "Steaming"
   - `category`: "Breakfast", "Brunch", "Lunch", "Dinner", "Appetizer", "Side", "Snack", "Dessert", "Drink", "Spice Mix", "Sauce/Dip", "Soup/Stew", "Salad", "Baking"

4. **Ingredient Details**:
   - Provide both Imperial (`amount`) and Metric (`amountMetric`) measurements
   - Assign correct `category` from the predefined list
   - Map to Lidl UK store `aisle` numbers (1-11) as specified in the guide

5. **Writing Style**:
   - Descriptions: 2-3 sentences, max 60 words, sensory and appetizing
   - Steps: Imperative mood, start with verbs
   - Tips: Include "Chef's Why" reasoning, alternatives, and pro techniques

## Code Style

- Use ES6+ features where appropriate
- Keep functions small and focused
- Comment complex logic
- Maintain semantic HTML structure
- Follow existing CSS patterns and naming

## File Organization

- Recipe JSON files go in `/recipes/`
- Recipe images in `/images/recipes/`
- Keep related functionality grouped

## Before Generating a Recipe

1. Read `RECIPE_GENERATION_GUIDE.md` completely
2. Use the blank template provided
3. Verify all enum values match the guide
4. Double-check ingredient categorization and aisle mapping
5. Ensure measurements are provided in both systems

## Testing Considerations

- Validate JSON syntax
- Ensure all required fields are present
- Check that image paths exist or are planned
- Verify aisle numbers are within 1-11 range