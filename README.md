# RecipeBliss 🍳

A beautiful, modern recipe management Progressive Web App (PWA) built with vanilla JavaScript, CSS, and HTML.

## Features

- 📱 Progressive Web App - Install and use offline
- 🎨 Modern, responsive UI design
- 🔍 Search and filter recipes
- 📝 Detailed recipe instructions with ingredients
- 🛒 Shopping list organized by store aisle
- 🌍 International recipes with origin flags
- ⏱️ Cooking time and difficulty ratings

## Project Structure

- `/recipes/` - JSON recipe data files
- `/js/` - JavaScript application logic
- `/css/` - Stylesheets
- `/images/` - Recipe and UI images
- `/icons/` - PWA icons
- `RECIPE_GENERATION_GUIDE.md` - Detailed guide for creating recipe data

## Adding New Recipes

When creating new recipes, please follow the standardized format defined in `RECIPE_GENERATION_GUIDE.md`. This ensures consistency across all recipe data including:

- Proper JSON schema structure
- Standardized difficulty levels and cooking styles
- Ingredient categorization with store aisle mapping (Lidl UK layout)
- Appetizing descriptions and clear cooking steps

## Development

This is a static web application that can be served with any HTTP server. The service worker (`sw.js`) enables offline functionality.

## Contributing

When adding new recipes, use the `RECIPE_GENERATION_GUIDE.md` as your reference to maintain data consistency and quality.