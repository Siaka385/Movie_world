import React, { useState, useEffect } from 'react';
import { Search, Star, Plus, Check, Play, Calendar, Users, Filter, TrendingUp, Heart, X, AlertCircle } from 'lucide-react';
import apiService from './services/apiService.js';
import { getApiKeyErrorMessage, handleApiError } from './utils/apiHelpers.js';

const EntertainmentPlatform = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [watchedList, setWatchedList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [contentType, setContentType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingContent, setTrendingContent] = useState([]);
  const [genres, setGenres] = useState([]);
  const [error, setError] = useState(null);
  const [apiConfigured, setApiConfigured] = useState(false);










  // Initialize API and load data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if APIs are configured
        const config = apiService.isConfigured();
        setApiConfigured(config.tmdb);

        if (!config.tmdb) {
          setError(getApiKeyErrorMessage());
          return;
        }

        // Load initial data
        const [trendingData, genresData] = await Promise.all([
          apiService.getTrendingContent(),
          apiService.getGenres()
        ]);

        setTrendingContent(trendingData);
        setGenres([{ id: 'all', name: 'All' }, ...genresData]);

      } catch (err) {
        console.error('Error initializing app:', err);
        setError(handleApiError(err, 'initializing app'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Search with debouncing
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.length > 0) {
        try {
          setIsLoading(true);
          const results = await apiService.searchContent(searchQuery);
          setSearchResults(results);
        } catch (err) {
          console.error('Search error:', err);
          setError(handleApiError(err, 'searching content'));
          setSearchResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const filteredContent = trendingContent.filter(item => {
    const genreMatch = selectedGenre === 'all' || item.genre.some(g => {
      if (typeof g === 'string') {
        return g.toLowerCase() === selectedGenre.toLowerCase();
      }
      return false;
    });
    const typeMatch = contentType === 'all' || item.type === contentType;
    return genreMatch && typeMatch;
  });

  const addToWatchlist = (item) => {
    if (!watchlist.find(w => w.id === item.id)) {
      setWatchlist([...watchlist, item]);
    }
  };

  const removeFromWatchlist = (id) => {
    setWatchlist(watchlist.filter(item => item.id !== id));
  };

  const markAsWatched = (item) => {
    if (!watchedList.find(w => w.id === item.id)) {
      setWatchedList([...watchedList, item]);
      removeFromWatchlist(item.id);
    }
  };

  const getRecommendations = () => {
    if (watchlist.length === 0) return [];

    const watchlistGenres = watchlist.flatMap(item => item.genre);
    const genreCounts = watchlistGenres.reduce((acc, genre) => {
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {});

    const topGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([genre]) => genre);

    return trendingContent.filter(item =>
      !watchlist.find(w => w.id === item.id) &&
      !watchedList.find(w => w.id === item.id) &&
      item.genre.some(g => topGenres.includes(g))
    ).slice(0, 4);
  };

  const ContentCard = ({ item, showActions = true }) => (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 shadow-lg">
      <div className="relative">
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-xs font-bold ${
            item.type === 'movie' ? 'bg-blue-600' : 'bg-purple-600'
          } text-white`}>
            {item.type === 'movie' ? 'Movie' : 'TV Show'}
          </span>
        </div>
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 px-2 py-1 rounded flex items-center">
          <Star className="w-4 h-4 text-yellow-400 mr-1" />
          <span className="text-white text-sm">{item.rating}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
        <p className="text-gray-400 text-sm mb-2">{item.year} • {item.genre.join(', ')}</p>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{item.plot}</p>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedItem(item)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-4 h-4" />
              Details
            </button>

            {!watchlist.find(w => w.id === item.id) && !watchedList.find(w => w.id === item.id) ? (
              <button
                onClick={() => addToWatchlist(item)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            ) : watchedList.find(w => w.id === item.id) ? (
              <button className="bg-green-600 text-white px-3 py-2 rounded text-sm font-medium flex items-center justify-center">
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => markAsWatched(item)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center justify-center transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const DetailModal = ({ item, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col md:flex-row">
            <img
              src={item.poster}
              alt={item.title}
              className="w-full md:w-80 h-96 md:h-auto object-cover"
            />

            <div className="p-6 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-white text-3xl font-bold">{item.title}</h2>
                <span className={`px-2 py-1 rounded text-sm font-bold ${
                  item.type === 'movie' ? 'bg-blue-600' : 'bg-purple-600'
                } text-white`}>
                  {item.type === 'movie' ? 'Movie' : 'TV Show'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{item.year}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{item.genre.join(', ')}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-white text-lg font-semibold mb-2">Ratings</h3>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-yellow-400 font-bold">{item.imdb}</div>
                    <div className="text-gray-400 text-sm">IMDB</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-bold">{item.rottenTomatoes}%</div>
                    <div className="text-gray-400 text-sm">RT</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-bold">{item.tmdb}</div>
                    <div className="text-gray-400 text-sm">TMDB</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-white text-lg font-semibold mb-2">Plot</h3>
                <p className="text-gray-300">{item.plot}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-white text-lg font-semibold mb-2">Cast</h3>
                <p className="text-gray-300">{item.cast.join(', ')}</p>
              </div>

              <div className="flex gap-3">
                {!watchlist.find(w => w.id === item.id) && !watchedList.find(w => w.id === item.id) && (
                  <button
                    onClick={() => {
                      addToWatchlist(item);
                      onClose();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add to Watchlist
                  </button>
                )}

                {watchlist.find(w => w.id === item.id) && (
                  <button
                    onClick={() => {
                      markAsWatched(item);
                      onClose();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium flex items-center gap-2 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    Mark as Watched
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">CinemaHub</h1>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search movies, TV shows, actors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <nav className="flex gap-6">
              {['discover', 'watchlist', 'watched'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tab}
                  {tab === 'watchlist' && watchlist.length > 0 && (
                    <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {watchlist.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-900 border border-red-700 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <h3 className="text-red-400 font-semibold">Error</h3>
            </div>
            <p className="text-red-300 mt-2">{error}</p>
            {!apiConfigured && (
              <div className="mt-4">
                <p className="text-red-300 text-sm">
                  To use this application, you need to:
                </p>
                <ol className="text-red-300 text-sm mt-2 ml-4 list-decimal">
                  <li>Get a free TMDB API key from <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">themoviedb.org</a></li>
                  <li>Get a free OMDB API key from <a href="http://www.omdbapi.com/apikey.aspx" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">omdbapi.com</a></li>
                  <li>Create a .env file in your project root</li>
                  <li>Add your API keys as VITE_TMDB_API_KEY and VITE_OMDB_API_KEY</li>
                </ol>
              </div>
            )}
          </div>
        )}
        {/* Search Results */}
        {searchQuery && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Search Results for "{searchQuery}"
            </h2>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Searching...</div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {searchResults.map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400">No results found</div>
              </div>
            )}
          </section>
        )}

        {/* Main Content */}
        {!searchQuery && (
          <>
            {activeTab === 'discover' && (
              <>
                {/* Filters */}
                <section className="mb-8">
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-gray-400" />
                      <span className="text-white font-medium">Filters:</span>
                    </div>

                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {genres.map((genre) => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="movie">Movies</option>
                      <option value="tv">TV Shows</option>
                    </select>
                  </div>
                </section>

                {/* Trending Content */}
                <section className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                    <h2 className="text-2xl font-bold text-white">Trending Now</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredContent.map((item) => (
                      <ContentCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>

                {/* Recommendations */}
                {getRecommendations().length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center gap-2 mb-6">
                      <Heart className="w-6 h-6 text-red-500" />
                      <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {getRecommendations().map((item) => (
                        <ContentCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {activeTab === 'watchlist' && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">My Watchlist</h2>
                {watchlist.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {watchlist.map((item) => (
                      <div key={item.id} className="relative">
                        <ContentCard item={item} />
                        <button
                          onClick={() => removeFromWatchlist(item.id)}
                          className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">Your watchlist is empty</div>
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Discover Content
                    </button>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'watched' && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">Watched</h2>
                {watchedList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {watchedList.map((item) => (
                      <ContentCard key={item.id} item={item} showActions={false} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">No watched content yet</div>
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Start Watching
                    </button>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default EntertainmentPlatform;