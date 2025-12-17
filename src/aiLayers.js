const fetch = global.fetch;

function getTimeOfDayLabel(timezone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: timezone
  });
  const parts = formatter.formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour')?.value) || 12;
  if (hour < 12) return 'morning';
  if (hour >= 17) return 'evening';
  return 'afternoon';
}

function buildSummary(weather) {
  const { current, daily, timezone } = weather;
  const timeOfDay = getTimeOfDayLabel(timezone);
  const pieces = [
    `Now ${Math.round(current.temperatureF)}F`,
    `Low/High ${Math.round(daily.lowF)}F/${Math.round(daily.highF)}F`,
    `${Math.round(daily.precipProbability)}% precip chance`,
    `Wind ${Math.round(current.windMph)} mph`,
    `Conditions: ${current.weatherDesc}`,
    `Time: ${timeOfDay}`
  ];
  return pieces.join(', ');
}

function fallbackLayersAdvice(weather) {
  const temp = weather.current.temperatureF;
  const precip = weather.daily.precipProbability;
  const wind = weather.current.windMph;
  const parts = [];

  if (temp <= 20) {
    parts.push('Very cold: thermal tights, long-sleeve base, insulated jacket, gloves, warm hat.');
  } else if (temp <= 32) {
    parts.push('Cold: tights, long-sleeve base, light insulated or fleece layer, gloves, ear coverage.');
  } else if (temp <= 45) {
    parts.push('Chilly: tights or light joggers, long-sleeve, light jacket or vest.');
  } else if (temp <= 60) {
    parts.push('Mild: shorts or light tights, breathable long- or short-sleeve, optional light vest.');
  } else if (temp <= 75) {
    parts.push('Warm: shorts and light top; focus on hydration.');
  } else {
    parts.push('Hot: light singlet and shorts, sunscreen, hydrate well.');
  }

  if (precip >= 40) {
    parts.push('Carry a light shell if rain starts.');
  }
  if (wind >= 20) {
    parts.push('Add a wind-blocking layer.');
  }

  return parts.join(' ');
}

async function callGitHubModel(summary, githubToken) {
  if (!githubToken) {
    throw new Error('Missing GH_MODELS_TOKEN for model call');
  }

  const response = await fetch('https://models.github.ai/inference/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a running coach. Give conservative, practical clothing layers advice for an outdoor run. Keep it to 1-2 short sentences. Mention rain/wind only if relevant. No medical claims.'
        },
        {
          role: 'user',
          content: `Weather: ${summary} . Recommend running layers.`
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Model call failed (${response.status}): ${text}`);
  }

  const body = await response.json();
  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Model response missing content');
  }
  return content.trim();
}

async function getRunningLayersAdvice({ weather, enableAi, githubToken }) {
  if (!enableAi) {
    return fallbackLayersAdvice(weather);
  }

  try {
    const summary = buildSummary(weather);
    return await callGitHubModel(summary, githubToken);
  } catch (err) {
    console.warn('AI advice failed, using fallback:', err.message);
    return fallbackLayersAdvice(weather);
  }
}

module.exports = { getRunningLayersAdvice, fallbackLayersAdvice, buildSummary };
