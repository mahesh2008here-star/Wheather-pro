package com.liveweather.app.glance

import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver

/**
 * Android Widget Receivers for Jetpack Glance implementations
 */
class CompactWeatherGlanceReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = CompactWeatherGlanceWidget()
}

class FarmConditionsGlanceReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = FarmConditionsGlanceWidget()
}
