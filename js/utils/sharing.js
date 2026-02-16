// Sharing and URL encoding utilities

// --- Compression helpers ---

/** Uint8Array → URL-safe base64 string */
function uint8ToUrlBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** URL-safe base64 string → Uint8Array */
function urlBase64ToUint8(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Compress string using DEFLATE (browser-native) */
async function deflateCompress(str) {
  const encoder = new TextEncoder();
  const input = encoder.encode(str);
  if (typeof CompressionStream !== 'undefined') {
    const cs = new CompressionStream('deflate-raw');
    const writer = cs.writable.getWriter();
    writer.write(input);
    writer.close();
    const chunks = [];
    const reader = cs.readable.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    let totalLength = 0;
    chunks.forEach(c => totalLength += c.length);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    chunks.forEach(c => { result.set(c, offset); offset += c.length; });
    return result;
  }
  // Fallback: no compression, just UTF-8 bytes
  return input;
}

/** Decompress DEFLATE bytes to string */
async function deflateDecompress(bytes) {
  if (typeof DecompressionStream !== 'undefined') {
    const ds = new DecompressionStream('deflate-raw');
    const writer = ds.writable.getWriter();
    writer.write(bytes);
    writer.close();
    const chunks = [];
    const reader = ds.readable.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    let totalLength = 0;
    chunks.forEach(c => totalLength += c.length);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    chunks.forEach(c => { result.set(c, offset); offset += c.length; });
    return new TextDecoder().decode(result);
  }
  // Fallback
  return new TextDecoder().decode(bytes);
}

/**
 * Encode shopping list for URL sharing
 * Uses DEFLATE compression + URL-safe base64 for much shorter URLs
 * @param {Array} shoppingList - Array of shopping list items
 * @param {Object} selectedRecipes - Object mapping recipe IDs to serving counts
 * @param {boolean} useMetric - Whether to use metric measurements
 * @returns {Promise<string>} - Compressed, URL-safe base64 encoded string
 */
export async function encodeBasket(shoppingList, selectedRecipes, useMetric) {
  try {
    // Create minimal representation — only names and amounts
    const minimalData = {
      i: shoppingList.map(item => {
        const entry = { n: item.name };
        const amt = useMetric ? item.amountMetric : item.amount;
        if (amt) entry.a = amt;
        if (item.category) entry.c = item.category;
        return entry;
      }),
      m: useMetric ? 1 : 0
    };

    const jsonStr = JSON.stringify(minimalData);
    const compressed = await deflateCompress(jsonStr);
    // Prefix 'z' to indicate compressed format
    return 'z' + uint8ToUrlBase64(compressed);
  } catch (error) {
    console.error('Failed to encode basket:', error);
    return null;
  }
}

/**
 * Decode shopping list from URL
 * Handles both new compressed format (prefix 'z') and legacy base64 format
 * @param {string} encodedString - Encoded string
 * @returns {Promise<Object>} - Decoded basket data with items, selectedRecipes, and useMetric
 */
export async function decodeBasket(encodedString) {
  try {
    let jsonStr;

    if (encodedString.startsWith('z')) {
      // New compressed format
      const bytes = urlBase64ToUint8(encodedString.slice(1));
      jsonStr = await deflateDecompress(bytes);
    } else {
      // Legacy: btoa(encodeURIComponent(json))
      jsonStr = decodeURIComponent(atob(encodedString));
    }

    const data = JSON.parse(jsonStr);

    // Handle both old format (data.items) and new compact format (data.i)
    const rawItems = data.i || data.items || [];
    const items = rawItems.map((item, index) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
      name: item.n || item.name,
      amount: item.a || item.amount || '',
      amountMetric: item.a || item.amountMetric || '',
      checked: false,
      category: item.c || item.cat || item.category || '',
      aisle: item.aisle || ''
    }));

    return {
      items,
      selectedRecipes: data.r || {},
      useMetric: data.m ? true : false
    };
  } catch (error) {
    console.error('Failed to decode basket:', error);
    return null;
  }
}

/**
 * Encode recipe for URL sharing (excludes image)
 * @param {Object} recipe - Recipe object
 * @returns {Promise<string>} - Compressed, URL-safe base64 encoded string
 */
export async function encodeRecipe(recipe) {
  try {
    // Create minimal representation
    const minimal = {
      t: recipe.title,
      d: recipe.description,
      c: recipe.category,
      pt: recipe.prepTime,
      ct: recipe.cookTime,
      s: recipe.servings,
      dif: recipe.difficulty,
      cs: recipe.cookingStyle,
      o: recipe.origin,
      i: recipe.ingredients.map(ing => ({
        n: ing.name,
        a: ing.amount,
        am: ing.amountMetric
      })),
      st: recipe.steps,
      tp: recipe.tips || [],
      tg: recipe.tags || []
    };

    const jsonStr = JSON.stringify(minimal);
    const compressed = await deflateCompress(jsonStr);
    return 'z' + uint8ToUrlBase64(compressed);
  } catch (error) {
    console.error('Failed to encode recipe:', error);
    return null;
  }
}

/**
 * Decode recipe from URL
 * @param {string} encodedString - Encoded string
 * @returns {Promise<Object>} - Decoded recipe object
 */
export async function decodeRecipe(encodedString) {
  try {
    let jsonStr;
    if (encodedString.startsWith('z')) {
      const bytes = urlBase64ToUint8(encodedString.slice(1));
      jsonStr = await deflateDecompress(bytes);
    } else {
      // Fallback
      return null;
    }

    const data = JSON.parse(jsonStr);

    // Reconstruct full recipe object
    return {
      id: Date.now(), // Assign temporary ID
      title: data.t,
      description: data.d,
      category: data.c,
      prepTime: data.pt,
      cookTime: data.ct,
      servings: data.s,
      difficulty: data.dif,
      cookingStyle: data.cs,
      origin: data.o,
      image: null, // No image in shared link
      ingredients: data.i.map(ing => ({
        name: ing.n,
        amount: ing.a,
        amountMetric: ing.am
      })),
      steps: data.st,
      tips: data.tp,
      tags: data.tg,
      isShared: true
    };
  } catch (error) {
    console.error('Failed to decode recipe:', error);
    return null;
  }
}

/**
 * Generate recipe share URL
 * @param {Object|number|string} recipe - Recipe object or ID
 * @returns {Promise<string>} - Complete shareable URL
 */
export async function getRecipeShareUrl(recipe) {
  const baseUrl = window.location.origin + window.location.pathname;

  // If it's a simple ID (standard recipe)
  if (typeof recipe !== 'object') {
    return `${baseUrl}?recipe=${recipe}`;
  }

  // If it's a user recipe (object), encode it
  if (recipe.isUserCreated || typeof recipe.id === 'number' && recipe.id > 10000) {
    const encoded = await encodeRecipe(recipe);
    return `${baseUrl}?shared_recipe=${encoded}`;
  }

  // Fallback for standard recipe passed as object
  return `${baseUrl}?recipe=${recipe.id}`;
}

/**
 * Generate basket share URL
 * @param {string} encodedBasket - Encoded basket string
 * @returns {string} - Complete shareable URL or null if too long
 */
export function getBasketShareUrl(encodedBasket) {
  const baseUrl = window.location.origin + window.location.pathname;
  const url = `${baseUrl}?basket=${encodedBasket}`;

  // Increased limit to 8000 for modern browsers
  if (url.length > 8000) {
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
 * Clear URL parameters
 */
export function clearUrlParams() {
  if (window.history && window.history.replaceState) {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}
