import tmdbApi from './tmdbApi.js';
import omdbApi from './omdbApi.js';

class ApiService {
  constructor() {
    this.tmdb = tmdbApi;
    this.omdb = omdbApi;
    this.genreCache = new Map();
  }

  // Get trending content with enhanced data
  async getTrendingContent(page = 1) {
    try {
      const tmdbResponse = await this.tmdb.getTrending('day', page);
      const enhancedResults = await this.enhanceWithOMDBData(tmdbResponse.results);

      return {
        results: enhancedResults,
        page: tmdbResponse.page,
        totalPages: tmdbResponse.totalPages,
        totalResults: tmdbResponse.totalResults
      };
    } catch (error) {
      console.error('Error fetching trending content:', error);
      throw error;
    }
  }

  // Get trending movies with enhanced data
  async getTrendingMovies(page = 1) {
    try {
      const tmdbData = await this.tmdb.getTrendingMovies('day', page);
      return await this.enhanceWithOMDBData(tmdbData);
    } catch (error) {
      console.error('Error fetching trending movies:', error);
      throw error;
    }
  }

  // Get trending TV shows with enhanced data
  async getTrendingTV(page = 1) {
    try {
      const tmdbData = await this.tmdb.getTrendingTV('day', page);
      return await this.enhanceWithOMDBData(tmdbData);
    } catch (error) {
      console.error('Error fetching trending TV shows:', error);
      throw error;
    }
  }

  // Search content with enhanced data
  async searchContent(query, page = 1) {
    try {
      if (!query.trim()) return {
        results: [],
        page: 1,
        totalPages: 0,
        totalResults: 0
      };

      const tmdbResponse = await this.tmdb.searchMulti(query, page);
      const enhancedResults = await this.enhanceWithOMDBData(tmdbResponse.results);

      return {
        results: enhancedResults,
        page: tmdbResponse.page,
        totalPages: tmdbResponse.totalPages,
        totalResults: tmdbResponse.totalResults
      };
    } catch (error) {
      console.error('Error searching content:', error);
      throw error;
    }
  }

  // Get detailed content information
  async getContentDetails(id, type) {
    try {
      let tmdbData;

      if (type === 'movie') {
        tmdbData = await this.tmdb.getMovieDetails(id);
      } else if (type === 'tv') {
        tmdbData = await this.tmdb.getTVDetails(id);
      } else {
        throw new Error('Invalid content type');
      }

      // Enhance with OMDB data if IMDB ID is available
      if (tmdbData.imdbId) {
        const omdbData = await this.omdb.searchByIMDBId(tmdbData.imdbId);
        if (omdbData) {
          return this.mergeDetailedData(tmdbData, omdbData);
        }
      }

      // Fallback: try to find OMDB data by title and year
      const omdbData = await this.omdb.searchByTitle(
        tmdbData.title,
        tmdbData.year,
        this.omdb.getOMDBType(tmdbData.type)
      );

      if (omdbData) {
        return this.mergeDetailedData(tmdbData, omdbData);
      }

      return tmdbData;
    } catch (error) {
      console.error('Error fetching content details:', error);
      throw error;
    }
  }

  // Discover content with filters
  async discoverContent(type = 'all', filters = {}) {
    try {
      let tmdbData = [];

      if (type === 'all' || type === 'movie') {
        const movies = await this.tmdb.discoverMovies(filters);
        tmdbData = [...tmdbData, ...movies];
      }

      if (type === 'all' || type === 'tv') {
        const tvShows = await this.tmdb.discoverTV(filters);
        tmdbData = [...tmdbData, ...tvShows];
      }

      return await this.enhanceWithOMDBData(tmdbData);
    } catch (error) {
      console.error('Error discovering content:', error);
      throw error;
    }
  }

  // Get genres for movies and TV shows
  async getGenres() {
    try {
      if (this.genreCache.has('all')) {
        return this.genreCache.get('all');
      }

      const [movieGenres, tvGenres] = await Promise.all([
        this.tmdb.getMovieGenres(),
        this.tmdb.getTVGenres()
      ]);

      // Combine and deduplicate genres
      const allGenres = [...movieGenres, ...tvGenres];
      const uniqueGenres = allGenres.reduce((acc, genre) => {
        if (!acc.find(g => g.id === genre.id)) {
          acc.push(genre);
        }
        return acc;
      }, []);

      this.genreCache.set('all', uniqueGenres);
      return uniqueGenres;
    } catch (error) {
      console.error('Error fetching genres:', error);
      throw error;
    }
  }

