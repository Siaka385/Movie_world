// API Configuration
export const API_CONFIG = {
  TMDB: {
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    API_KEY: import.meta.env.VITE_TMDB_API_KEY || '', // You'll need to add this to your .env file
    ENDPOINTS: {
      TRENDING_ALL: '/trending/all/day',
      TRENDING_MOVIES: '/trending/movie/day',
      TRENDING_TV: '/trending/tv/day',
      SEARCH_MULTI: '/search/multi',
      SEARCH_MOVIE: '/search/movie',
      SEARCH_TV: '/search/tv',
      MOVIE_DETAILS: '/movie',
      TV_DETAILS: '/tv',
      DISCOVER_MOVIE: '/discover/movie',
      DISCOVER_TV: '/discover/tv',
      GENRES_MOVIE: '/genre/movie/list',
      GENRES_TV: '/genre/tv/list'
    },
    IMAGE_SIZES: {
      POSTER: 'w500',
      BACKDROP: 'w1280',
      PROFILE: 'w185'
    }
  },
  OMDB: {
    BASE_URL: 'https://www.omdbapi.com',
    API_KEY: import.meta.env.VITE_OMDB_API_KEY || '', // You'll need to add this to your .env file
    ENDPOINTS: {
      SEARCH: '/',
      BY_ID: '/',
      BY_TITLE: '/'
    }
  }
};

// Default request parameters
export const DEFAULT_PARAMS = {
  TMDB: {
    language: 'en-US',
    page: 1
  },
  OMDB: {
    type: '', // movie, series, episode
    plot: 'full',
    r: 'json'
  }
};
