const fetch = global.fetch;

const WEATHER_CODES = {
  0: { desc: 'Clear sky', emoji: '☀️' },
  1: { desc: 'Mainly clear', emoji: '🌤️' },
  2: { desc: 'Partly cloudy', emoji: '⛅' },
  3: { desc: 'Overcast', emoji: '☁️' },
  45: { desc: 'Fog', emoji: '🌫️' },
  48: { desc: 'Depositing rime fog', emoji: '🌫️' },
  51: { desc: 'Light drizzle', emoji: '🌦️' },
  53: { desc: 'Drizzle', emoji: '🌦️' },
  55: { desc: 'Dense drizzle', emoji: '🌧️' },
  56: { desc: 'Freezing drizzle', emoji: '🌧️' },
  57: { desc: 'Heavy freezing drizzle', emoji: '🌧️' },
  61: { desc: 'Light rain', emoji: '🌦️' },
  63: { desc: 'Rain', emoji: '🌧️' },
  65: { desc: 'Heavy rain', emoji: '🌧️' },
  66: { desc: 'Freezing rain', emoji: '🌧️' },
  67: { desc: 'Heavy freezing rain', emoji: '🌧️' },
  71: { desc: 'Light snow', emoji: '🌨️' },
  73: { desc: 'Snow', emoji: '🌨️' },
  75: { desc: 'Heavy snow', emoji: '❄️' },
  77: { desc: 'Snow grains', emoji: '❄️' },
  80: { desc: 'Light rain showers', emoji: '🌦️' },
  81: { desc: 'Rain showers', emoji: '🌦️' },
  82: { desc: 'Violent rain showers', emoji: '⛈️' },
  85: { desc: 'Snow showers', emoji: '🌨️' },
  86: { desc: 'Heavy snow showers', emoji: '❄️' },
  95: { desc: 'Thunderstorm', emoji: '⛈️' },
  96: { desc: 'Thunderstorm with hail', emoji: '⛈️' },
  99: { desc: 'Thunderstorm with heavy hail', emoji: '⛈️' }
};

function mapWeatherCode(code) {
  return WEATHER_CODES[code] || { desc: 'Unknown', emoji: '❔' };
}

async function fetchWeather({ lat, lon }) {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat);
  url.searchParams.set('longitude', lon);
  url.searchParams.set('current', 'temperature_2m,weather_code,wind_speed_10m');
  url.searchParams.set(
    'daily',
    'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,sunrise,sunset'
  );
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('wind_speed_unit', 'mph');
  url.searchParams.set('timezone', 'auto');

  const response = await fetch(url.toString());
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Open-Meteo request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  if (!data || !data.current || !data.daily) {
    throw new Error('Malformed Open-Meteo response');
  }

  const currentCode = data.current.weather_code;
  const dailyCode = data.daily.weather_code?.[0];
  const currentWeather = mapWeatherCode(currentCode);
  const dailyWeather = mapWeatherCode(dailyCode);

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone,
    timezoneAbbreviation: data.timezone_abbreviation,
    current: {
      temperatureF: data.current.temperature_2m,
      weatherCode: currentCode,
      weatherDesc: currentWeather.desc,
      weatherEmoji: currentWeather.emoji,
      windMph: data.current.wind_speed_10m
    },
    daily: {
      lowF: data.daily.temperature_2m_min?.[0],
      highF: data.daily.temperature_2m_max?.[0],
      precipProbability: data.daily.precipitation_probability_max?.[0],
      weatherCode: dailyCode,
      weatherDesc: dailyWeather.desc,
      weatherEmoji: dailyWeather.emoji,
      sunrise: data.daily.sunrise?.[0],
      sunset: data.daily.sunset?.[0]
    }
  };
}

module.exports = { fetchWeather, mapWeatherCode };