  // Enhance TMDB data with OMDB ratings and additional info
  async enhanceWithOMDBData(tmdbItems, maxConcurrent = 5) {
    if (!Array.isArray(tmdbItems) || tmdbItems.length === 0) {
      return tmdbItems;
    }

    // Process items in batches to avoid rate limiting
    const enhancedItems = [];

    for (let i = 0; i < tmdbItems.length; i += maxConcurrent) {
      const batch = tmdbItems.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (item) => {
        try {
          // Try to get OMDB data by title and year
          const omdbData = await this.omdb.searchByTitle(
            item.title,
            item.year,
            this.omdb.getOMDBType(item.type)
          );

          if (omdbData) {
            return this.mergeBasicData(item, omdbData);
          }

          return item;
        } catch (error) {
          console.warn(`Failed to enhance item ${item.title}:`, error);
          return item;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      enhancedItems.push(...batchResults);
    }

    return enhancedItems;
  }

  // Merge basic TMDB and OMDB data
  mergeBasicData(tmdbItem, omdbItem) {
    return {
      ...tmdbItem,
      // Keep TMDB data as primary, enhance with OMDB
      imdb: omdbItem.imdbRating || tmdbItem.rating,
      rottenTomatoes: omdbItem.ratings?.rottenTomatoes || null,
      metacritic: omdbItem.ratings?.metacritic || null,
      imdbId: omdbItem.imdbId,
      rated: omdbItem.rated,
      awards: omdbItem.awards,
      // Enhanced plot from OMDB if available and longer
      plot: (omdbItem.plot && omdbItem.plot.length > tmdbItem.plot.length)
        ? omdbItem.plot
        : tmdbItem.plot,
      // Enhanced cast from OMDB if TMDB cast is empty
      cast: tmdbItem.cast && tmdbItem.cast.length > 0
        ? tmdbItem.cast
        : omdbItem.actors || [],
      director: omdbItem.director || tmdbItem.director,
      writer: omdbItem.writer,
      boxOffice: omdbItem.boxOffice,
      runtime: omdbItem.runtime || tmdbItem.runtime
    };
  }

  // Merge detailed TMDB and OMDB data
  mergeDetailedData(tmdbItem, omdbItem) {
    return {
      ...tmdbItem,
      // Enhanced ratings
      imdb: omdbItem.imdbRating || tmdbItem.rating,
      rottenTomatoes: omdbItem.ratings?.rottenTomatoes || null,
      metacritic: omdbItem.ratings?.metacritic || null,
      metascore: omdbItem.metascore,
      imdbVotes: omdbItem.imdbVotes,

      // Enhanced metadata
      imdbId: omdbItem.imdbId,
      rated: omdbItem.rated,
      awards: omdbItem.awards,
      language: omdbItem.language,
      country: omdbItem.country,

      // Enhanced plot and cast
      plot: (omdbItem.plot && omdbItem.plot.length > tmdbItem.plot.length)
        ? omdbItem.plot
        : tmdbItem.plot,
      cast: tmdbItem.cast && tmdbItem.cast.length > 0
        ? tmdbItem.cast
        : omdbItem.actors || [],

      // Enhanced crew information
      director: omdbItem.director || tmdbItem.director,
      writer: omdbItem.writer,

      // Financial information
      boxOffice: omdbItem.boxOffice,

      // Technical information
      runtime: omdbItem.runtime || tmdbItem.runtime,
      dvd: omdbItem.dvd,
      website: omdbItem.website,

      // Production information
      production: omdbItem.production || tmdbItem.productionCompanies?.join(', '),

      // TV specific
      totalSeasons: omdbItem.totalSeasons || tmdbItem.numberOfSeasons
    };
  }

  // Convert genre IDs to names
  async convertGenreIds(genreIds) {
    try {
      const genres = await this.getGenres();
      return genreIds.map(id => {
        const genre = genres.find(g => g.id === id);
        return genre ? genre.name : 'Unknown';
      });
    } catch (error) {
      console.error('Error converting genre IDs:', error);
      return [];
    }
  }

  // Helper method to check if APIs are configured
  isConfigured() {
    return {
      tmdb: !!this.tmdb.apiKey,
      omdb: !!this.omdb.apiKey,
      both: !!this.tmdb.apiKey && !!this.omdb.apiKey
    };
  }
}

// Export singleton instance
export default new ApiService();
