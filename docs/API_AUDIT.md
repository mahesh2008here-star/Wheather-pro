# Comprehensive Weather & Agricultural API Audit: Farm Weather

This document provides a technical audit of candidate APIs evaluated for the **Farm Weather - Smart Agriculture & Climate** application, analyzing costs, rate limits, authentication requirements, licensing terms, and suitability for agricultural intelligence.

---

## 1. Primary Verified Data Provider: Open-Meteo Suite

### A. Open-Meteo Weather Forecast API
- **Official Documentation**: [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Authentication**: **No API key required** for non-commercial tier. No registration or credit card needed.
- **Current Free Quota**:
  - **10,000 API calls per day** per IP address.
  - **5,000 calls per hour**; **600 calls per minute**.
- **Commercial-Use Rules**:
  - Non-commercial use is free under **Creative Commons Attribution 4.0 International (CC BY 4.0)**.
  - Commercial use (apps with subscriptions, ads, or business monetization) requires a paid plan starting at **$29/month** for 1 million calls.
- **Attribution Requirement**: Mandatory attribution to "Open-Meteo" with a hyperlink to [https://open-meteo.com/](https://open-meteo.com/).
- **Geographic Coverage**: Global, powered by high-resolution weather models from national meteorological services (ECMWF IFS, NOAA GFS/HRRR, DWD ICON, Météo-France ARPEGE).
- **Supported Agricultural Measurements in App**:
  - Current temperature, apparent temperature, relative humidity, dew point.
  - Surface wind speed, wind direction, gust thresholds.
  - Barometric pressure (MSL & surface) and tendency.
  - Hourly & daily precipitation amounts, rain probability (0–100%).
  - Cloud cover, visibility (meters to kilometers).
  - Topsoil temperature at 0 cm (`soil_temperature_0cm`).
  - Volumetric soil moisture 0–1 cm (`soil_moisture_0_to_1cm`).
  - Reference evapotranspiration (`et0_fao_evapotranspiration` via FAO-56 Penman-Monteith).
  - Solar ephemeris: Sunrise, sunset, daylight duration, and UV index max.
- **Limitations**: No formal SLA on the free tier.

---

### B. Open-Meteo Air Quality & Pollen API
- **Official Documentation**: [https://open-meteo.com/en/docs/air-quality-api](https://open-meteo.com/en/docs/air-quality-api)
- **Endpoint**: `https://air-quality-api.open-meteo.com/v1/air-quality`
- **Authentication**: **No API key required** for non-commercial tier.
- **Current Free Quota**: Shared with Open-Meteo daily limits (10,000 requests/day).
- **Supported Pollutants & Indices**:
  - United States Air Quality Index (`us_aqi`, EPA standard 0–500 scale).
  - Particulate Matter: PM2.5 and PM10 (µg/m³).
  - Gases: Nitrogen Dioxide (NO₂), Surface Ozone (O₃), Carbon Monoxide (CO), Sulphur Dioxide (SO₂).
  - Pollen: Alder, birch, grass, and ragweed pollen grains/m³.
- **Limitations**: Pollen forecasts are derived from the Copernicus CAMS European regional forecast and have best coverage over Europe. Global fallback logic is implemented for regions without direct sensor models.

---

### C. Open-Meteo Geocoding API
- **Official Documentation**: [https://open-meteo.com/en/docs/geocoding-api](https://open-meteo.com/en/docs/geocoding-api)
- **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
- **Authentication**: **No API key required**.
- **Current Free Quota**: Included in Open-Meteo free quota.
- **Functionality**: Autocomplete city, region, country, and latitude/longitude coordinates lookup.

---

## 2. Reverse Geocoding: BigDataCloud Client API
- **Official Documentation**: [https://www.bigdatacloud.com/geocoding-apis/free-reverse-geocode-to-city-api](https://www.bigdatacloud.com/geocoding-apis/free-reverse-geocode-to-city-api)
- **Endpoint**: `https://api.bigdatacloud.net/data/reverse-geocode-client`
- **Authentication**: **No API key required** for client-side queries.
- **Free Quota**: Unlimited client-side requests originating directly from the end-user device.
- **Functionality**: Converts device GPS coordinates into local municipality/locality names.

---

## 3. Evaluated Alternative Weather Providers (Comparison Audit)

| Provider | API Key Needed | Free Tier Limits | Commercial License | Agricultural Telemetry (Soil / ET₀) | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Open-Meteo** | **No** (Non-commercial) | 10,000 calls/day | $29/mo (1M calls) | **Native FAO-56 ET₀ & Soil Layers** | **Selected (Primary)** |
| **OpenWeatherMap** | Yes (Free signup) | 1,000 OneCall calls/day | Requires credit card | None (Requires custom modeling) | Alternate fallback |
| **Tomorrow.io** | Yes (Free signup) | 500 calls/day, 25/hr | Enterprise plans ($$$) | Available in premium tiers only | Rejected (Low rate limit) |
| **WeatherAPI.com** | Yes (Free signup) | 1,000,000 calls/month | Free tier includes attribution | Restricted agricultural data | Alternate fallback |
| **MET Norway** | No (Unique User-Agent) | Throttling per IP | Free (Creative Commons) | Limited to Nordic/Global basic weather | Alternate fallback |

---

## 4. Architectural Summary

1. **Zero Secret Keys in Client Code**: All endpoints utilized in the mobile app require no private credentials, ensuring no token leakage.
2. **Caching Strategy**: 5-minute client-side TTL in `localStorage` prevents duplicate network calls during repeated navigation.
3. **Graceful Fallback**: If Open-Meteo Air Quality encounters transient downtime, the app falls back to mathematical estimations without crashing.
