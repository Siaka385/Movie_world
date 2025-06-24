# API Integration Setup Guide

This application integrates with two APIs to provide comprehensive movie and TV show data:

## APIs Used

### 1. TMDB API (The Movie Database)
- **Purpose**: Primary source for movie/TV data, images, and trending content
- **Features**: 
  - Trending movies and TV shows
  - Search functionality
  - Movie/TV details with cast and crew
  - High-quality poster and backdrop images
  - Genre information
  - Ratings and popularity scores

### 2. OMDB API (Open Movie Database)
- **Purpose**: Additional ratings and detailed plot information
- **Features**:
  - IMDB ratings
  - Rotten Tomatoes scores
  - Metacritic ratings
  - Detailed plot summaries
  - Awards information
  - Box office data

## Setup Instructions

### Step 1: Get TMDB API Key
1. Go to [The Movie Database](https://www.themoviedb.org/)
2. Create a free account or sign in
3. Go to [API Settings](https://www.themoviedb.org/settings/api)
4. Request an API key (choose "Developer" option)
5. Fill out the form with your application details
6. Copy your API key

### Step 2: Get OMDB API Key
1. Go to [OMDB API](http://www.omdbapi.com/apikey.aspx)
2. Choose the FREE tier (1,000 daily requests)
3. Enter your email address
4. Check your email for the API key
5. Copy your API key

### Step 3: Configure Environment Variables
1. Open the `.env` file in your project root
2. Add your API keys:
   ```
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   VITE_OMDB_API_KEY=your_omdb_api_key_here
   ```
3. Save the file
4. Restart your development server

## Features Enabled by API Integration

### Enhanced Movie/TV Data
- Real-time trending content from TMDB
- Comprehensive search across movies and TV shows
- Multiple rating sources (TMDB, IMDB, Rotten Tomatoes, Metacritic)
- High-quality images and posters
- Detailed cast and crew information

### Search Functionality
- Debounced search with real-time results
- Search across titles, cast, and genres
- Filter by content type (movies/TV shows)
- Filter by genre

### Content Discovery
- Trending content updates
- Personalized recommendations based on watchlist
- Genre-based filtering
- Detailed content information

## API Rate Limits

### TMDB API
- **Free Tier**: 40 requests per 10 seconds
- **Daily Limit**: No daily limit for free tier
- **Commercial Use**: Allowed with attribution

### OMDB API
- **Free Tier**: 1,000 requests per day
- **Paid Tiers**: Available for higher usage
- **Rate Limit**: No per-second limit

## Error Handling

The application includes comprehensive error handling:
- Network connectivity issues
- API rate limiting
- Invalid API keys
- Missing content
- Server errors

## Data Flow

1. **Initial Load**: App fetches trending content and genres from TMDB
2. **Search**: User searches trigger TMDB API calls
3. **Enhancement**: TMDB results are enhanced with OMDB data for additional ratings
4. **Caching**: Results are cached to minimize API calls
5. **Error Recovery**: Graceful fallbacks when APIs are unavailable

## Troubleshooting

### Common Issues

1. **"Missing API keys" error**
   - Ensure both API keys are added to `.env` file
   - Restart the development server after adding keys

2. **"Network error" message**
   - Check internet connection
   - Verify API keys are valid
   - Check if APIs are experiencing downtime

3. **No search results**
   - Try different search terms
   - Check if TMDB API is responding
   - Verify search functionality in browser network tab

4. **Images not loading**
   - TMDB image URLs may be blocked by ad blockers
   - Check browser console for CORS errors
   - Verify TMDB API key has image access

### Development Tips

1. **Monitor API Usage**
   - Keep track of daily OMDB requests (1,000 limit)
   - TMDB has generous rate limits but avoid excessive requests

2. **Optimize Performance**
   - Search is debounced to reduce API calls
   - Results are cached when possible
   - Images are lazy-loaded

3. **Testing**
   - Test with and without API keys
   - Test error scenarios (invalid keys, network issues)
   - Test rate limiting behavior

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify API keys are correctly formatted
3. Test API endpoints directly in a tool like Postman
4. Check API status pages for service outages

## Attribution

This application uses:
- [The Movie Database (TMDB)](https://www.themoviedb.org/) - "This product uses the TMDB API but is not endorsed or certified by TMDB."
- [Open Movie Database (OMDB)](http://www.omdbapi.com/) - For additional movie ratings and information.
