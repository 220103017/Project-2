const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0NTc4OTQ4YWQ3NWJkYmFjNTA2MWRmMDgxZTYyYTllMyIsIm5iZiI6MTczMTM0MDE4NS43MzQwNDAzLCJzdWIiOiI2NzMyMGY0MjBmM2Y1YTRhMDlhNjdiODgiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.7Pez6D7ORzZYudrdJx9RJhEXfql-q1Bh7y0C5-1tfVk';
const movieGrid = document.getElementById('movieGrid');
const modal = document.getElementById('movieModal');
const watchlistModal = document.getElementById('watchlistModal');
const watchlistContent = document.getElementById('watchlistContent');
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

document.addEventListener('DOMContentLoaded', fetchRandomMovies);

async function fetchRandomMovies() {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/popular`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
    const data = await response.json();
    displayMovies(data.results); 
  } catch (error) {
    console.error("Error fetching popular movies:", error);
  }
}

async function searchMovies(query) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?query=${query}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
    const data = await response.json();
    displayMovies(data.results);
  } catch (error) {
    console.error("Error searching for movies:", error);
  }
}

function autoSuggest() {
  const query = document.getElementById('searchInput').value;
  if (query.length > 2) {
    searchMovies(query);
  }
}

function displayMovies(movies) {
  if (!movies || movies.length === 0) {
    movieGrid.innerHTML = '<p>No movies found.</p>';
    return;
  }

  movieGrid.innerHTML = movies.map(movie => `
    <div class="movie-card" onclick="openMovieModal(${movie.id})">
      <img src="${movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : '/movies/public/images/placeholder.jpg'}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>${movie.release_date ? movie.release_date : 'N/A'}</p>
    </div>
  `).join('');
}

async function openMovieModal(movieId) {
  try {
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits,videos`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json;charset=utf-8'
      }
    });
    const movie = await response.json();

    modal.querySelector('#modalPoster').src = movie.poster_path 
      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
      : '/movies/public/images/placeholder.jpg';
    modal.querySelector('#modalTitle').innerText = movie.title;
    modal.querySelector('#modalOverview').innerText = movie.overview || 'No description available.';
    modal.querySelector('#modalRating').innerText = `Rating: ${movie.vote_average || 'N/A'} | Runtime: ${movie.runtime || 'N/A'} mins`;
    modal.querySelector('#modalReleaseDate').innerText = `Release Date: ${movie.release_date || 'N/A'}`;

    modal.querySelector('#addToWatchlistBtn').onclick = function() {
      addToWatchlist(movie.id, movie.title, movie.poster_path);
    };

    modal.style.display = 'flex';
  } catch (error) {
    console.error("Error fetching movie details:", error);
  }
}

function closeModal() {
  modal.style.display = 'none';
}

function toggleWatchlist() {
  watchlistModal.style.display = watchlistModal.style.display === 'flex' ? 'none' : 'flex';
  displayWatchlist();
}

function addToWatchlist(id, title, poster) {
  if (!watchlist.some(movie => movie.id === id)) {
    watchlist.push({ id, title, poster });
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    alert('Added to Watchlist');
  } else {
    alert('This movie is already in your Watchlist');
  }
}

function displayWatchlist() {
  if (watchlist.length === 0) {
    watchlistContent.innerHTML = '<p>Your Watchlist is empty.</p>';
    return;
  }
  
  watchlistContent.innerHTML = watchlist.map(movie => `
    <div class="watchlist-item">
      <img src="${movie.poster ? `https://image.tmdb.org/t/p/w200${movie.poster}` : '/movies/public/images/placeholder.jpg'}" alt="${movie.title}">
      <p>${movie.title}</p>
      <button class="remove-btn" onclick="removeFromWatchlist(${movie.id})">X</button>
    </div>
  `).join('');
}

function removeFromWatchlist(id) {
  watchlist = watchlist.filter(movie => movie.id !== id);
  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  displayWatchlist();
}

window.onclick = function(event) {
  if (event.target === modal) {
    closeModal();
  } else if (event.target === watchlistModal) {
    toggleWatchlist();
  }
};