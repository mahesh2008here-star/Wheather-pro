package com.liveweather.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Android Home Screen Widget Provider for WeatherApp.
 * Displays the iconic farm house weather background and automatically refreshes.
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

        // Read saved weather data for this location
        SharedPreferences prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE);
        String location = prefs.getString("location", "WeatherPro");
        String temp = prefs.getString("temp", "24°");
        String condition = prefs.getString("condition", "Partly Cloudy");
        String details = prefs.getString("details", "Tap for live scenery");

        views.setTextViewText(R.id.widget_location, location);
        views.setTextViewText(R.id.widget_temperature, temp);
        views.setTextViewText(R.id.widget_condition, condition);
        views.setTextViewText(R.id.widget_details, details);

        // Create an Intent to launch MainActivity when widget is tapped
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        // Instruct widget manager to update
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
