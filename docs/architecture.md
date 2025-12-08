# KitchenWiz Architecture & Development Guide

## Tech Stack
- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI**: Google GenAI SDK (`@google/genai`)

## Project Structure

```
/
├── components/          # React UI Components
│   ├── ui/              # Reusable base components (Button, etc.)
│   ├── Assistant.tsx    # Chat interface
│   ├── Dashboard.tsx    # Analytics view
│   ├── Inventory.tsx    # Stock & Shopping List management
│   ├── Planner.tsx      # Calendar/Meal planning view
│   ├── Profile.tsx      # User settings
│   └── Recipes.tsx      # Recipe discovery & details
├── services/
│   └── geminiService.ts # AI integration layer
├── docs/                # Documentation
├── App.tsx              # Main entry point & State Holder
├── index.tsx            # React DOM rendering
├── types.ts             # TypeScript interfaces
└── metadata.json        # Project capabilities
```

## State Management
- **Centralized State**: The `App.tsx` serves as the single source of truth. It holds the state for `inventory`, `recipes`, `mealPlan`, `user`, and `shoppingList`.
- **Persistence**: `localStorage` is used to persist all state variables, ensuring data remains available across page reloads.
- **Props**: State and State Setters are passed down to child components via props.

## Component Architecture
- **Functional Components**: All components are React Functional Components using Hooks (`useState`, `useEffect`).
- **Clean UI**: Uses Tailwind utility classes for styling.
- **Interactive**: Components handle their own local UI state (e.g., `isScanning`, `activeTab`) but rely on parent props for data mutation.

## AI Integration Strategy (`geminiService.ts`)
- **Model**: Uses `gemini-2.5-flash` for high performance and low latency.
- **Structured Output**: Heavy reliance on `responseSchema` and `responseMimeType: "application/json"` to ensure the AI returns deterministic JSON data that the frontend can parse safely.
- **Prompt Engineering**:
    - Prompts inject user context (Inventory lists, User Profile) dynamically.
    - Prompts explicitly request JSON formatting.
    - `cleanJson` helper utility handles potential Markdown formatting issues in responses.

## Conventions & Best Practices
1. **Type Safety**: strict use of TypeScript interfaces defined in `types.ts` (e.g., `Ingredient`, `Recipe`).
2. **Error Handling**: AI service calls are wrapped in try/catch blocks with fallback behavior to prevent app crashes.
3. **Accessibility**: Use of semantic HTML tags and aria-labels where appropriate (e.g., input labels).
4. **Responsiveness**: Mobile-first design approach using Tailwind's responsive modifiers.
5. **No Backend**: The app currently operates as a client-side only SPA (Single Page Application). Data is local.

## Key Workflows
1. **Receipt Parsing**: `Inventory.tsx` -> `geminiService.parseReceiptImage` -> Updates `inventory` state.
2. **Recipe Gen**: `Recipes.tsx` -> `geminiService.generateRecipesFromInventory` -> Updates `recipes` state.
3. **Shopping List**: `Inventory.tsx` -> `geminiService.generateShoppingList` (Inventory vs MealPlan) -> Updates `shoppingList` state.
