const apiKey = 'd022a6a28914ab08920456dffaf13cd1';
const units = { metric: '°C', imperial: '°F' };
let isMetric = true;

document.getElementById('city-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = document.getElementById('city-input').value;
    if (city) {
      getWeatherByCity(city);
    }
  }
});

document.getElementById('location-button').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      getWeatherByLocation(position.coords.latitude, position.coords.longitude);
    });
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

document.getElementById('toggle-units').addEventListener('click', () => {
  isMetric = !isMetric;
  document.getElementById('toggle-units').textContent = isMetric ? '°C / °F' : '°F / °C';
  const city = document.getElementById('city-name').textContent;
  if (city) {
    getWeatherByCity(city);
  }
});

function showWeatherInfo() {
  document.getElementById('toggle-units').style.display = 'inline-block';
  document.querySelector('.weather-info-area').style.display = 'block';
}

function getWeatherByCity(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${isMetric ? 'metric' : 'imperial'}`)
    .then(response => response.json())
    .then(data => {
      displayCurrentWeather(data);
      showWeatherInfo();
      getForecast(city);
    });
}

function getWeatherByLocation(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${isMetric ? 'metric' : 'imperial'}`)
    .then(response => response.json())
    .then(data => {
      displayCurrentWeather(data);
      showWeatherInfo();
      getForecast(data.name);
    });
}

function displayCurrentWeather(data) {
  document.getElementById('city-name').textContent = data.name;
  document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}${units[isMetric ? 'metric' : 'imperial']}`;
  document.getElementById('description').textContent = data.weather[0].description;
  document.getElementById('humidity').textContent = data.main.humidity;
  document.getElementById('wind-speed').textContent = Math.round(data.wind.speed);
  document.getElementById('weather-icon').src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

function getForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${isMetric ? 'metric' : 'imperial'}`)
    .then(response => response.json())
    .then(data => displayForecast(data));
}

function displayForecast(data) {
  const forecastContainer = document.getElementById('forecast-container');
  forecastContainer.innerHTML = '';

  for (let i = 0; i < data.list.length; i += 8) {
    const day = data.list[i];
    const date = new Date(day.dt_txt);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    const forecastEl = document.createElement('div');
    forecastEl.className = 'forecast-day';
    forecastEl.innerHTML = `
      <p>${dayName}</p>
      <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Weather Icon">
      <p>${Math.round(day.main.temp_min)} / ${Math.round(day.main.temp_max)}${units[isMetric ? 'metric' : 'imperial']}</p>
    `;
    forecastContainer.appendChild(forecastEl);
  }
}
