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

                // Trigger widget updates across providers
                AppWidgetManager manager = AppWidgetManager.getInstance(context);

                int[] houseIds = manager.getAppWidgetIds(new ComponentName(context, WeatherHouseWidgetProvider.class));
                if (houseIds != null && houseIds.length > 0) {
                    Intent intent = new Intent(context, WeatherHouseWidgetProvider.class);
                    intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                    intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, houseIds);
                    context.sendBroadcast(intent);
                }

                int[] forecastIds = manager.getAppWidgetIds(new ComponentName(context, WeatherForecastWidgetProvider.class));
                if (forecastIds != null && forecastIds.length > 0) {
                    Intent intent = new Intent(context, WeatherForecastWidgetProvider.class);
                    intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
                    intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, forecastIds);
                    context.sendBroadcast(intent);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public boolean requestPinWidget(String widgetId) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AppWidgetManager appWidgetManager = context.getSystemService(AppWidgetManager.class);
                if (appWidgetManager != null && appWidgetManager.isRequestPinAppWidgetSupported()) {
                    Class<?> providerClass = WeatherHouseWidgetProvider.class;
                    if ("forecast".equalsIgnoreCase(widgetId) || "glance_medium".equalsIgnoreCase(widgetId)) {
                        providerClass = WeatherForecastWidgetProvider.class;
                    } else if ("glance".equalsIgnoreCase(widgetId) || "clock_weather".equalsIgnoreCase(widgetId)) {
                        providerClass = WeatherGlanceWidgetProvider.class;
                    } else if ("pill".equalsIgnoreCase(widgetId) || "glance_pill".equalsIgnoreCase(widgetId) || "minimal".equalsIgnoreCase(widgetId)) {
                        providerClass = WeatherMinimalWidgetProvider.class;
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
