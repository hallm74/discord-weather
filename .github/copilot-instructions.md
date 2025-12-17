# Copilot Instructions for Discord Weather Bot

## Project Overview
Node.js application that posts daily weather updates to Discord via webhook. Uses Open-Meteo API (no API key) and optionally GitHub Models for AI-generated running gear recommendations.

## Architecture
- `src/index.js`: Main orchestration (loads dotenv, fetches weather, formats, posts)
- `src/openMeteo.js`: Weather API client with WMO code mapping
- `src/format.js`: Message formatting with timezone-aware sunrise/sunset
- `src/discord.js`: Discord webhook posting
- `src/aiLayers.js`: GitHub Models integration + fallback rules

## Key Conventions
1. **Environment Variables**: Use `dotenv` for local development; GitHub Actions provides vars directly
2. **Timezone Handling**: Open-Meteo returns local times as ISO strings without 'Z' suffix - parse directly, don't use Date constructors
3. **Error Handling**: Minimal but present - log errors and set exit codes
4. **Dependencies**: Keep minimal (only dotenv); use native fetch
5. **AI Integration**: Always provide deterministic fallback when GitHub Models fails

## Environment Variables
- `DISCORD_WEBHOOK_URL`: Required - Discord webhook endpoint
- `LAT`, `LON`: Optional coordinates (defaults: 31.565, -93.484)
- `LOCATION_NAME`: Optional display name (default: "Many, LA")
- `ENABLE_AI`: Optional boolean string (`"true"` enables GitHub Models)
- `GH_MODELS_TOKEN`: Required for AI mode locally; auto-provided in Actions as `secrets.GITHUB_TOKEN`

## Important Implementation Details

### Timezone Handling
Open-Meteo returns times like `"2025-12-17T07:07"` already in local timezone. Parse the time components directly:
```javascript
const match = iso.match(/T(\d{2}):(\d{2})/);
// Convert to 12-hour format without Date objects
```

### GitHub Models Call
- Endpoint: `https://models.github.ai/inference/chat/completions`
- Model: `openai/gpt-4o-mini`
- Auth: `Bearer ${GH_MODELS_TOKEN}`
- Always catch errors and fall back to rule-based advice

### Weather Code Mapping
Use WMO codes (0-99) mapped to emoji + description. See `WEATHER_CODES` object in `src/openMeteo.js`.

## Testing
```bash
npm install
cp .env.example .env
# Edit .env with webhook URL
npm start
```

## GitHub Actions
- Runs daily at 11:30 UTC (5:30 AM CST)
- Workflow maps `secrets.GITHUB_TOKEN` to `GH_MODELS_TOKEN` env var
- Requires repository secret: `DISCORD_WEBHOOK_URL`
- Optional repository variables: `LAT`, `LON`, `ENABLE_AI`, `LOCATION_NAME`

## Code Style
- CommonJS modules (require/module.exports)
- Async/await for all async operations
- Descriptive function names
- Minimal comments (code should be self-documenting)
- Error messages include context and status codes
