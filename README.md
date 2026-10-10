<div align="center">
  <img src="public/assets/weather_app_logo.svg" alt="Weather Pro Logo" width="160" height="160" />
  <h1>Weather Pro — Liquid Glass & Microclimate</h1>
  <p><strong>Next-Generation Android Weather App with Material You Custom Palettes, Working Home Screen Widgets & Apple Liquid Glass Dock</strong></p>
</div>

---

## 📸 High-Quality App Screenshots Showcase

<div align="center">
  <table border="0">
    <tr>
      <td align="center" width="25%">
        <strong>🏡 Home & Microclimate Hero</strong><br/><br/>
        <img src="public/assets/screenshot_home.svg" alt="Weather Pro Home Screen" width="230"/>
      </td>
      <td align="center" width="25%">
        <strong>📱 Home Screen Widgets</strong><br/><br/>
        <img src="public/assets/screenshot_widgets.svg" alt="Home Screen Widgets" width="230"/>
      </td>
      <td align="center" width="25%">
        <strong>🌧️ Live Radar & Doppler Map</strong><br/><br/>
        <img src="public/assets/screenshot_radar.svg" alt="Live Weather Radar" width="230"/>
      </td>
      <td align="center" width="25%">
        <strong>⚙️ Settings & Customization</strong><br/><br/>
        <img src="public/assets/screenshot_settings.svg" alt="App Settings" width="230"/>
      </td>
    </tr>
  </table>
</div>

---

# Farm Weather - Smart Agricultural Microclimate App

A high-fidelity recreation of the mobile farm weather and parcel monitoring application.

---

## 🌟 Key Features Recreated from Video

### 1. The Illustrated Animated Farm Microclimate Hero
- **Weather Scene Engine**: Coordinated SVG vector landscapes responding to weather conditions:
  - ☀️ **Sunny (28°C)**: Warm azure sky, golden radiant sun with pulsing aura, grazing Holstein cows.
  - ⛅ **Clouds rolling in (25°C)**: Billowy cumulus clouds drifting in from the west.
  - 💨 **Wind picking up (24°C)**: Darker slate atmosphere, wind streaks, rapid spinning wind turbine.
  - 🌧️ **Rain shower (21°C)**: Diagonal falling rain streaks and saturated soil.
  - 🌈 **Clearing up (26°C)**: Sunlight breaking through with a vibrant **7-color arc rainbow** over the red barn and fields.
- **Microclimate Elements**:
  - Classic red wood-paneled barn with white trim and weather vane.
  - Silo with domed metal roof.
  - Spinning wind turbine.
  - Perspective furrowed tilled soil with sprout rows.
  - Grazing dairy cows in pasture with fence.
  - Telemetry badges (`🐄 12`, `🌱 88%`).

### 2. Today's Conditions Metric Cards (Grid)
- **Temperature**: Gauge with feels-like temperature and min-max range bar.
- **Humidity**: Volumetric percentage and dew point calculation (Magnus-Tetens).
- **Wind**: Speed, gusts, direction angle, and dynamic wind bar.
- **Rain Chance**: Precipitation probability and expected millimeter accumulation.
- **Soil Moisture**: Saturation percentage and agronomic status ("Well watered", "Optimal").
- **Water Tank**: Liquid volume in liters and percentage fill wave.
- **UV Index**: 5-color spectrum bar from Low to Extreme.

### 3. Interactive Farm Parcel Map (7 Zones)
- Direct reproduction of the isometric parcel map visible at `00:00 - 00:01` in the video:
  - **Farm House**: Homestead & telemetry station (1.2 ha).
  - **Tomato Field**: Roma & San Marzano with fruit ripening telemetry (2.8 ha).
  - **Vegetables**: Lettuce & carrot rows (3.1 ha).
  - **Fruit Orchard**: Apple & pear trees (1.2 ha).
  - **Pasture & Livestock**: 48 head of dairy cattle and sheep (3.4 ha).
  - **Water Storage Pond**: Retention reservoir with 9,200 L reserve (0.8 ha).
  - **Overview**: 12.5 ha total property telemetry.
- Tap any parcel to highlight and inspect soil moisture, irrigation status, and crop health notes.

### 4. 7-Day & Hourly Forecast
- Hourly horizontal timeline for 24-hour weather tracking.
- **Interactive Expandable Daily Forecast Items**:
  - Tapping any forecast day smoothly expands an agricultural breakdown drawer.
  - **💧 Precipitation Breakdown**: Expected volume (mm), rain probability gauge (%), and precipitation duration window (~hrs).
  - **💦 Humidity Levels & Microclimate**: Relative humidity %, canopy moisture status, and leaf transpiration risk indicator (e.g. blight/mildew monitoring).
  - **💨 Wind & UV Peak Metrics**: Max gust speeds and peak UV ratings.
  - Contextual agronomic field tips tailored to each day's forecast (e.g. skip irrigation recommendations, foliar spray windows).

### 5. Actionable Farm Recommendations
- **Watering Recommended**: Schedule early morning drip cycle to reduce evaporation by 30%.
- **Rain Expected**: Skip automated irrigation and save reservoir reserves.
- **Good Planting Conditions**: Recommended seeding for lettuce and carrots.
- Interactive modal confirmation for all farming actions.

