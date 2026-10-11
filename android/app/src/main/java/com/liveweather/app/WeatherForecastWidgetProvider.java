package com.liveweather.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Android Home Screen Widget Provider: Current Weather & Hourly Strip
 * Material Design 3 layout with horizontal hourly periods.
 */
public class WeatherForecastWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_weather_forecast);

        SharedPreferences prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE);
        String location = prefs.getString("location", "Farm Weather");
        String temp = prefs.getString("temp", "24°");
        String condition = prefs.getString("condition", "Partly Cloudy • Feels 23°");

        views.setTextViewText(R.id.widget_forecast_city, location);
        views.setTextViewText(R.id.widget_forecast_temp, temp);
        views.setTextViewText(R.id.widget_forecast_condition, condition);

        // Hourly periods
        views.setTextViewText(R.id.h1_time, prefs.getString("h1_time", "Now"));
        views.setTextViewText(R.id.h1_temp, prefs.getString("h1_temp", temp));
        views.setTextViewText(R.id.h1_rain, prefs.getString("h1_rain", "10%"));

        views.setTextViewText(R.id.h2_time, prefs.getString("h2_time", "+1h"));
        views.setTextViewText(R.id.h2_temp, prefs.getString("h2_temp", "25°"));
        views.setTextViewText(R.id.h2_rain, prefs.getString("h2_rain", "15%"));

        views.setTextViewText(R.id.h3_time, prefs.getString("h3_time", "+2h"));
        views.setTextViewText(R.id.h3_temp, prefs.getString("h3_temp", "24°"));
        views.setTextViewText(R.id.h3_rain, prefs.getString("h3_rain", "30%"));

        views.setTextViewText(R.id.h4_time, prefs.getString("h4_time", "+3h"));
        views.setTextViewText(R.id.h4_temp, prefs.getString("h4_temp", "22°"));
        views.setTextViewText(R.id.h4_rain, prefs.getString("h4_rain", "45%"));

        // Deep link Intent to open MainActivity on Home Weather tab (tab 0)
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("activeTab", 0);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                1,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_forecast_root, pendingIntent);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
