# 🎬 Entertainment Discovery Platform

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
- **Data storage**: `localStorage`
- **State management**: React Context or Redux (optional)

## 📦 API Features & Handling

- ✅ Proper **API error handling** and user-friendly messages
- ⏳ Loading states for smooth UX
- 📄 **Pagination** for search and trending content
- ⚡ **Caching** of API responses to optimize performance
- 🕒 Handles **API rate limiting** with retry/backoff logic
- 🔐 Secure **API key management** via environment variables
- ⌨️ **Debounced** search input to reduce API requests

