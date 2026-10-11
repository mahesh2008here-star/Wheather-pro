package com.liveweather.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Android Home Screen Widget Provider: Widget F Air Quality & UV Index
 * Atmospheric EPA AQI and solar radiation in dual Material 3 cards.
 */
public class WeatherAirUvWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_weather_air_uv);

        SharedPreferences prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE);
        String uvValue = prefs.getString("uv_value", "5");
        String uvLevel = prefs.getString("uv_level", "Moderate Risk");
        String aqiValue = prefs.getString("aqi_value", "35");
        String aqiCategory = prefs.getString("aqi_category", "Good • Clean Air");

        views.setTextViewText(R.id.widget_uv_value, uvValue);
        views.setTextViewText(R.id.widget_uv_level, uvLevel);
        views.setTextViewText(R.id.widget_aqi_value, aqiValue);
        views.setTextViewText(R.id.widget_aqi_category, aqiCategory);

        // Deep link Intent to open Air & Sun screen (tab 2)
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("activeTab", 2);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                6,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_air_uv_root, pendingIntent);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
