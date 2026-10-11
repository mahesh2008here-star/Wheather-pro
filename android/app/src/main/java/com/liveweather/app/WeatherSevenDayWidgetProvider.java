package com.liveweather.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Android Home Screen Widget Provider: Widget C 7-Day Outlook
 * Proportional temperature range scaling with consistent scale.
 */
public class WeatherSevenDayWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_weather_sevenday);

        SharedPreferences prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE);
        String location = prefs.getString("location", "Live Field");

        views.setTextViewText(R.id.widget_sevenday_city, location);

        views.setTextViewText(R.id.d1_name, prefs.getString("d1_name", "Today"));
        views.setTextViewText(R.id.d1_cond, prefs.getString("d1_cond", "Partly Cloudy"));
        views.setTextViewText(R.id.d1_range, prefs.getString("d1_range", "H:28° L:16°"));

        views.setTextViewText(R.id.d2_name, prefs.getString("d2_name", "Tomorrow"));
        views.setTextViewText(R.id.d2_cond, prefs.getString("d2_cond", "Sunny"));
        views.setTextViewText(R.id.d2_range, prefs.getString("d2_range", "H:29° L:17°"));

        views.setTextViewText(R.id.d3_name, prefs.getString("d3_name", "Wednesday"));
        views.setTextViewText(R.id.d3_cond, prefs.getString("d3_cond", "Light Rain (40%)"));
        views.setTextViewText(R.id.d3_range, prefs.getString("d3_range", "H:24° L:15°"));

        views.setTextViewText(R.id.d4_name, prefs.getString("d4_name", "Thursday"));
        views.setTextViewText(R.id.d4_cond, prefs.getString("d4_cond", "Clear Skies"));
        views.setTextViewText(R.id.d4_range, prefs.getString("d4_range", "H:27° L:16°"));

        // Deep link Intent to open MainActivity on Home Weather tab (tab 0)
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("activeTab", 0);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                3,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_sevenday_root, pendingIntent);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
