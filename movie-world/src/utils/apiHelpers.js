// API Helper functions

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Format runtime from minutes to hours and minutes
export const formatRuntime = (minutes) => {
  if (!minutes || minutes === 0) return 'N/A';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// Format box office numbers
export const formatBoxOffice = (amount) => {
  if (!amount || amount === 'N/A') return 'N/A';

  // Remove currency symbols and commas
  const numStr = amount.replace(/[$,]/g, '');
  const num = parseFloat(numStr);

  if (isNaN(num)) return amount;

  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }

  return `$${num.toLocaleString()}`;
};

// Format vote count
export const formatVoteCount = (count) => {
  if (!count || count === 0) return '0';

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  return count.toLocaleString();
};

// Format release date
export const formatReleaseDate = (dateString) => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.log(error)
    return dateString;
  }
};

// Get rating color based on score
export const getRatingColor = (rating) => {
  if (rating >= 8) return 'text-green-400';
  if (rating >= 6) return 'text-yellow-400';
  if (rating >= 4) return 'text-orange-400';
  return 'text-red-400';
};

// Get rating background color
export const getRatingBgColor = (rating) => {
  if (rating >= 8) return 'bg-green-600';
  if (rating >= 6) return 'bg-yellow-600';
  if (rating >= 4) return 'bg-orange-600';
  return 'bg-red-600';
};

// Truncate text to specified length
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Generate placeholder image URL
export const getPlaceholderImage = (width = 300, height = 450, text = 'No Image') => {
  return `https://via.placeholder.com/${width}x${height}/1a1a2e/16213e?text=${encodeURIComponent(text)}`;
};

// Handle image loading errors
export const handleImageError = (event, fallbackText = 'No Image') => {
  event.target.src = getPlaceholderImage(300, 450, fallbackText);
};

// Validate API keys
export const validateApiKeys = () => {
  const tmdbKey = import.meta.env.VITE_TMDB_API_KEY;
  const omdbKey = import.meta.env.VITE_OMDB_API_KEY;

  return {
    tmdb: !!tmdbKey,
    omdb: !!omdbKey,
    both: !!tmdbKey && !!omdbKey,
    missing: {
      tmdb: !tmdbKey,
      omdb: !omdbKey
    }
  };
};

// Create error message for missing API keys
export const getApiKeyErrorMessage = () => {
  const validation = validateApiKeys();

  if (validation.both) return null;

  const missing = [];
  if (validation.missing.tmdb) missing.push('TMDB');
  if (validation.missing.omdb) missing.push('OMDB');

  return `Missing API keys: ${missing.join(', ')}. Please add them to your .env file.`;
};

// Retry function for failed API calls
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Cache implementation for API responses
export class ApiCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes default TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data) {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    });
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// Create a global cache instance
export const apiCache = new ApiCache();

// Error handling utilities
export const handleApiError = (error, context = 'API call') => {
  console.error(`Error in ${context}:`, error);

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.message;

    switch (status) {
      case 401:
        return 'Invalid API key. Please check your configuration.';
      case 404:
        return 'Content not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Error ${status}: ${message}`;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your internet connection.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred.';
  }
};

// Loading state management
export class LoadingManager {
  constructor() {
    this.loadingStates = new Map();
  }

  setLoading(key, isLoading) {
    this.loadingStates.set(key, isLoading);
  }

  isLoading(key) {
    return this.loadingStates.get(key) || false;
  }

  clearAll() {
    this.loadingStates.clear();
  }
}

export const loadingManager = new LoadingManager();

// Pagination utilities
export const createPaginationInfo = (currentPage, totalPages, totalResults) => {
  return {
    currentPage: parseInt(currentPage) || 1,
    totalPages: parseInt(totalPages) || 1,
    totalResults: parseInt(totalResults) || 0,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  };
};

// Generate page numbers for pagination display
export const generatePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const pages = [];
  const half = Math.floor(maxVisible / 2);

  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  // Adjust start if we're near the end
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
};

// Calculate items range for current page
export const getItemsRange = (currentPage, itemsPerPage, totalItems) => {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);
  return { start, end };
};

// Pagination component helper
export const PaginationButton = ({
  page,
  currentPage,
  onClick,
  disabled = false,
  children,
  className = ''
}) => {
  const baseClasses = 'px-3 py-2 text-sm font-medium rounded-lg transition-colors';
  const activeClasses = 'bg-blue-600 text-white';
  const inactiveClasses = 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white';
  const disabledClasses = 'bg-gray-800 text-gray-500 cursor-not-allowed';
 console.log(children)
  const classes = `${baseClasses} ${
    disabled
      ? disabledClasses
      : page === currentPage
      ? activeClasses
      : inactiveClasses
  } ${className}`;

  return {
    classes,
    onClick: disabled ? undefined : () => onClick(page),
    disabled
  };
};

// Infinite scroll utilities
export const createInfiniteScrollObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback();
      }
    });
  }, defaultOptions);
};

// Scroll to top utility
export const scrollToTop = (behavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    behavior
  });
};

// URL parameter utilities for pagination
export const updateUrlWithPage = (page, searchParams = new URLSearchParams()) => {
  if (page > 1) {
    searchParams.set('page', page.toString());
  } else {
    searchParams.delete('page');
  }
  return searchParams.toString();
};

export const getPageFromUrl = (searchParams = new URLSearchParams()) => {
  const page = parseInt(searchParams.get('page')) || 1;
  return Math.max(1, page);
};
