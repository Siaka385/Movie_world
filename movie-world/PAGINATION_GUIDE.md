# Pagination Implementation Guide

This document explains the pagination functionality added to the Movie World application.

## Overview

Pagination has been implemented for both trending content and search results, allowing users to navigate through large datasets efficiently. The implementation includes:

- **Server-side pagination** using TMDB API
- **Responsive pagination controls** with page numbers
- **Loading states** during page transitions
- **URL-friendly pagination** (ready for future implementation)
- **Smooth scrolling** to top on page changes

## Features Implemented

### 1. Pagination Components

#### `Pagination.jsx`
A reusable pagination component that provides:
- Previous/Next navigation buttons
- Page number buttons with ellipsis for large page counts
- Results information display
- Responsive design for mobile and desktop
- Accessibility features (ARIA labels, keyboard navigation)

#### `LoadingSpinner.jsx`
A loading spinner component with:
- Multiple size options (sm, md, lg, xl)
- Smooth CSS animations
- Accessibility support

### 2. API Integration

#### Updated TMDB API Service
- Modified `getTrending()`, `getTrendingMovies()`, `searchMulti()` to return pagination metadata
- Returns structured response with:
  ```javascript
  {
    results: [...], // Array of content items
    page: 1,        // Current page number
    totalPages: 500, // Total number of pages
    totalResults: 10000 // Total number of results
  }
  ```

#### Enhanced API Service
- Updated `getTrendingContent()` and `searchContent()` to handle pagination
- Maintains backward compatibility
- Proper error handling for pagination requests

### 3. State Management

#### New State Variables
```javascript
const [currentPage, setCurrentPage] = useState(1);
const [searchPage, setSearchPage] = useState(1);
const [paginationInfo, setPaginationInfo] = useState({
  page: 1,
  totalPages: 1,
  totalResults: 0
});
const [searchPaginationInfo, setSearchPaginationInfo] = useState({
  page: 1,
  totalPages: 1,
  totalResults: 0
});
```

#### Pagination Handlers
- `handlePageChange(page)` - Handles trending content pagination
- `handleSearchPageChange(page)` - Handles search results pagination
- Automatic scroll to top on page changes
- Loading state management during transitions

### 4. User Experience Enhancements

#### Loading States
- **Search Loading**: Spinner with "Searching..." message
- **Page Loading**: Overlay spinner on content grid during pagination
- **Smooth Transitions**: Loading states prevent jarring content jumps

#### Visual Feedback
- **Active Page Highlighting**: Current page is visually distinct
- **Disabled States**: Previous/Next buttons disabled appropriately
- **Results Information**: Shows "X to Y of Z results" for context

#### Responsive Design
- **Mobile-First**: Pagination controls adapt to screen size
- **Touch-Friendly**: Adequate button sizes for mobile interaction
- **Flexible Layout**: Pagination info and controls stack on small screens

## Usage Examples

### Basic Pagination Usage
```jsx
<Pagination
  currentPage={paginationInfo.page}
  totalPages={paginationInfo.totalPages}
  totalResults={paginationInfo.totalResults}
  onPageChange={handlePageChange}
  className="mt-8"
/>
```

### Custom Configuration
```jsx
<Pagination
  currentPage={5}
  totalPages={100}
  totalResults={2000}
  itemsPerPage={20}
  onPageChange={(page) => console.log('Go to page:', page)}
  showInfo={true}
  maxVisible={7}
  className="my-4"
/>
```

## API Response Structure

### TMDB API Response
```javascript
{
  page: 1,
  results: [
    {
      id: 123,
      title: "Movie Title",
      // ... other movie data
    }
  ],
  total_pages: 500,
  total_results: 10000
}
```

### Transformed Response
```javascript
{
  results: [
    {
      id: 123,
      title: "Movie Title",
      type: "movie",
      // ... enhanced data with OMDB
    }
  ],
  page: 1,
  totalPages: 500,
  totalResults: 10000
}
```

## Utility Functions

