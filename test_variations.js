// Test the variations parsing logic
const testVariations = {
  "Size": {
    "id": 18,
    "images": [],
    "product_id": 38,
    "stock_quantity": 100,
    "variation_type": "Size",
    "variation_value": "S",
    "price_adjustment": "12.00"
  },
  "Color": {
    "id": 19,
    "images": [
      { "id": 46, "image_path": "uploads/variations/1763965146212-938077273.png" },
      { "id": 47, "image_path": "uploads/variations/1763965146269-46312472.png" }
    ],
    "product_id": 38,
    "stock_quantity": 100,
    "variation_type": "Color",
    "variation_value": "RED",
    "price_adjustment": "0.00"
  }
};

// Test the rendering logic from OrderDetail.jsx
const hasVariations = testVariations && typeof testVariations === 'object' && Object.keys(testVariations).length > 0;

console.log("hasVariations:", hasVariations);
console.log("Object.keys:", Object.keys(testVariations));

if (hasVariations) {
  console.log("\n✅ Variations section would display:");
  Object.entries(testVariations).forEach(([variationType, variationData]) => {
    if (variationData && typeof variationData === 'object') {
      const variationValue = variationData.variation_value || variationData.value || '';
      console.log(`  ${variationType}: ${variationValue}${variationData.price_adjustment ? ` (+₹${variationData.price_adjustment})` : ''}`);
    }
  });
} else {
  console.log("❌ Variations section would NOT display");
}
