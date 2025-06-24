import axios from 'axios';
import { API_CONFIG, DEFAULT_PARAMS } from '../config/apiConfig.js';

class TMDBApi {
  constructor() {
    this.baseURL = API_CONFIG.TMDB.BASE_URL;
    this.apiKey = API_CONFIG.TMDB.API_KEY;
    this.imageBaseURL = API_CONFIG.TMDB.IMAGE_BASE_URL;
    
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
      params: {
        api_key: this.apiKey,
        ...DEFAULT_PARAMS.TMDB
      }
    });
  }

  // Helper method to build image URLs
  getImageURL(path, size = 'w500') {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }

  // Get trending content (movies and TV shows)
  async getTrending(timeWindow = 'day', page = 1) {
    try {
      const response = await this.api.get(API_CONFIG.TMDB.ENDPOINTS.TRENDING_ALL, {
        params: { page }
      });
      return this.transformTrendingData(response.data.results);
    } catch (error) {
      console.error('Error fetching trending content:', error);
      throw new Error('Failed to fetch trending content');
    }
  }

  // Get trending movies
  async getTrendingMovies(timeWindow = 'day', page = 1) {
    try {
      const response = await this.api.get(API_CONFIG.TMDB.ENDPOINTS.TRENDING_MOVIES, {
        params: { page }
      });
      return this.transformMovieData(response.data.results);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      throw new Error('Failed to fetch trending movies');
    }
  }

  // Get trending TV shows
  async getTrendingTV(timeWindow = 'day', page = 1) {
    try {
      const response = await this.api.get(API_CONFIG.TMDB.ENDPOINTS.TRENDING_TV, {
        params: { page }
      });
      return this.transformTVData(response.data.results);
    } catch (error) {
      console.error('Error fetching trending TV shows:', error);
      throw new Error('Failed to fetch trending TV shows');
    }
  }

  // Search for movies, TV shows, and people
  async searchMulti(query, page = 1) {
    try {
      if (!query.trim()) return [];
      
      const response = await this.api.get(API_CONFIG.TMDB.ENDPOINTS.SEARCH_MULTI, {
        params: { query, page }
      });
      return this.transformSearchData(response.data.results);
    } catch (error) {
      console.error('Error searching content:', error);
      throw new Error('Failed to search content');
    }
  }

  // Get movie details
  async getMovieDetails(movieId) {
    try {
      const response = await this.api.get(`${API_CONFIG.TMDB.ENDPOINTS.MOVIE_DETAILS}/${movieId}`, {
        params: {
          append_to_response: 'credits,videos,similar,reviews'
        }
      });
      return this.transformMovieDetails(response.data);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw new Error('Failed to fetch movie details');
    }
  }

  // Get TV show details
  async getTVDetails(tvId) {
    try {
      const response = await this.api.get(`${API_CONFIG.TMDB.ENDPOINTS.TV_DETAILS}/${tvId}`, {
        params: {
          append_to_response: 'credits,videos,similar,reviews'
        }
      });
      return this.transformTVDetails(response.data);
    } catch (error) {
      console.error('Error fetching TV details:', error);
      throw new Error('Failed to fetch TV details');
    }
  }

  // Discover movies with filters
  async discoverMovies(filters = {}) {
    try {
      const response = await this.api.get(API_CONFIG.TMDB.ENDPOINTS.DISCOVER_MOVIE, {
        params: {
          ...filters,
          sort_by: filters.sort_by || 'popularity.desc'
        }
      });
      return this.transformMovieData(response.data.results);
    } catch (error) {
      console.error('Error discovering movies:', error);
      throw new Error('Failed to discover movies');
    }
  }

  // Discover TV shows with filters
  async discoverTV(filters = {}) {
    try {
      const response = await this.api.get(API_CONFIG.TMDB.ENDPOINTS.DISCOVER_TV, {
        params: {
          ...filters,
          sort_by: filters.sort_by || 'popularity.desc'
        }
      });
      return this.transformTVData(response.data.results);
    } catch (error) {
      console.error('Error discovering TV shows:', error);
      throw new Error('Failed to discover TV shows');
    }
  }

  // Get movie genres
  async getMovieGenres() {
    try {
      const response = await this.api.get(API_CONFIG.TMDB.ENDPOINTS.GENRES_MOVIE);
      return response.data.genres;
    } catch (error) {
      console.error('Error fetching movie genres:', error);
      throw new Error('Failed to fetch movie genres');
    }
  }

  // Get TV genres
  async getTVGenres() {
    try {
      const response = await this.api.get(API_CONFIG.TMDB.ENDPOINTS.GENRES_TV);
      return response.data.genres;
    } catch (error) {
      console.error('Error fetching TV genres:', error);
      throw new Error('Failed to fetch TV genres');
    }
  }

  // Transform trending data (mixed movies and TV)
  transformTrendingData(results) {
    return results.map(item => ({
      id: item.id,
      tmdbId: item.id,
      title: item.title || item.name,
      type: item.media_type === 'movie' ? 'movie' : 'tv',
      year: new Date(item.release_date || item.first_air_date || '').getFullYear() || 'N/A',
      genre: item.genre_ids || [],
      plot: item.overview || 'No plot available',
      rating: item.vote_average || 0,
      tmdb: item.vote_average || 0,
      poster: this.getImageURL(item.poster_path, API_CONFIG.TMDB.IMAGE_SIZES.POSTER),
      backdrop: this.getImageURL(item.backdrop_path, API_CONFIG.TMDB.IMAGE_SIZES.BACKDROP),
      releaseDate: item.release_date || item.first_air_date || '',
      popularity: item.popularity || 0,
      voteCount: item.vote_count || 0,
      originalLanguage: item.original_language || 'en'
    }));
  }

  // Transform movie data
  transformMovieData(results) {
    return results.map(movie => ({
      id: movie.id,
      tmdbId: movie.id,
      title: movie.title,
      type: 'movie',
      year: new Date(movie.release_date || '').getFullYear() || 'N/A',
      genre: movie.genre_ids || [],
      plot: movie.overview || 'No plot available',
      rating: movie.vote_average || 0,
      tmdb: movie.vote_average || 0,
      poster: this.getImageURL(movie.poster_path, API_CONFIG.TMDB.IMAGE_SIZES.POSTER),
      backdrop: this.getImageURL(movie.backdrop_path, API_CONFIG.TMDB.IMAGE_SIZES.BACKDROP),
      releaseDate: movie.release_date || '',
      popularity: movie.popularity || 0,
      voteCount: movie.vote_count || 0,
      originalLanguage: movie.original_language || 'en'
    }));
  }

  // Transform TV data
  transformTVData(results) {
    return results.map(tv => ({
      id: tv.id,
      tmdbId: tv.id,
      title: tv.name,
      type: 'tv',
      year: new Date(tv.first_air_date || '').getFullYear() || 'N/A',
      genre: tv.genre_ids || [],
      plot: tv.overview || 'No plot available',
      rating: tv.vote_average || 0,
      tmdb: tv.vote_average || 0,
      poster: this.getImageURL(tv.poster_path, API_CONFIG.TMDB.IMAGE_SIZES.POSTER),
      backdrop: this.getImageURL(tv.backdrop_path, API_CONFIG.TMDB.IMAGE_SIZES.BACKDROP),
      releaseDate: tv.first_air_date || '',
      popularity: tv.popularity || 0,
      voteCount: tv.vote_count || 0,
      originalLanguage: tv.original_language || 'en'
    }));
  }

  // Transform search data
  transformSearchData(results) {
    return results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(item => ({
        id: item.id,
        tmdbId: item.id,
        title: item.title || item.name,
        type: item.media_type === 'movie' ? 'movie' : 'tv',
        year: new Date(item.release_date || item.first_air_date || '').getFullYear() || 'N/A',
        genre: item.genre_ids || [],
        plot: item.overview || 'No plot available',
        rating: item.vote_average || 0,
        tmdb: item.vote_average || 0,
        poster: this.getImageURL(item.poster_path, API_CONFIG.TMDB.IMAGE_SIZES.POSTER),
        backdrop: this.getImageURL(item.backdrop_path, API_CONFIG.TMDB.IMAGE_SIZES.BACKDROP),
        releaseDate: item.release_date || item.first_air_date || '',
        popularity: item.popularity || 0,
        voteCount: item.vote_count || 0,
        originalLanguage: item.original_language || 'en'
      }));
  }

  // Transform detailed movie data
  transformMovieDetails(movie) {
    return {
      id: movie.id,
      tmdbId: movie.id,
      imdbId: movie.imdb_id,
      title: movie.title,
      type: 'movie',
      year: new Date(movie.release_date || '').getFullYear() || 'N/A',
      genre: movie.genres?.map(g => g.name) || [],
      plot: movie.overview || 'No plot available',
      rating: movie.vote_average || 0,
      tmdb: movie.vote_average || 0,
      poster: this.getImageURL(movie.poster_path, API_CONFIG.TMDB.IMAGE_SIZES.POSTER),
      backdrop: this.getImageURL(movie.backdrop_path, API_CONFIG.TMDB.IMAGE_SIZES.BACKDROP),
      releaseDate: movie.release_date || '',
      runtime: movie.runtime || 0,
      budget: movie.budget || 0,
      revenue: movie.revenue || 0,
      cast: movie.credits?.cast?.slice(0, 10).map(actor => actor.name) || [],
      director: movie.credits?.crew?.find(person => person.job === 'Director')?.name || 'Unknown',
      popularity: movie.popularity || 0,
      voteCount: movie.vote_count || 0,
      originalLanguage: movie.original_language || 'en',
      productionCompanies: movie.production_companies?.map(company => company.name) || [],
      similar: this.transformMovieData(movie.similar?.results || [])
    };
  }

  // Transform detailed TV data
  transformTVDetails(tv) {
    return {
      id: tv.id,
      tmdbId: tv.id,
      imdbId: tv.external_ids?.imdb_id,
      title: tv.name,
      type: 'tv',
      year: new Date(tv.first_air_date || '').getFullYear() || 'N/A',
      genre: tv.genres?.map(g => g.name) || [],
      plot: tv.overview || 'No plot available',
      rating: tv.vote_average || 0,
      tmdb: tv.vote_average || 0,
      poster: this.getImageURL(tv.poster_path, API_CONFIG.TMDB.IMAGE_SIZES.POSTER),
      backdrop: this.getImageURL(tv.backdrop_path, API_CONFIG.TMDB.IMAGE_SIZES.BACKDROP),
      releaseDate: tv.first_air_date || '',
      numberOfSeasons: tv.number_of_seasons || 0,
      numberOfEpisodes: tv.number_of_episodes || 0,
      episodeRunTime: tv.episode_run_time?.[0] || 0,
      cast: tv.credits?.cast?.slice(0, 10).map(actor => actor.name) || [],
      creator: tv.created_by?.[0]?.name || 'Unknown',
      popularity: tv.popularity || 0,
      voteCount: tv.vote_count || 0,
      originalLanguage: tv.original_language || 'en',
      networks: tv.networks?.map(network => network.name) || [],
      similar: this.transformTVData(tv.similar?.results || [])
    };
  }
}

// Export singleton instance
export default new TMDBApi();
