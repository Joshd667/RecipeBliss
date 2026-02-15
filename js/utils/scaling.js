// Scaling utility functions for ingredient amounts

/**
 * Parse amount string and extract numeric value
 * Handles fractions like "1/2 cup", decimals like "1.5 lbs", and plain numbers
 * @param {string} str - Amount string like "1.5 lbs" or "2 large"
 * @returns {{val: number, text: string, hasNumber: boolean}}
 */
export const parseAmount = (str) => {
  if (!str) return { val: 0, text: str, hasNumber: false };
  
  const match = str.match(/^(\d+(?:\.\d+)?|\d+\/\d+)(.*)$/);
  if (!match) return { val: 1, text: str, hasNumber: false };
  
  let val = match[1];
  if (val.includes('/')) {
    const [n, d] = val.split('/');
    val = parseFloat(n) / parseFloat(d);
  } else {
    val = parseFloat(val);
  }
  
  return { val, text: match[2], hasNumber: true };
};

/**
 * Scale an amount string by a factor
 * @param {string} str - Amount string like "1.5 lbs"
 * @param {number} factor - Scaling factor (e.g., 2 for doubling)
 * @returns {string} - Scaled amount string
 */
export const scaleString = (str, factor) => {
  const { val, text, hasNumber } = parseAmount(str);
  if (!hasNumber) return str;
  
  const scaled = Math.round(val * factor * 100) / 100;
  return `${scaled}${text}`;
};