### Pagination Helpers (`apiHelpers.js`)
```javascript
// Create pagination metadata
createPaginationInfo(currentPage, totalPages, totalResults)

// Generate page numbers for display
generatePageNumbers(currentPage, totalPages, maxVisible = 5)

// Calculate items range
getItemsRange(currentPage, itemsPerPage, totalItems)

// Scroll utilities
scrollToTop(behavior = 'smooth')

// URL parameter utilities (for future use)
updateUrlWithPage(page, searchParams)
getPageFromUrl(searchParams)
```

## Performance Considerations

### Optimizations Implemented
1. **Debounced Search**: 300ms delay prevents excessive API calls
2. **Loading States**: Prevent multiple simultaneous requests
3. **Error Handling**: Graceful fallbacks for failed requests
4. **Efficient Re-renders**: Minimal state updates during pagination

### API Rate Limiting
- **TMDB**: 40 requests per 10 seconds (generous for pagination)
- **OMDB**: 1,000 requests per day (enhanced data is cached)
- **Caching**: Results cached to minimize repeated requests

## Future Enhancements

### Planned Features
1. **URL Synchronization**: Update browser URL with current page
2. **Infinite Scroll**: Alternative pagination method
3. **Page Size Selection**: Allow users to choose items per page
4. **Keyboard Navigation**: Arrow keys for page navigation
5. **Prefetching**: Load next page in background

### Advanced Pagination
```javascript
// Infinite scroll implementation
const observer = createInfiniteScrollObserver(() => {
  if (hasNextPage && !isLoading) {
    loadNextPage();
  }
});

// URL synchronization
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const urlPage = getPageFromUrl(params);
  if (urlPage !== currentPage) {
    setCurrentPage(urlPage);
  }
}, []);
```

## Troubleshooting

### Common Issues

1. **Pagination Not Showing**
   - Check if `totalPages > 1`
   - Verify pagination info is properly set
   - Ensure API returns pagination metadata

2. **Loading States Stuck**
   - Check for unhandled promise rejections
   - Verify `setIsLoading(false)` in finally blocks
   - Check network connectivity

3. **Page Numbers Incorrect**
   - Verify API response structure
   - Check `createPaginationInfo()` parameters
   - Ensure page numbers are 1-indexed

### Debug Tips
```javascript
// Log pagination state
console.log('Pagination Info:', paginationInfo);
console.log('Current Page:', currentPage);
console.log('Filtered Content Length:', filteredContent.length);

// Check API responses
console.log('TMDB Response:', tmdbResponse);
console.log('Enhanced Results:', enhancedResults);
```

## Testing

### Manual Testing Checklist
- [ ] First page loads correctly
- [ ] Next/Previous buttons work
- [ ] Page numbers are clickable
- [ ] Loading states appear during transitions
- [ ] Search pagination works independently
- [ ] Mobile responsive design
- [ ] Error handling for invalid pages
- [ ] Scroll to top functionality

### Edge Cases
- [ ] Single page of results (pagination hidden)
- [ ] Empty search results
- [ ] Network errors during pagination
- [ ] Very large page numbers
- [ ] Rapid page changes

## Accessibility

### Features Implemented
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Tab through pagination controls
- **Focus Management**: Proper focus indicators
- **Screen Reader Support**: Announces page changes
- **Semantic HTML**: Proper button and navigation elements

### WCAG Compliance
- **Color Contrast**: Meets AA standards
- **Focus Indicators**: Visible focus outlines
- **Alternative Text**: Descriptive button labels
- **Keyboard Access**: All functionality available via keyboard

## Browser Support

### Tested Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Polyfills Required
- None (uses modern JavaScript features with broad support)

## Performance Metrics

### Target Performance
- **Page Load Time**: < 2 seconds
- **Pagination Response**: < 500ms
- **Search Response**: < 1 second
- **Smooth Animations**: 60fps

### Monitoring
- Monitor API response times
- Track user engagement with pagination
- Measure bounce rates on paginated content
