# KitchenWiz Features Documentation

KitchenWiz is a smart kitchen assistant powered by Google's Gemini AI. It helps users manage their kitchen inventory, plan meals, reduce food waste, and streamline shopping.

## 1. Smart Inventory Management
- **Receipt Scanning**: Users can upload images of grocery receipts. The app uses AI (Gemini Vision) to identify items, categorizing them, and estimating expiry dates automatically.
- **Stock Tracking**: View a categorized list of available ingredients.
- **Expiry Alerts**: Visual indicators for expiring items and browser push notifications to prevent food waste.
- **Search & Filter**: Quickly find ingredients in your pantry.

## 2. AI Recipe Discovery
- **Inventory-Based Suggestions**: Generates recipe ideas based *specifically* on what you currently have in stock to minimize waste and spending.
- **Match Score**: Shows how well a recipe matches your current inventory (e.g., "90% Match").
- **Dietary Personalization**: Recipes respect user preferences (Vegetarian, Gluten-Free, etc.) and cooking skills defined in the profile.
- **Saved Recipes**: Users can save their favorite AI-generated recipes to a personal collection for quick access later.

## 3. Intelligent Meal Planning
- **Weekly Auto-Planner**: Generates a complete 7-day meal plan (Breakfast, Lunch, Dinner) tailored to user goals (e.g., Weight Loss, Muscle Gain) and available ingredients.
- **Manual Adjustments**: Users can manually edit meal slots, searching through discovered recipes or adding custom entries.
- **Nutritional & Time Estimates**: Displays estimated calories and cooking times for planned meals.

## 4. Automated Shopping List
- **Delta Analysis**: Compares the Weekly Meal Plan against the Current Inventory.
- **Auto-Generation**: Automatically creates a shopping list for missing ingredients required for the week's meals.
- **Workflow Integration**: 
    - Check off items as you buy them.
    - "Move to Stock" feature seamlessly transfers purchased items into your digital inventory with estimated expiry dates.

## 5. AI Kitchen Assistant
- **Chat Interface**: A dedicated chat bot context ("Chef/Nutritionist") to answer culinary questions.
- **Context-Aware**: The assistant is aware of your current inventory and can suggest specific tips or substitutions based on what you have.

## 6. Personalization Profile
- **Dietary Settings**: Manage allergies and dietary restrictions.
- **Goals**: Set objectives like "Budget Friendly" or "Muscle Gain".
- **Skill Level**: Adjust recipe complexity based on cooking skill (Beginner, Intermediate, Advanced).
- **Household Size**: Influences portion sizes (implicit in prompt engineering).
