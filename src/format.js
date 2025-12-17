function formatTime(iso, timezone, abbreviation) {
  if (!iso) return 'N/A';
  
  // Open-Meteo returns times like "2025-12-17T07:07" which are already in the local timezone
  // Parse the time components directly since they're already correct for the timezone
  const match = iso.match(/T(\d{2}):(\d{2})/);
  if (!match) return 'N/A';
  
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // Convert 0 to 12, and 13-23 to 1-11
  
  return `${hour}:${minute} ${ampm} ${abbreviation || 'CST'}`;
}

function formatMessage({ locationName, current, daily, timezone, timezoneAbbreviation, runningLayers }) {
  const icon = current.weatherEmoji || '⛅';
  const condition = current.weatherDesc || 'Unknown conditions';
  const line1 = `${icon} Weather (${locationName}): Now ${Math.round(current.temperatureF)}°F | Low/High ${Math.round(daily.lowF)}°/${Math.round(daily.highF)}° | ${Math.round(daily.precipProbability)}% rain | ${condition}`;
  const sunrise = formatTime(daily.sunrise, timezone, timezoneAbbreviation);
  const sunset = formatTime(daily.sunset, timezone, timezoneAbbreviation);
  const line2 = `🌅 Sunrise ${sunrise} | Sunset ${sunset}`;
  const line3 = `🏃 Running layers: ${runningLayers}`;
  return [line1, line2, line3].join('\n');
}

module.exports = { formatMessage, formatTime };
