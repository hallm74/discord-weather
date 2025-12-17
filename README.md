# Discord Weather Bot

Daily weather message sent to Discord via webhook using Open-Meteo (no API key). Runs locally or on GitHub Actions.

## Setup

1. Install Node.js 20.
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
# Edit .env and add your Discord webhook URL
```

Available environment variables:
- `DISCORD_WEBHOOK_URL` (required)
- `LAT` and `LON` (optional, defaults to 31.565 / -93.484)
- `LOCATION_NAME` (optional, defaults to "Many, LA")
- `ENABLE_AI` (optional, set to `true` to use GitHub Models)
- `GH_MODELS_TOKEN` (only needed locally when `ENABLE_AI=true`; use a personal access token with Models permissions)

## Run locally

```bash
npm start
```

Example output message:
```
☀️ Weather (Many, LA): Now 52°F | Low/High 41°/63° | 10% rain | Clear sky
🌅 Sunrise 7:03 AM CST | Sunset 5:18 PM CST
🏃 Running layers: Light tights or shorts with a breathable long-sleeve; carry a shell if rain picks up.
```

## GitHub Actions

- Add repository secret `DISCORD_WEBHOOK_URL`.
- Add repository variables `LAT`, `LON`, optional `ENABLE_AI`, and optional `LOCATION_NAME`.
- Workflow: `.github/workflows/weather.yml` runs daily at 11:30 UTC (5:30 AM CST) and can be triggered manually.
- The workflow automatically maps `secrets.GITHUB_TOKEN` to `GH_MODELS_TOKEN` for GitHub Models access.

## Notes

- Open-Meteo uses `timezone=auto` so sunrise/sunset show in local time with abbreviations.
- AI running layers use GitHub Models `openai/gpt-4o-mini` when `ENABLE_AI=true` and `GH_MODELS_TOKEN` is available; otherwise a deterministic fallback is used.
