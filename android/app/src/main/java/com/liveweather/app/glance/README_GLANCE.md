# Android Jetpack Glance & RemoteViews Integration Guide

This directory contains the **Jetpack Glance** (Compose-based app widgets) and **RemoteViews** architecture for Farm Weather Android home-screen widgets.

## Architecture

The project provides dual-compatibility:
1. **Production RemoteViews Architecture (Ready immediately with Capacitor & Android SDK)**:
   - Layouts: `widget_weather_compact.xml`, `widget_weather_forecast.xml`, `widget_weather_sevenday.xml`, `widget_weather_farm.xml`, `widget_weather_irrigation.xml`, `widget_weather_air_uv.xml`, `widget_weather_house.xml`.
   - Providers: `WeatherCompactWidgetProvider`, `WeatherForecastWidgetProvider`, `WeatherSevenDayWidgetProvider`, `WeatherFarmWidgetProvider`, `WeatherIrrigationWidgetProvider`, `WeatherAirUvWidgetProvider`, `WeatherHouseWidgetProvider`.
   - Backward-compatible across all Android versions (Android 8.0 Oreo up to Android 15+).

2. **Modern Jetpack Glance Compose Architecture (For Compose-enabled builds)**:
   - Source: `FarmWeatherGlanceWidgets.kt`, `GlanceWidgetReceivers.kt`.
   - Built against the official Android Glance AppWidget library: `androidx.glance:glance-appwidget:1.1.0`.

## Enabling Jetpack Glance in Android Studio

To compile the Kotlin Glance module in Android Studio:
1. Add the Kotlin and Compose plugins in `android/app/build.gradle`:
   ```groovy
   plugins {
       id 'com.android.application'
       id 'org.jetbrains.kotlin.android'
   }

   android {
       buildFeatures {
           compose true
       }
       composeOptions {
           kotlinCompilerExtensionVersion '1.5.8'
       }
   }

   dependencies {
       implementation 'androidx.glance:glance-appwidget:1.1.0'
       implementation 'androidx.glance:glance-material3:1.1.0'
   }
   ```
2. Build APK in Android Studio: `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
