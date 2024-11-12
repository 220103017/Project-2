const apiKey = 'b837d72ab88f40c18bc76c0f00413f3a';
const recipeGrid = document.getElementById('recipeGrid');
const modal = document.getElementById('recipeModal');
const favoritesModal = document.getElementById('favoritesModal');
const favoritesContent = document.getElementById('favoritesContent');
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

document.addEventListener('DOMContentLoaded', fetchRandomRecipes);

async function fetchRandomRecipes() {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/random?number=10&apiKey=${apiKey}`);
    const data = await response.json();
    displayRecipes(data.recipes);
  } catch (error) {
    console.error("Error fetching random recipes:", error);
  }
}

async function searchRecipes(query) {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`);
    const data = await response.json();
    displayRecipes(data.results);
  } catch (error) {
    console.error("Error searching for recipes:", error);
  }
}

function autoSuggest() {
  const query = document.getElementById('searchInput').value;
  if (query.length > 2) {
    searchRecipes(query);
  }
}

function displayRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    recipeGrid.innerHTML = '<p>No recipes found.</p>';
    return;
  }

  recipeGrid.innerHTML = recipes.map(recipe => `
    <div class="recipe-card" onclick="openRecipeModal(${recipe.id})">
      <img src="${recipe.image ? recipe.image : '/recipes/public/images/placeholder.jpg'}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
    </div>
  `).join('');
}

async function openRecipeModal(recipeId) {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
    const recipe = await response.json();
    modal.querySelector('#modalImage').src = recipe.image || '/recipes/public/images/placeholder.jpg';
    modal.querySelector('#modalTitle').innerText = recipe.title;
    modal.querySelector('#modalDescription').innerHTML = `<p>${recipe.summary || 'No description available.'}</p>`;
    modal.querySelector('#modalIngredients').innerHTML = `
      <h3>Ingredients:</h3>
      <ul>${recipe.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')}</ul>
    `;
    modal.querySelector('#modalInstructions').innerHTML = `
      <h3>Instructions:</h3>
      <p>${recipe.instructions || 'No instructions available.'}</p>
    `;
    modal.querySelector('#addToFavoritesBtn').onclick = function() {
      addToFavorites(recipe.id, recipe.title, recipe.image);
    };
    modal.style.display = 'flex';
  } catch (error) {
    console.error("Error fetching recipe details:", error);
  }
}


function closeModal() {
  modal.style.display = 'none';
}

function toggleFavorites() {
  favoritesModal.style.display = favoritesModal.style.display === 'flex' ? 'none' : 'flex';
  displayFavorites();
}

function addToFavorites(id, title, image) {
  if (!favorites.some(recipe => recipe.id === id)) {
    favorites.push({ id, title, image });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert('Added to Favorites');
  } else {
    alert('This recipe is already in your Favorites');
  }
}

function displayFavorites() {
  if (favorites.length === 0) {
    favoritesContent.innerHTML = '<p>Your Favorites list is empty.</p>';
    return;
  }

  favoritesContent.innerHTML = favorites.map(recipe => `
    <div class="favorite-item">
      <img src="${recipe.image ? recipe.image : '/recipes/public/images/placeholder.jpg'}" alt="${recipe.title}">
      <p>${recipe.title}</p>
      <button class="remove-btn" onclick="removeFromFavorites(${recipe.id})">X</button>
    </div>
  `).join('');
}

function removeFromFavorites(id) {
  favorites = favorites.filter(recipe => recipe.id !== id);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  displayFavorites();
}

window.onclick = function(event) {
  if (event.target === modal) {
    closeModal();
  } else if (event.target === favoritesModal) {
    toggleFavorites();
  }
};