### 6. Real-Time Severe Weather Alert Notification System
- **Automatic Multi-Hazard Detection**:
  - ❄️ **Frost & Freeze Advisory**: Triggered when temperatures drop $\le 3^\circ\text{C}$ with frost formation on tender foliage. Actions include activating overhead micro-sprinklers or deploying protective row fleece over Tomato and Vegetable zones.
  - 💨 **High Wind & Gale Warning**: Triggered when wind gusts reach $\ge 32\text{ km/h}$ (such as in the video's "Wind picking up" state with 36 km/h gusts). Actions include pausing pesticide spraying/boom irrigation and securing greenhouse polytunnel vents.
  - 🌧️ **Heavy Downpour & Drainage Advisory**: Triggered during intense rainfall accumulation ($\ge 6\text{ mm}$), alerting to inspect reservoir weir gates and clearing drainage channels.
  - ⚡ **Severe Thunderstorm Warning**: Triggered on active lightning codes (`95`, `96`, `99`), alerting to shelter livestock.
- **Prominent Banner on Home Screen**:
  - Live pulsing status indicator (`● WARNING` / `● ADVISORY`).
  - Diagnostic metric readout and specific parcels at risk (e.g. *Tomato Field*, *Vegetables*, *Pasture*).
  - One-tap actionable mitigation button directly on the banner with toast confirmation.
  - Expandable "Advisory Protocol" modal detailing complete agronomic protective measures.
  - Dismissible with quick simulation shortcuts (`Test Frost`, `Test Wind`) to easily preview and verify alerts.
  - Synchronized header warning badge showing total active alarms.

### 7. Free Weather API Integration (Open-Meteo)
- **Provider**: Open-Meteo (open-source, free non-commercial tier, zero API key required).
- **Endpoints**:
  - Forecast: `https://api.open-meteo.com/v1/forecast`
  - Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- **Real Geocoding**: Search any city or agricultural region globally.
- **Safe Fallback**: Retains offline agronomic state matching video presets if network is unavailable.

### 7. Dark Mode Theme (User Requested)
- **Palette**:
  - **Light Theme**: Warm cream background (`#F9F7F2`), crisp white cards (`#FFFFFF`), deep stone text (`#1C1917`), lush green accents (`#15803D`).
  - **Dark Theme**: Agrarian night slate (`#0F172A`), rich card surfaces (`#1E293B`), luminous slate typography (`#F8FAFC`), glowing stars and crescent moon, glowing barn windows.
- Accessible via quick toggle in the top bar and in the Settings / Profile screen.
- Persisted to browser `localStorage`.

### 8. Pure Flutter & Dart Codebase
- Built-in source code viewer and exporter in the Profile tab containing:
  - `pubspec.yaml`
  - `lib/main.dart`
  - `lib/screens/weather_home_screen.dart`
  - `lib/widgets/animated_farm_scene.dart`
  - `lib/theme/app_theme.dart`

---

## 📱 How to Get the Android APK from GitHub

### Why wasn't the APK showing before?
When you push code to GitHub, GitHub acts as a code repository. It does not automatically compile web or mobile code into a `.apk` file unless an automated **GitHub Actions CI/CD workflow** is configured.

### ✅ Automated GitHub Actions Pipeline is Now Configured!
We added `.github/workflows/build-apk.yml` and initialized **Capacitor Android** in the repository.

#### Method 1: Download the APK from GitHub Actions
1. In your GitHub repository, click on the **Actions** tab at the top.
2. Select the workflow titled **"Build & Release Android APK"**.
3. If the previous run failed (Red X), click on that run, then click **"Re-run all jobs"** (top right), or push a new commit to trigger the fixed workflow.
4. Once completed (Green checkmark), scroll down to **Artifacts** at the bottom of the page.
5. Click **`WeatherApp-Android-APK`** to download your APK!

#### Method 2: Automatic GitHub Release (APK Attached to Assets)
The workflow now automatically creates and updates a release with the APK:
1. On your GitHub repo page, click **Releases** (on the right sidebar).
2. Under the **"Latest Android APK Release"**, look under **Assets**.
3. Click **`WeatherApp-release.apk`** to download and install immediately on your Android phone!

#### 🔧 What Was Fixed for the Red X Build Failure:
- **Dependency Resolution (`ERESOLVE`)**: Removed root `esbuild` version conflict with Vite 8 and added `--legacy-peer-deps` so `npm install` passes smoothly in CI.
- **Java 21 Requirement**: Upgraded JDK from 17 to Java 21 (Temurin) to support Capacitor 8 and Android Gradle Plugin 8.13+.
- **Automated Platform Provisioning**: Added automatic fallback detection to initialize Android assets if not already cloned.

#### Method 3: Build the APK Locally on Your Computer
If you have Node.js and Java / Android Studio installed:
```bash
# 1. Install dependencies
npm install

# 2. Build web bundle and sync to Android project
npm run build:android

# 3. Build the APK using Gradle
cd android
./gradlew assembleDebug
```
The compiled APK will be located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

Or open in Android Studio:
```bash
npx cap open android
```
Then select **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Build for production:
```bash
npm run build
```
