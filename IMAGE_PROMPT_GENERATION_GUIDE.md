# RecipeBliss Image Prompt Generation Guide

This guide provides a prompt template to use with an LLM (like ChatGPT, Claude, or Gemini) to generate high-quality image generation prompts for RecipeBliss recipes.

---

## 📸 The Meta-Prompt

Copy and paste the following instruction block into your AI chat interface, followed by the Recipe JSON you want to visualize.

```markdown
# Role
You are an expert food stylist and photographer for a high-end modern food blog. Your task is to write a text-to-image generation prompt (for Midjourney/DALL-E 3) based on a provided Recipe JSON.

# Input Data
I will provide you with a JSON object containing:
- `title`: The name of the dish.
- `description`: A brief description of the food.
- `ingredients`: A list of ingredients.
- `steps`: Cooking instructions.

# Style Guidelines (Strict Adherence Required)
All images must strictly follow the "RecipeBliss" brand aesthetic:
1.  **Camera Angle**: Overhead (flat lay) OR 45-degree (3/4 angle).
2.  **Lighting**: Warm, natural, soft daylight. No harsh studio flash.
3.  **Background**: Simple and rustic. Use keywords like: "rustic wooden table", "white marble surface", or "clean linen cloth".
4.  **Vibe**: Home-cooked, inviting, colourful, editorial quality. Not artificial or too "perfect".
5.  **Plating**: Use appropriate vessels (e.g., cast iron skillet, white ceramic bowl, baking dish, wooden board).

# Prompt Structure
Your output must be a single paragraph description that includes:
1.  **Main Subject**: A vivid, appetizing description of the finished dish (e.g., "golden bubbling cheese", "glossy sticky glaze").
2.  **Visible Ingredients**: Mention specific key ingredients that should be visible (e.g., "fresh coriander leaves", "chunks of chorizo", "steam rising").
3.  **Context**: The plate/bowl/pan it is served in.
4.  **Style Keywords**: Append the required style keywords at the end.

# Example Logic
**Input**: Creamy Chicken & Rice Casserole JSON
**Output**: A golden bubbling casserole dish with a crispy stuffing and cheese crust on top. Creamy rice, broccoli florets, and tender chicken chunks are peeking through the sauce. Served in a white rectangular baking dish. Overhead food photography, styled like a modern food blog. Lighting: Warm, natural, soft daylight. Background: Rustic wooden table. slightly messy but appetizing.

# Your Task
Please generate an image prompt for the following recipe JSON:

[PASTE JSON HERE]
```

---

## 🎨 Style Keywords Reference

Use these keywords to fine-tune the results if needed:

*   **Lighting**: `soft window light`, `golden hour`, `diffused sunlight`, `natural shadows`.
*   **Texture**: `crispy`, `glossy`, `sticky`, `charred`, `creamy`, `steaming`, `fluffy`.
*   **Composition**: `shallow depth of field` (for 45° angle), `sharp focus`, `rule of thirds`, `minimalist`.
*   **Color Palette**: `vibrant`, `rich`, `fresh`, `warm tones`, `emerald green accents`.

---

## 📄 Example Workflow

1.  Open the recipe file (e.g., `recipes/my-new-recipe.json`).
2.  Copy the JSON content.
3.  Paste the **Meta-Prompt** above into your AI chat.
4.  Paste the **Recipe JSON** below it.
5.  Copy the resulting text prompt.
6.  Paste it into your image generator (Midjourney, DALL-E, etc.).
