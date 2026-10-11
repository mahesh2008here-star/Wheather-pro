package com.liveweather.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Android Home Screen Widget Provider: Widget A Compact Weather
 * Pale blue Material 3 surface with high-legibility numbers.
 */
public class WeatherCompactWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_weather_compact);

        SharedPreferences prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE);
        String location = prefs.getString("location", "Farm Weather");
        String temp = prefs.getString("temp", "24°");
        String condition = prefs.getString("condition", "Partly Cloudy");
        String highLow = prefs.getString("high_low", "H:28° L:16°");
        String feels = prefs.getString("feels", "Feels 23°");
        String updated = prefs.getString("updated", "Updated 10:42 AM");

        views.setTextViewText(R.id.widget_compact_location, location);
        views.setTextViewText(R.id.widget_compact_temp, temp);
        views.setTextViewText(R.id.widget_compact_condition, condition);
        views.setTextViewText(R.id.widget_compact_high_low, highLow);
        views.setTextViewText(R.id.widget_compact_feels, feels);
        views.setTextViewText(R.id.widget_compact_updated, updated);

        // Deep link Intent to open MainActivity on Home Weather tab (tab 0)
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("activeTab", 0);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                2,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_compact_root, pendingIntent);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
