import axios from 'axios';
import { API_CONFIG, DEFAULT_PARAMS } from '../config/apiConfig.js';

class OMDBApi {
  constructor() {
    this.baseURL = API_CONFIG.OMDB.BASE_URL;
    this.apiKey = API_CONFIG.OMDB.API_KEY;
    
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: this.baseURL,
      params: {
        apikey: this.apiKey,
        ...DEFAULT_PARAMS.OMDB
      }
    });
  }

  // Search by title
  async searchByTitle(title, year = null, type = null) {
    try {
      const params = { t: title };
      if (year) params.y = year;
      if (type) params.type = type; // movie, series, episode
      
      const response = await this.api.get('/', { params });
      
      if (response.data.Response === 'False') {
        return null;
      }
      
      return this.transformOMDBData(response.data);
    } catch (error) {
      console.error('Error searching OMDB by title:', error);
      return null;
    }
  }

  // Search by IMDB ID
  async searchByIMDBId(imdbId) {
    try {
      const response = await this.api.get('/', {
        params: { i: imdbId }
      });
      
      if (response.data.Response === 'False') {
        return null;
      }
      
      return this.transformOMDBData(response.data);
    } catch (error) {
      console.error('Error searching OMDB by IMDB ID:', error);
      return null;
    }
  }

  // Search multiple results
  async search(query, page = 1, type = null) {
    try {
      const params = { s: query, page };
      if (type) params.type = type;
      
      const response = await this.api.get('/', { params });
      
      if (response.data.Response === 'False') {
        return [];
      }
      
      return response.data.Search.map(item => this.transformSearchResult(item));
    } catch (error) {
      console.error('Error searching OMDB:', error);
      return [];
    }
  }

  // Transform OMDB detailed data
  transformOMDBData(data) {
    return {
      imdbId: data.imdbID,
      title: data.Title,
      year: data.Year,
      rated: data.Rated,
      released: data.Released,
      runtime: data.Runtime,
      genre: data.Genre ? data.Genre.split(', ') : [],
      director: data.Director,
      writer: data.Writer,
      actors: data.Actors ? data.Actors.split(', ') : [],
      plot: data.Plot,
      language: data.Language,
      country: data.Country,
      awards: data.Awards,
      poster: data.Poster !== 'N/A' ? data.Poster : null,
      ratings: this.transformRatings(data.Ratings || []),
      metascore: data.Metascore !== 'N/A' ? parseFloat(data.Metascore) : null,
      imdbRating: data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null,
      imdbVotes: data.imdbVotes !== 'N/A' ? data.imdbVotes.replace(/,/g, '') : null,
      type: data.Type,
      dvd: data.DVD,
      boxOffice: data.BoxOffice,
      production: data.Production,
      website: data.Website,
      // TV Show specific
      totalSeasons: data.totalSeasons,
      // Additional fields
      response: data.Response
    };
  }

  // Transform search results
  transformSearchResult(item) {
    return {
      imdbId: item.imdbID,
      title: item.Title,
      year: item.Year,
      type: item.Type,
      poster: item.Poster !== 'N/A' ? item.Poster : null
    };
  }

  // Transform ratings array
  transformRatings(ratings) {
    const ratingMap = {};
    
    ratings.forEach(rating => {
      switch (rating.Source) {
        case 'Internet Movie Database':
          ratingMap.imdb = parseFloat(rating.Value.split('/')[0]);
          break;
        case 'Rotten Tomatoes':
          ratingMap.rottenTomatoes = parseInt(rating.Value.replace('%', ''));
          break;
        case 'Metacritic':
          ratingMap.metacritic = parseInt(rating.Value.split('/')[0]);
          break;
        default:
          ratingMap[rating.Source.toLowerCase().replace(/\s+/g, '_')] = rating.Value;
      }
    });
    
    return ratingMap;
  }

  // Helper method to extract year from date string
  extractYear(dateString) {
    if (!dateString) return null;
    const year = new Date(dateString).getFullYear();
    return isNaN(year) ? null : year;
  }

  // Helper method to determine content type from TMDB data
  getOMDBType(tmdbType) {
    switch (tmdbType) {
      case 'movie':
        return 'movie';
      case 'tv':
        return 'series';
      default:
        return null;
    }
  }
}

// Export singleton instance
export default new OMDBApi();
