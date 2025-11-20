# Shop Page Filters Feature

## Overview

A comprehensive filtering system has been added to the shop page with the following features:

✅ **Category Filtering** - Filter products by category
✅ **Price Range Filtering** - Filter by predefined price ranges
✅ **Search Integration** - Search works alongside filters
✅ **Mobile Responsive** - Filters in modal on mobile, sidebar on desktop
✅ **Real-time Updates** - Products update instantly as filters change
✅ **Clear Filters** - One-click button to reset all filters

---

## Features

### 1. Category Filter
- Shows all available categories with product count
- Radio button selection (single category at a time)
- "All Products" option to clear category filter
- Categories fetched from backend with real-time count

### 2. Price Range Filter
- 5 predefined price ranges:
  - All Prices (₹0 - ∞)
  - ₹0 - ₹1,000
  - ₹1,000 - ₹5,000
  - ₹5,000 - ₹10,000
  - ₹10,000+
- Radio button selection for easy switching
- Easy to extend with custom ranges

### 3. Search Integration
- Search box searches product names and descriptions
- Works alongside category and price filters
- Real-time filtering as you type

### 4. Mobile Responsive Design
- **Desktop (lg and above)**: Fixed sidebar with all filters visible
- **Mobile (below lg)**: Filter button opens full-screen modal
- Smooth transitions and auto-close on window resize
- Touch-friendly interface

### 5. Clear Filters Button
- Only appears when filters are active
- One-click reset to defaults
- Red styling for visibility

---

## Components

### 1. ShopFilters Component
**File:** `frontend/src/components/common/ShopFilters.jsx`

Reusable filter component displaying:
- Category filter with collapsible sections
- Price range filter with collapsible sections
- Clear filters button
- Expandable/collapsible sections

**Props:**
```javascript
{
  onFilterChange: Function,        // General filter change callback
  onCategoryChange: Function,      // Category selection callback
  onPriceChange: Function,         // Price range change callback
  selectedCategory: String|Number, // Currently selected category ID
  priceRange: Object,              // { min: number, max: number }
  loading: Boolean                 // Loading state
}
```

### 2. Updated Shop Page
**File:** `frontend/src/pages/Shop.jsx`

- Added filter state management
- Desktop sidebar integration
- Mobile filter modal
- Filter state passing to ProductList

### 3. Updated ProductList Component
**File:** `frontend/src/components/sections/ProductList.jsx`

Now accepts and applies filters:
- `searchTerm` - Text search filter
- `selectedCategory` - Category ID filter
- `priceRange` - Price range filter

Applies filters in order:
1. Search filter (product name & description)
2. Category filter
3. Price range filter

---

## How It Works

### Filter Flow
```
User Input
    ↓
Shop.jsx (manages state)
    ↓
ShopFilters (UI for filters)
    ↓
onCategoryChange/onPriceChange callbacks
    ↓
Shop.jsx state updates
    ↓
ProductList receives new props
    ↓
ProductList applies filters
    ↓
Filtered products displayed
```

### Real-time Filtering
```javascript
// ProductList useEffect watches for filter changes
useEffect(() => {
  let filtered = [...products];
  
  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(p => p.name.includes(searchTerm));
  }
  
  // Apply category filter
  if (selectedCategory) {
    filtered = filtered.filter(p => p.category_id === selectedCategory);
  }
  
  // Apply price filter
  filtered = filtered.filter(p => 
    p.price >= priceRange.min && p.price <= priceRange.max
  );
  
  setFilteredProducts(filtered);
}, [products, searchTerm, selectedCategory, priceRange]);
```

---

## User Interface

### Desktop Layout
```
┌─────────────────────────────────────────────────┐
│ Search Box        │ Filter Button              │
├──────────┬────────────────────────────────────┤
│Sidebar   │                                     │
│Filters   │  Product Grid                      │
│          │                                     │
│Category  │  [Product] [Product] [Product]    │
│  ☑ All   │  [Product] [Product] [Product]    │
│  ○ Cat1  │  [Product] [Product] [Product]    │
│  ○ Cat2  │                                     │
│          │                                     │
│Price     │                                     │
│  ○ 0-1K  │                                     │
│  ○ 1-5K  │                                     │
│  ○ 5-10K │                                     │
│  ○ 10K+  │                                     │
│          │                                     │
│[Clear]   │                                     │
└──────────┴────────────────────────────────────┘
```

