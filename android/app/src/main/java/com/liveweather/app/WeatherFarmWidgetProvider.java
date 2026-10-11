package com.liveweather.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Android Home Screen Widget Provider: Widget D Farm Telemetry
 * Agricultural green Material 3 surface displaying soil and field conditions.
 */
public class WeatherFarmWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_weather_farm);

        SharedPreferences prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE);
        String location = prefs.getString("location", "Farm Parcel");
        String soilMoisture = prefs.getString("soil_moisture", "42% moist");
        String soilTemp = prefs.getString("soil_temp", "Soil: 21°C");
        String rainProb = prefs.getString("rain_prob", "15% prob");
        String rainSum = prefs.getString("rain_sum", "Sum: 0.0 mm");
        String wind = prefs.getString("wind", "14 km/h W");
        String gust = prefs.getString("gust", "Gust: 20 km/h");
        String humidity = prefs.getString("humidity", "68% RH");
        String dew = prefs.getString("dew", "Dew: 17°C");

        views.setTextViewText(R.id.widget_farm_city, location);
        views.setTextViewText(R.id.widget_soil_moisture, soilMoisture);
        views.setTextViewText(R.id.widget_soil_temp, soilTemp);
        views.setTextViewText(R.id.widget_farm_rain_prob, rainProb);
        views.setTextViewText(R.id.widget_farm_rain_sum, rainSum);
        views.setTextViewText(R.id.widget_farm_wind, wind);
        views.setTextViewText(R.id.widget_farm_gust, gust);
        views.setTextViewText(R.id.widget_farm_humidity, humidity);
        views.setTextViewText(R.id.widget_farm_dew, dew);

        // Deep link Intent to open MainActivity on Home Weather tab (tab 0)
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("activeTab", 0);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                4,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_farm_root, pendingIntent);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
