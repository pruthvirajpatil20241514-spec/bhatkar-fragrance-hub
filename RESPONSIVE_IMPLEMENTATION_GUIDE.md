# Frontend Production Implementation Guide
**Mobile-Responsive Search & Policy Configuration**

---

## 📚 TABLE OF CONTENTS

1. [SearchBar Component Best Practices](#searchbar-component-best-practices)
2. [Mobile-First Responsive Classes](#mobile-first-responsive-classes)
3. [Tailwind Responsive Configuration](#tailwind-responsive-configuration)
4. [Constants Management Pattern](#constants-management-pattern)
5. [Accessibility Patterns](#accessibility-patterns)
6. [Code Examples](#code-examples)

---

## SearchBar Component Best Practices

### Pattern 1: Mobile-First Approach

**✅ DO - Mobile First**
```tsx
// Define mobile as default
<div className="w-full">                    // Mobile: full width
  <div className="md:w-96">                 // Desktop: w-96
    {/* Content */}
  </div>
</div>
```

**❌ DON'T - Desktop First**
```tsx
// Don't hide mobile, show on large screens only
<div className="hidden lg:block">            // Wrong - hides mobile
  {/* Content */}
</div>
```

### Pattern 2: Responsive Breakpoints

```tsx
// Use standard Tailwind breakpoints

// sm: 640px   - Tablets
// md: 768px   - Tablets → Desktop
// lg: 1024px  - Large Desktop
// xl: 1280px  - Extra Large

// Example:
<input className="w-full sm:w-96 md:w-64" />
```

### Pattern 3: Flexible Containers

**✅ DO - Flex with wrap**
```tsx
<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
  {/* Items stack on mobile, row on desktop */}
</div>
```

**❌ DON'T - Fixed widths**
```tsx
<div className="w-80">
  {/* Won't work on small screens */}
</div>
```

---

## Mobile-First Responsive Classes

### Complete Tailwind Classes Explained

#### Width Classes
```tsx
// Mobile-first approach
w-full              // Mobile: 100% width
md:w-auto           // Desktop: auto width (shrink to content)
md:w-96             // Desktop: 384px (w-96 = 24rem)

// Results
<div className="w-full md:w-96">
  {/* Mobile: Full width, Desktop: 384px */}
</div>
```

#### Display Classes
```tsx
// Show/Hide based on breakpoint
hidden md:block      // Hide on mobile, show on desktop
md:hidden            // Show on mobile, hide on desktop
hidden md:flex       // Hide mobile, flex on desktop
flex md:hidden       // Flex on mobile, hide desktop

// Results
<div className="md:hidden">
  {/* Mobile search icon shows here */}
</div>

<div className="hidden md:flex">
  {/* Desktop search shows here */}
</div>
```

#### Padding/Spacing
```tsx
p-2 sm:p-3 md:p-4   // Scales with screen
  // Mobile: p-2 (0.5rem)
  // Tablet: p-3 (0.75rem)
  // Desktop: p-4 (1rem)

gap-2 sm:gap-3 md:gap-4  // Gap between items
  // Scales from 0.5rem → 1rem
```

#### Image Sizing
```tsx
h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16
  // Mobile: 48px
  // Tablet: 56px
  // Desktop: 64px
```

#### Transitions
```tsx
transition-all duration-300 ease-out
  // Smooth animation for responsive changes
  // 300ms duration for all property changes
  // Easing function for natural feel

// Width animation
w-0 md:w-64  // Animates from 0 to 384px on desktop
```

---

## Tailwind Responsive Configuration

### Breakpoint Reference

```typescript
// tailwind.config.js
screens: {
  'sm': '640px',   // Mobile (iPad 7"+)
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large Desktop
  '2xl': '1536px', // Extra Large
}
```

### Using in Components

```tsx
// Single property
className="text-sm md:text-base lg:text-lg"

// Multiple properties
className="w-full md:w-96 px-4 md:px-6 py-2 md:py-4"

// Complex patterns
className={`
  flex flex-col md:flex-row 
  gap-2 sm:gap-4 md:gap-6
  w-full md:w-auto
`}
```

---

## Constants Management Pattern

### Structure

**File:** `src/constants/policies.ts`

```typescript
// 1. Define constants object
export const POLICIES = {
  POLICY_NAME: "Value",
  ANOTHER_POLICY: "Another value",
} as const;

// 2. Export individual constants
export const {
  POLICY_NAME,
  ANOTHER_POLICY,
} = POLICIES;
```

### Using in Components

**Method 1: Import object**
```typescript
import { POLICIES } from "@/constants/policies";

export function MyComponent() {
  return <p>{POLICIES.RETURN_POLICY}</p>;
}
```

**Method 2: Import specific constant (recommended)**
```typescript
import { RETURN_POLICY } from "@/constants/policies";

export function MyComponent() {
  return <p>{RETURN_POLICY}</p>;
}
```

### Extending Constants

**Add new policies:**
```typescript
export const POLICIES = {
  // Existing
  RETURN_POLICY: "No Return Policy",
  
  // Add new
  SHIPPING: "Free Shipping",
  EXCHANGE: "7-Day Exchange",
} as const;

export const {
  RETURN_POLICY,
  SHIPPING,
  EXCHANGE,
} = POLICIES;
```

---

## Accessibility Patterns

### ARIA Labels

**SearchBar Example:**
```tsx
<button
  aria-label="Search products"
  aria-expanded={isOpen}
  onClick={toggleSearch}
>
  <SearchIcon />
</button>

<input
  aria-label="Search products"
  placeholder="Search..."
  onKeyDown={(e) => e.key === "Enter" && search()}
/>
```

### Keyboard Navigation

**Escape Key Handler:**
```typescript
useEffect(() => {
  function handleEscape(event: KeyboardEvent) {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  if (isOpen) {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }
}, [isOpen]);
```

### Touch Targets

**Web Content Accessibility Guidelines (WCAG):**
```tsx
// ✅ Good - 44px minimum
<button className="p-2 h-10 w-10">
  {/* 40px minimum touch target when padded */}
</button>

// ❌ Bad - Too small
<button className="h-6 w-6">
  {/* Only 24px - hard to tap */}
</button>
```

---

## Code Examples

### Complete SearchBar Implementation

```typescript
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && 
          !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full md:w-auto">
      {/* Mobile Search Icon */}
      <button
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Search products"
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {/* Mobile Full-Width Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed md:hidden top-20 left-0 right-0 z-50 
                       bg-background border-b border-border shadow-lg"
          >
            <div className="container px-4 py-4 flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search perfumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg 
                          border border-border focus:ring-2 
                          focus:ring-primary"
              />
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Expandable Search */}
      <div className="hidden md:flex items-center relative">
        <div className={`transition-all duration-300 
                       ${isOpen ? "w-64" : "w-12"}`}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border-border 
                      focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );
}
```

### Complete Policy Implementation

**1. Create Constants**
```typescript
// src/constants/policies.ts
export const POLICIES = {
  RETURN_POLICY: "No Return Policy",
  RETURN_POLICY_DESCRIPTION: "No returns accepted",
  DELIVERY: "Free Delivery",
  DELIVERY_DESCRIPTION: "Orders over $50",
  SECURITY: "Secure Checkout",
  SECURITY_DESCRIPTION: "100% secure payment",
  AUTHENTIC: "100% Authentic Products",
  AUTHENTIC_DESCRIPTION: "Guaranteed",
} as const;

export const {
  RETURN_POLICY,
  RETURN_POLICY_DESCRIPTION,
  DELIVERY,
  DELIVERY_DESCRIPTION,
} = POLICIES;
```

**2. Use in Components**
```typescript
// src/pages/ProductDetail.tsx
import { RETURN_POLICY } from "@/constants/policies";

export default function ProductDetail() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <h3>{RETURN_POLICY}</h3>
        <p>Not accepted</p>
      </div>
    </div>
  );
}
```

---

## Input Validation Pattern

**For Search/Form Inputs:**

```typescript
// ✅ Good - Validate input
if (!searchQuery.trim()) {
  return null;  // Don't render results
}

const filtered = items.filter(item =>
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
);

// ✅ Good - Safe array access
if (!items || items.length === 0) {
  return <div>No results</div>;
}
```

---

## Testing Guidelines

### Unit Testing

```typescript
// SearchBar.test.tsx
describe("SearchBar", () => {
  it("should focus input when opened", () => {
    const { getByRole } = render(<SearchBar />);
    const button = getByRole("button", { name: /search/i });
    fireEvent.click(button);
    
    expect(getByRole("textbox")).toHaveFocus();
  });

  it("should close on escape key", () => {
    render(<SearchBar />);
    fireEvent.keyDown(document, { key: "Escape" });
    
    expect(getByRole("dialog")).not.toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

```
□ Click search icon on mobile → Panel opens
□ Type search query → Results show
□ Click close (X) → Panel closes
□ Press Escape key → Panel closes
□ Click outside → Panel closes
□ Tab key navigates results
□ Touch targets all 44px+
□ Screen reader announces labels
□ No layout shifts on resize
□ Works on all browsers
```

---

## Performance Optimization

### Memoization (If Needed)

```typescript
import { memo } from "react";

const SearchBar = memo(function SearchBar() {
  // Component logic
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip render)
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});

export default SearchBar;
```

### Lazy Loading Results

```typescript
// Only render visible results
const ITEMS_PER_PAGE = 10;
const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);

const visibleResults = results.slice(0, displayCount);

// Load more on scroll
<div 
  onScroll={(e) => {
    if (scrolledToBottom) {
      setDisplayCount(prev => prev + ITEMS_PER_PAGE);
    }
  }}
>
  {visibleResults.map(result => (...))}
</div>
```

---

## Debugging Tips

### Check Responsive Styles

```bash
# Use DevTools Device Emulation
1. Open Chrome DevTools (F12)
2. Click Device Toolbar (Cmd+Shift+M)
3. Select mobile device
4. Resize window to test breakpoints
5. Check computed styles for each breakpoint
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Responsive classes not working | Rebuild Tailwind (npm run build) |
| z-index conflicts | Use fixed positions, increase z-50+ |
| Layout shifts on resize | Add container width constraints |
| Touch not working | Increase button size to 44px |
| Mobile menu overlaps | Use z-index, adjust positioning |

---

## Production Checklist

Before deploying to production:

```
Code Quality
□ No console errors
□ No TypeScript errors
□ All imports valid
□ No unused imports

Responsive Design
□ Looks good on 320px (iPhone SE)
□ Looks good on 640px (iPad)
□ Looks good on 1024px (Desktop)

Accessibility
□ Focus indicators visible
□ Screen reader friendly
□ Keyboard navigation works
□ WCAG 2.1 AA compliant

Performance
□ Page loads < 3 seconds
□ Search results < 300ms
□ No layout shifts (CLS)

Browser Support
□ Chrome latest
□ Firefox latest
□ Safari 14+
□ Edge 90+
```

---

## Summary

**Mobile-First Strategy:**
- Define styles for mobile first
- Use media queries to enhance for larger screens
- Test at all breakpoints: 320px, 640px, 768px, 1024px

**Responsive Classes:**
- `w-full` - Mobile width
- `md:w-auto` - Desktop width
- `p-2 sm:p-4` - Scaling padding
- `hidden md:flex` - Show/hide based on screen

**Constants Management:**
- One file for policies
- Export individual constants
- Import in components
- Update in one place

**Accessibility:**
- Add aria-labels
- Support keyboard navigation (Escape)
- Maintain 44px touch targets
- Test with screen readers

---

**Status:** ✅ Production Ready  
**Last Updated:** 2026-02-15
