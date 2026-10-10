package com.liveweather.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
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