### Mobile Layout
```
┌──────────────┐
│ Search │ ☰  │  <- Filter button (☰)
└──────────────┘
┌─────────────┐
│             │
│  Products   │
│  Grid       │
│             │
└─────────────┘

[When ☰ clicked]
┌─────────────────────┐
│ ✕ Filters           │
├─────────────────────┤
│ Categories▼         │
│  ☑ All              │
│  ○ Cat1             │
│  ○ Cat2             │
│                     │
│ Price Range▼        │
│  ○ 0-1K             │
│  ○ 1-5K             │
│                     │
│ [Clear Filters]     │
└─────────────────────┘
```

---

## Styling

### Tailwind Classes Used
- `sticky top-32` - Sticky filter sidebar
- `grid grid-cols-1 lg:grid-cols-5` - Responsive grid layout
- `fixed inset-0 z-50` - Full-screen modal
- `bg-black/50` - Semi-transparent backdrop
- `max-w-xs` - Modal width constraint
- `hover:bg-gray-50` - Interactive elements
- `transition-all` - Smooth animations

---

## Responsive Breakpoints

| Screen | Layout | Filters |
|--------|--------|---------|
| Mobile (< 640px) | Single column products | Button → Modal |
| Tablet (640-1024px) | 2 columns products | Button → Modal |
| Desktop (1024px+) | 4 columns products | Fixed sidebar |

---

## Integration Points

### With Backend
- Fetches categories from `/categories` endpoint
- Shows product count per category from `product_count` field
- Filters applied client-side on `/products` data

### With Existing Components
- Uses `ProductCard` component from common
- Integrates with existing search input
- Compatible with existing `ProductList`

### With Other Pages
- Same filter component can be reused on other pages
- CategoryFilter component already exists in `CategoryPage.jsx`
- Consistent filtering logic across app

---

## File Structure

```
frontend/src/
├── pages/
│   └── Shop.jsx                    (UPDATED - added filter state)
├── components/
│   ├── common/
│   │   ├── ProductCard.jsx        (Existing)
│   │   └── ShopFilters.jsx        (NEW - filter component)
│   └── sections/
│       └── ProductList.jsx        (UPDATED - added filter support)
```

---

## Usage Example

```jsx
// In Shop.jsx
const [searchTerm, setSearchTerm] = useState("");
const [selectedCategory, setSelectedCategory] = useState("");
const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

return (
  <div>
    {/* Desktop Filters */}
    <ShopFilters
      onCategoryChange={setSelectedCategory}
      onPriceChange={setPriceRange}
      selectedCategory={selectedCategory}
      priceRange={priceRange}
    />
    
    {/* Products with filters applied */}
    <ProductList
      searchTerm={searchTerm}
      selectedCategory={selectedCategory}
      priceRange={priceRange}
    />
  </div>
);
```

---

## Testing Checklist

- [ ] Search works independently
- [ ] Category filter works
- [ ] Price filter works
- [ ] All filters work together
- [ ] Clear filters button resets all
- [ ] Category count shows correctly
- [ ] Mobile filter modal opens/closes
- [ ] Desktop sidebar is sticky
- [ ] Responsive on all screen sizes
- [ ] No products message shows when filtered empty
- [ ] Loading state shows while fetching

---

## Performance Optimizations

1. **Client-side Filtering** - Faster than server requests
2. **Memoization Ready** - Easy to add React.memo
3. **Efficient Updates** - useEffect only when dependencies change
4. **Lazy Load Categories** - Only load when component mounts
5. **Single API Call** - Load all products once, filter client-side

---

## Future Enhancements

- [ ] Custom price range input (slider)
- [ ] Multi-category selection (checkboxes)
- [ ] Sorting options (price, name, newest)
- [ ] Color filter
- [ ] Brand filter
- [ ] Rating filter
- [ ] Save filter preferences
- [ ] Filter URL params (shareable links)
- [ ] Animated filter transitions
- [ ] Filter suggestions based on products

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Categories not showing | Check if backend `/categories` endpoint works |
| Filters not working | Verify product `category_id` and `price` fields |
| Mobile modal not closing | Check responsive breakpoint (lg = 1024px) |
| Products count wrong | Verify filtered logic in ProductList |
| Styling looks off | Check Tailwind CSS is compiled |

