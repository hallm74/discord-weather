require('dotenv').config();

const { fetchWeather } = require('./openMeteo');
const { formatMessage } = require('./format');
const { postToDiscord } = require('./discord');
const { getRunningLayersAdvice } = require('./aiLayers');

function getEnvNumber(name, fallback) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function main() {
  const lat = getEnvNumber('LAT', 31.565);
  const lon = getEnvNumber('LON', -93.484);
  const locationName = process.env.LOCATION_NAME || 'Many, LA';
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const enableAi = /^true$/i.test(process.env.ENABLE_AI || '');
  const githubToken = process.env.GH_MODELS_TOKEN;

  if (!webhookUrl) {
    throw new Error('Missing DISCORD_WEBHOOK_URL environment variable.');
  }

  console.log(`Fetching weather for ${locationName} (lat ${lat}, lon ${lon})...`);
  const weather = await fetchWeather({ lat, lon });

  const runningLayers = await getRunningLayersAdvice({
    weather,
    enableAi,
    githubToken
  });

  const message = formatMessage({
    locationName,
    runningLayers,
    timezone: weather.timezone,
    timezoneAbbreviation: weather.timezoneAbbreviation,
    current: weather.current,
    daily: weather.daily
  });

  await postToDiscord(webhookUrl, message);
  console.log('Weather message posted to Discord.');
}

main().catch((err) => {
  console.error('Weather job failed:', err);
  process.exitCode = 1;
});
