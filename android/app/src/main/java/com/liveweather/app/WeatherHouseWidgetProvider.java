package com.liveweather.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Android Home Screen Widget Provider: Farm Weather Live Scene
 * Material Design 3 full-surface layout with zero dead space.
 */
public class WeatherHouseWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_weather_house);

        SharedPreferences prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE);
        String location = prefs.getString("location", "Farm Weather");
        String temp = prefs.getString("temp", "24°");
        String condition = prefs.getString("condition", "Partly Cloudy • Favorable Spray Window");
        String details = prefs.getString("details", "H:28° L:16° • Feels 23°");
        String humidity = prefs.getString("humidity", "Humidity: 65%");
        String wind = prefs.getString("wind", "Wind: 14 km/h W");
        String rain = prefs.getString("rain", "Rain: 15%");
        String agriSummary = prefs.getString("agri_summary", "Soil: 21°C • ET₀ 3.4 mm/d");

        views.setTextViewText(R.id.widget_location, location);
        views.setTextViewText(R.id.widget_temperature, temp);
        views.setTextViewText(R.id.widget_condition, condition);
        views.setTextViewText(R.id.widget_details, details);
        views.setTextViewText(R.id.widget_humidity, humidity);
        views.setTextViewText(R.id.widget_wind, wind);
        views.setTextViewText(R.id.widget_rain, rain);
        views.setTextViewText(R.id.widget_agri_summary, agriSummary);

        // Deep link Intent to open MainActivity on Home Weather tab (tab 0)
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("activeTab", 0);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
