package com.liveweather.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import com.getcapacitor.BridgeActivity;
import org.json.JSONArray;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().addJavascriptInterface(new AndroidWidgetBridge(this), "AndroidWidgetBridge");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLinkIntent(intent);
    }

    private void handleDeepLinkIntent(Intent intent) {
        if (intent != null && intent.hasExtra("activeTab")) {
            int tab = intent.getIntExtra("activeTab", 0);
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().post(() -> {
                    getBridge().getWebView().evaluateJavascript(
                        "window.dispatchEvent(new CustomEvent('switchTab', { detail: { tab: " + tab + " } }));",
                        null
                    );
                });
            }
        }
    }

    public static class AndroidWidgetBridge {
        private final Context context;

        public AndroidWidgetBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public boolean isPinSupported() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AppWidgetManager appWidgetManager = context.getSystemService(AppWidgetManager.class);
                return appWidgetManager != null && appWidgetManager.isRequestPinAppWidgetSupported();
            }
            return false;
        }

        @JavascriptInterface
        public void updateWidgetData(String location, String temp, String condition, String details) {
            try {
                SharedPreferences prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = prefs.edit();
                editor.putString("location", location);
                editor.putString("temp", temp);
                editor.putString("condition", condition);
                editor.putString("details", details);
                editor.apply();

                triggerAllWidgetUpdates();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void updateStructuredWidgetData(String jsonString) {
            try {
                JSONObject json = new JSONObject(jsonString);
                SharedPreferences prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE);
                SharedPreferences.Editor editor = prefs.edit();

                String location = json.optString("location", "Farm Weather");
                int temp = json.optInt("temp", 24);
                int apparentTemp = json.optInt("apparentTemp", temp);
                int tempMin = json.optInt("tempMin", temp - 5);
                int tempMax = json.optInt("tempMax", temp + 4);
                String condition = json.optString("condition", "Partly Cloudy");
                int humidity = json.optInt("humidity", 65);
                int windSpeed = json.optInt("windSpeed", 14);
                String windDir = json.optString("windDirection", "W");
                int rainChance = json.optInt("rainChance", 15);
                double precip = json.optDouble("precipitation", 0.0);
                int soilTemp = json.optInt("soilTemp", 21);
                int soilMoisture = json.optInt("soilMoisture", 42);
                double et0 = json.optDouble("et0", 3.2);
                int uvIndex = json.optInt("uvIndex", 5);
                String uvLevel = json.optString("uvLevel", "Moderate Risk");
                int aqi = json.optInt("aqi", 35);
                String aqiCategory = json.optString("aqiCategory", "Good • Clean Air");
                String lastUpdated = json.optString("lastUpdated", "10:42 AM");

                editor.putString("location", location);
                editor.putString("temp", temp + "°");
                editor.putString("condition", condition);
                editor.putString("details", "H:" + tempMax + "° L:" + tempMin + "° • Feels " + apparentTemp + "°");
                editor.putString("high_low", "H:" + tempMax + "° L:" + tempMin + "°");
                editor.putString("feels", "Feels " + apparentTemp + "°");
                editor.putString("updated", "Updated " + lastUpdated);

                editor.putString("humidity", "Humidity: " + humidity + "%");
                editor.putString("wind", "Wind: " + windSpeed + " km/h " + windDir);
                editor.putString("gust", "Gust: " + Math.round(windSpeed * 1.3) + " km/h");
                editor.putString("rain", "Rain: " + rainChance + "%");
                editor.putString("rain_prob", rainChance + "% prob");
                editor.putString("rain_sum", String.format("%.1f mm", precip));
                editor.putString("soil_moisture", soilMoisture + "% moist");
                editor.putString("soil_temp", "Soil: " + soilTemp + "°C");
                editor.putString("dew", "Dew: " + Math.round(temp - ((100 - humidity) / 5.0)) + "°C");

                editor.putString("et0", String.format("%.1f mm/d", et0));
                editor.putString("irrig_badge", rainChance > 40 ? "Hold Rain" : et0 > 4.5 ? "High Loss" : "Optimal");
                editor.putString("irrig_note", rainChance > 40
                    ? "Advisory: Rainfall anticipated. Defer irrigation cycles."
                    : "Advisory: Favorable conditions for normal irrigation schedule.");

                editor.putString("uv_value", String.valueOf(uvIndex));
                editor.putString("uv_level", uvLevel);
                editor.putString("aqi_value", String.valueOf(aqi));
                editor.putString("aqi_category", aqiCategory);
                editor.putString("agri_summary", "Soil: " + soilTemp + "°C • ET₀ " + String.format("%.1f mm/d", et0));

                // Forecast hours if provided
                if (json.has("forecast")) {
                    JSONArray arr = json.getJSONArray("forecast");
                    for (int i = 0; i < Math.min(4, arr.length()); i++) {
                        JSONObject h = arr.getJSONObject(i);
                        editor.putString("h" + (i + 1) + "_time", i == 0 ? "Now" : h.optString("time", "+" + i + "h"));
                        editor.putString("h" + (i + 1) + "_temp", h.optInt("temp", temp) + "°");
                        editor.putString("h" + (i + 1) + "_rain", h.optInt("rainChance", 10) + "%");
                    }
                }

                editor.apply();
                triggerAllWidgetUpdates();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        private void triggerAllWidgetUpdates() {
            Class<?>[] providers = new Class<?>[] {
                WeatherHouseWidgetProvider.class,
                WeatherCompactWidgetProvider.class,
                WeatherForecastWidgetProvider.class,
                WeatherSevenDayWidgetProvider.class,
                WeatherFarmWidgetProvider.class,
                WeatherIrrigationWidgetProvider.class,
                WeatherAirUvWidgetProvider.class
            };

            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            for (Class<?> providerClass : providers) {
                int[] ids = manager.getAppWidgetIds(new ComponentName(context, providerClass));
                if (ids != null && ids.length > 0) {
                    Intent intent = new Intent(context, providerClass);
                    intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                    intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
                    context.sendBroadcast(intent);
                }
            }
        }

        @JavascriptInterface
        public boolean requestPinWidget(String widgetId) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AppWidgetManager appWidgetManager = context.getSystemService(AppWidgetManager.class);
                if (appWidgetManager != null && appWidgetManager.isRequestPinAppWidgetSupported()) {
                    Class<?> providerClass = WeatherHouseWidgetProvider.class;
                    if ("compact".equalsIgnoreCase(widgetId)) {
                        providerClass = WeatherCompactWidgetProvider.class;
                    } else if ("forecast".equalsIgnoreCase(widgetId)) {
                        providerClass = WeatherForecastWidgetProvider.class;
                    } else if ("sevenday".equalsIgnoreCase(widgetId)) {
                        providerClass = WeatherSevenDayWidgetProvider.class;
                    } else if ("farm".equalsIgnoreCase(widgetId)) {
                        providerClass = WeatherFarmWidgetProvider.class;
                    } else if ("irrigation".equalsIgnoreCase(widgetId)) {
                        providerClass = WeatherIrrigationWidgetProvider.class;
                    } else if ("air_uv".equalsIgnoreCase(widgetId)) {
                        providerClass = WeatherAirUvWidgetProvider.class;
                    }

                    ComponentName myProvider = new ComponentName(context, providerClass);
                    Intent pinnedWidgetCallbackIntent = new Intent(context, MainActivity.class);
                    PendingIntent successCallback = PendingIntent.getActivity(
                        context,
                        0,
                        pinnedWidgetCallbackIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );
                    return appWidgetManager.requestPinAppWidget(myProvider, null, successCallback);
                }
            }
            return false;
        }
    }
}
