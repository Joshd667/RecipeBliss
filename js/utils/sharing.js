// Sharing and URL encoding utilities

/**
 * Encode shopping list for URL sharing
 * @param {Array} shoppingList - Array of shopping list items
 * @param {Object} selectedRecipes - Object mapping recipe IDs to serving counts
 * @param {boolean} useMetric - Whether to use metric measurements
 * @returns {string} - Base64 encoded string
 */
export function encodeBasket(shoppingList, selectedRecipes, useMetric) {
  try {
    // Create minimal representation
    const minimalData = {
      items: shoppingList.map(item => ({
        n: item.name,
        a: useMetric ? item.amountMetric : item.amount,
        c: item.checked || false,
        cat: item.category,
        aisle: item.aisle
      })),
      r: selectedRecipes,
      m: useMetric
    };
    
    // Convert to JSON and encode
    const jsonStr = JSON.stringify(minimalData);
    const encoded = btoa(encodeURIComponent(jsonStr));
    
    return encoded;
  } catch (error) {
    console.error('Failed to encode basket:', error);
    return null;
  }
}

/**
 * Decode shopping list from URL
 * @param {string} encodedString - Base64 encoded string
 * @returns {Object} - Decoded basket data with items, selectedRecipes, and useMetric
 */
export function decodeBasket(encodedString) {
  try {
    const jsonStr = decodeURIComponent(atob(encodedString));
    const data = JSON.parse(jsonStr);
    
    // Expand minimal representation back to full format
    const items = data.items.map((item, index) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
      name: item.n,
      amount: item.a,
      amountMetric: item.a,
      checked: item.c || false,
      category: item.cat,
      aisle: item.aisle
    }));
    
    return {
      items,
      selectedRecipes: data.r || {},
      useMetric: data.m || false
    };
  } catch (error) {
    console.error('Failed to decode basket:', error);
    return null;
  }
}

/**
 * Generate recipe share URL
 * @param {number|string} recipeId - Recipe ID
 * @returns {string} - Complete shareable URL
 */
export function getRecipeShareUrl(recipeId) {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?recipe=${recipeId}`;
}

/**
 * Generate basket share URL
 * @param {string} encodedBasket - Encoded basket string
 * @returns {string} - Complete shareable URL or null if too long
 */
export function getBasketShareUrl(encodedBasket) {
  const baseUrl = window.location.origin + window.location.pathname;
  const url = `${baseUrl}?basket=${encodedBasket}`;
  
  // Check URL length (limit to 2000 characters for broad browser support)
  if (url.length > 2000) {
    return null;
  }
  
  return url;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Parse URL parameters
 * @returns {Object} - Object with recipe and basket params if present
 */
export function parseUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    recipe: params.get('recipe'),
    basket: params.get('basket')
  };
}

/**
 * Clear URL parameters
 */
export function clearUrlParams() {
  if (window.history && window.history.replaceState) {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}
