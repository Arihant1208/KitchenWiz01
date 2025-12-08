# KitchenWiz Roadmap & Future Improvements

This document outlines the planned features and technical improvements for KitchenWiz.

## Short Term
- [ ] **Manual Inventory Entry**: Add a form to manually add items to inventory (currently placeholder).
- [ ] **Edit Inventory**: Allow users to edit details (expiry, quantity) of existing inventory items.
- [ ] **Better Receipt OCR**: Improve the prompt engineering for receipt scanning to handle blurry images or complex receipts better.
- [ ] **Ingredient Grouping**: Group similar items in the inventory (e.g., "Gala Apples" and "Fuji Apples" both under "Apples").

## Medium Term
- [ ] **User Authentication**: Implement Firebase or Supabase Auth to support cloud sync across devices.
- [ ] **Multi-User Households**: Allow sharing of inventory and meal plans between family members.
- [ ] **Nutritional Tracking**: Calculate detailed macros (Protein, Carbs, Fat) for the generated meal plans.
- [ ] **Pantry Staples List**: Define a "Basic Stock" list that the app automatically reminds you to replenish.

## Long Term / Blue Sky
- [ ] **Grocery API Integration**: Connect directly to retailer APIs (Instacart, Walmart, Kroger) to add the generated shopping list to a real cart.
- [ ] **Barcode Scanning**: Integrate a barcode scanning library to look up products by UPC code.
- [ ] **Voice Control**: "Hey KitchenWiz, I just used 2 eggs" to update inventory hands-free.
- [ ] **Social Features**: Share recipes or meal plans with friends.
- [ ] **Price Estimation**: Estimate the cost of the shopping list based on average regional prices.

## Technical Debt
- [ ] **Context API / Redux**: As the app grows, migrate from prop-drilling in `App.tsx` to React Context or a state management library.
- [ ] **Unit Testing**: Add tests for `geminiService` and core logic.
- [ ] **Image Optimization**: Optimize handling of uploaded receipt images to reduce memory usage.
