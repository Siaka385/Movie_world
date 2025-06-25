# 🎬 Movie World

A comprehensive entertainment discovery platform where users can search for movies and TV shows, view detailed information, manage personal watchlists, and explore trending content.

## 🌟 Features

- 🔍 **Search** for movies and TV shows with real-time, debounced results
- 📄 **Detailed view pages** with title, plot, cast, ratings, release date, and poster
- 📋 **Watchlist management**: Add/remove titles, mark as watched
- 📈 **Trending dashboard** showing popular movies and shows
- 🎭 **Genre-based filtering** and category browsing
- ⭐ **Multi-source ratings**: TMDB, IMDB, Rotten Tomatoes
- 🤖 **Recommendation engine** based on user's watchlist
- 📱 **Responsive design** for mobile and desktop devices

## 🔧 Tech Stack

- **Frontend**: React / Vite / Tailwind CSS
- **APIs**: 
  - [TMDB API](https://www.themoviedb.org/documentation/api)
  - [OMDB API](https://www.omdbapi.com/)
- **State management**: React Context

## 📦 API Features & Handling

- ✅ Proper **API error handling** and user-friendly messages
- ⏳ Loading states for smooth UX
- 📄 **Pagination** for search and trending content
- ⚡ **Caching** of API responses to optimize performance
- 🕒 Handles **API rate limiting** with retry/backoff logic
- 🔐 Secure **API key management** via environment variables
- ⌨️ **Debounced** search input to reduce API requests


## 🚀 Getting Started

To run this project locally:

1. **Clone the repository**
   ```bash
   git clone https://github.com/siaka385/movie-world.git

   cd movie-world

    ```

2. **Install dependency**

```bash
npm install
```

3. **Set up environment variables**

You'll need API keys from TMDB and OMDB to fetch movie and TV show data.
    Create a .env file in the root directory of the project.
    Add your API keys like this:
```bash
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_OMDB_API_KEY=your_omdb_api_key
 ```

If you don't have keys yet:

Sign up at TMDB and generate an API key from your account settings.

- Visit OMDB to request an API key (free for personal use).

4. Run the development server
```bash
npm run dev
```

The app will be available at: http://localhost:5173/