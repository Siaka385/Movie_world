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
