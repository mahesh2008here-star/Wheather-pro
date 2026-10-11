package com.liveweather.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

/**
 * Android Home Screen Widget Provider: Widget E Irrigation Outlook
 * Weather blue Material 3 surface with evapotranspiration and field advice.
 */
public class WeatherIrrigationWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_weather_irrigation);

        SharedPreferences prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE);
        String rain = prefs.getString("rain_sum", "0.0 mm");
        String prob = prefs.getString("rain_prob", "15% prob");
        String et0 = prefs.getString("et0", "3.2 mm/d");
        String wind = prefs.getString("wind", "14 km/h");
        String badge = prefs.getString("irrig_badge", "Optimal");
        String note = prefs.getString("irrig_note", "Advisory: Favorable conditions for normal irrigation schedule.");

        views.setTextViewText(R.id.widget_irrig_badge, badge);
        views.setTextViewText(R.id.widget_irrig_rain, rain);
        views.setTextViewText(R.id.widget_irrig_prob, prob);
        views.setTextViewText(R.id.widget_irrig_et0, et0);
        views.setTextViewText(R.id.widget_irrig_wind, wind);
        views.setTextViewText(R.id.widget_irrig_note, note);

        // Deep link Intent to open Live Radar screen (tab 1)
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("activeTab", 1);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                5,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_irrigation_root, pendingIntent);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
