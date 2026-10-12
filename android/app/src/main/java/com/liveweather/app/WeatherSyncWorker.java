package com.liveweather.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import androidx.annotation.NonNull;
import androidx.work.BackoffPolicy;
import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

/**
 * Android WorkManager Background Worker
 * Executes periodic 15-minute background sync for Farm Weather.
 * 
 * Guarantees:
 * 1. Honors Android battery optimization & Doze mode without crashing.
 * 2. Requires NetworkType.CONNECTED.
 * 3. Uses unique periodic work ("farm_weather_15min_sync") to avoid duplicate workers.
 * 4. Automatically updates all native home-screen widgets upon successful fetch.
 */
public class WeatherSyncWorker extends Worker {

    public static final String UNIQUE_WORK_NAME = "farm_weather_15min_sync";
    public static final String PREFS_NAME = "WeatherWidgetPrefs";

    public WeatherSyncWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    /**
     * Schedule unique 15-minute periodic work with Network constraints.
     */
    public static void schedulePeriodicSync(Context context) {
        try {
            Constraints constraints = new Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build();

            PeriodicWorkRequest syncRequest = new PeriodicWorkRequest.Builder(
                    WeatherSyncWorker.class,
                    15, TimeUnit.MINUTES,
                    5, TimeUnit.MINUTES // Flex interval for Doze friendliness
            )
                    .setConstraints(constraints)
                    .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 1, TimeUnit.MINUTES)
                    .build();

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                    UNIQUE_WORK_NAME,
                    ExistingPeriodicWorkPolicy.KEEP,
                    syncRequest
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        // Retrieve last saved coordinates (saved by app via AndroidWidgetBridge)
        float lat = prefs.getFloat("latitude", 0.0f);
        float lon = prefs.getFloat("longitude", 0.0f);

        // If coordinates have not been initialized yet, do not attempt sync
        if (lat == 0.0f && lon == 0.0f) {
            return Result.success();
        }

        HttpURLConnection conn = null;
        try {
            String urlStr = String.format(
                    Locale.US,
                    "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,et0_fao_evapotranspiration&timezone=auto",
                    lat, lon
            );

            URL url = new URL(urlStr);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);

            int responseCode = conn.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                return Result.retry();
            }

            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            reader.close();

            JSONObject data = new JSONObject(sb.toString());
            JSONObject cur = data.optJSONObject("current");
            JSONObject daily = data.optJSONObject("daily");

            if (cur == null) {
                return Result.retry();
            }

            double temp = cur.optDouble("temperature_2m", 20.0);
            double appTemp = cur.optDouble("apparent_temperature", temp);
            int code = cur.optInt("weather_code", 1);
            int humidity = cur.optInt("relative_humidity_2m", 60);
            double windSpeed = cur.optDouble("wind_speed_10m", 12.0);

            double maxT = temp + 4;
            double minT = temp - 4;
            int rainProb = 10;
            double et0 = 3.0;

            if (daily != null) {
                if (daily.has("temperature_2m_max") && daily.getJSONArray("temperature_2m_max").length() > 0) {
                    maxT = daily.getJSONArray("temperature_2m_max").optDouble(0, maxT);
                }
                if (daily.has("temperature_2m_min") && daily.getJSONArray("temperature_2m_min").length() > 0) {
                    minT = daily.getJSONArray("temperature_2m_min").optDouble(0, minT);
                }
                if (daily.has("precipitation_probability_max") && daily.getJSONArray("precipitation_probability_max").length() > 0) {
                    rainProb = daily.getJSONArray("precipitation_probability_max").optInt(0, 10);
                }
                if (daily.has("et0_fao_evapotranspiration") && daily.getJSONArray("et0_fao_evapotranspiration").length() > 0) {
                    et0 = daily.getJSONArray("et0_fao_evapotranspiration").optDouble(0, 3.0);
                }
            }

            String condition = mapWeatherCode(code);
            String lastUpdated = new SimpleDateFormat("h:mm a", Locale.getDefault()).format(new Date());

            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("temp", Math.round(temp) + "°");
            editor.putString("condition", condition);
            editor.putString("high_low", "H:" + Math.round(maxT) + "° L:" + Math.round(minT) + "°");
            editor.putString("feels", "Feels " + Math.round(appTemp) + "°");
            editor.putString("details", "H:" + Math.round(maxT) + "° L:" + Math.round(minT) + "° • Feels " + Math.round(appTemp) + "°");
            editor.putString("humidity", "Humidity: " + humidity + "%");
            editor.putString("wind", "Wind: " + Math.round(windSpeed) + " km/h");
            editor.putString("rain", "Rain: " + rainProb + "%");
            editor.putString("rain_prob", rainProb + "% prob");
            editor.putString("et0", String.format(Locale.US, "%.1f mm/d", et0));
            editor.putString("updated", "Updated " + lastUpdated);
            editor.putLong("last_sync_timestamp", System.currentTimeMillis());
            editor.apply();

            // Broadcast updates to all native home-screen widgets
            updateAllWidgets(context);

            return Result.success();
        } catch (Exception e) {
            e.printStackTrace();
            return Result.retry();
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    private void updateAllWidgets(Context context) {
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

    private String mapWeatherCode(int code) {
        if (code == 0) return "Clear Sky";
        if (code == 1) return "Mainly Clear";
        if (code == 2) return "Partly Cloudy";
        if (code == 3) return "Overcast";
        if (code <= 48) return "Fog / Mist";
        if (code <= 55) return "Drizzle";
        if (code <= 65) return "Rain";
        if (code <= 75) return "Snow";
        if (code <= 82) return "Showers";
        if (code <= 99) return "Thunderstorm";
        return "Fair";
    }
}
