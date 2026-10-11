package com.liveweather.app.glance

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.currentState
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import com.liveweather.app.MainActivity

// Material Design 3 Widget Color Tokens
object FarmWidgetTheme {
    val WeatherBlue = Color(0xFFE5F2FF)
    val WeatherBlueAccent = Color(0xFF1687C9)
    val AgriGreen = Color(0xFFE4F5E9)
    val AgriGreenAccent = Color(0xFF159B69)
    val SolarOrange = Color(0xFFFFF0E1)
    val SolarOrangeAccent = Color(0xFFF57C00)
    val UvLavender = Color(0xFFEFECFF)
    val UvLavenderAccent = Color(0xFF7563C9)
    val SurfaceWhite = Color(0xFFFFFFFF)
    val TextPrimary = Color(0xFF171717)
    val TextSecondary = Color(0xFF737873)
}

/**
 * Widget A: Compact Current Weather
 * Designed with Jetpack Glance Compose for Android 12+ home screens.
 */
class CompactWeatherGlanceWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE)
            val location = prefs.getString("location", "Farm Weather") ?: "Farm Weather"
            val temp = prefs.getString("temp", "24°") ?: "24°"
            val condition = prefs.getString("condition", "Partly Cloudy") ?: "Partly Cloudy"
            val highLow = prefs.getString("high_low", "H:28° L:16°") ?: "H:28° L:16°"
            val feels = prefs.getString("feels", "Feels 23°") ?: "Feels 23°"

            Column(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .background(FarmWidgetTheme.WeatherBlue)
                    .cornerRadius(24.dp)
                    .padding(14.dp)
                    .clickable(actionStartActivity<MainActivity>())
            ) {
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = location,
                        style = TextStyle(
                            color = FarmWidgetTheme.WeatherBlueAccent,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        modifier = GlanceModifier.defaultWeight()
                    )
                    Text(
                        text = "● Live",
                        style = TextStyle(
                            color = FarmWidgetTheme.WeatherBlueAccent,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }

                Text(
                    text = condition,
                    style = TextStyle(
                        color = FarmWidgetTheme.TextSecondary,
                        fontSize = 11.sp
                    ),
                    modifier = GlanceModifier.padding(top = 2.dp)
                )

                Spacer(modifier = GlanceModifier.defaultWeight())

                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = temp,
                        style = TextStyle(
                            color = FarmWidgetTheme.TextPrimary,
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )

                    Spacer(modifier = GlanceModifier.defaultWeight())

                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = highLow,
                            style = TextStyle(
                                color = FarmWidgetTheme.TextPrimary,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Text(
                            text = feels,
                            style = TextStyle(
                                color = FarmWidgetTheme.TextSecondary,
                                fontSize = 10.sp
                            )
                        )
                    }
                }
            }
        }
    }
}

/**
 * Widget D: Agricultural Field Conditions Glance Widget
 */
class FarmConditionsGlanceWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        provideContent {
            val prefs = context.getSharedPreferences("WeatherWidgetPrefs", Context.MODE_PRIVATE)
            val location = prefs.getString("location", "Farm Parcel") ?: "Farm Parcel"
            val soilMoisture = prefs.getString("soil_moisture", "42% moist") ?: "42% moist"
            val soilTemp = prefs.getString("soil_temp", "Soil: 21°C") ?: "Soil: 21°C"
            val rainProb = prefs.getString("rain_prob", "15% prob") ?: "15% prob"
            val wind = prefs.getString("wind", "14 km/h W") ?: "14 km/h W"

            Column(
                modifier = GlanceModifier
                    .fillMaxSize()
                    .background(FarmWidgetTheme.AgriGreen)
                    .cornerRadius(24.dp)
                    .padding(14.dp)
                    .clickable(actionStartActivity<MainActivity>())
            ) {
                Row(
                    modifier = GlanceModifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "🌱 $location",
                        style = TextStyle(
                            color = FarmWidgetTheme.TextPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        modifier = GlanceModifier.defaultWeight()
                    )
                    Text(
                        text = "Telemetry",
                        style = TextStyle(
                            color = FarmWidgetTheme.AgriGreenAccent,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    )
                }

                Spacer(modifier = GlanceModifier.height(8.dp))

                Row(modifier = GlanceModifier.fillMaxWidth()) {
                    Column(
                        modifier = GlanceModifier
                            .defaultWeight()
                            .background(FarmWidgetTheme.SurfaceWhite)
                            .cornerRadius(16.dp)
                            .padding(8.dp)
                    ) {
                        Text(
                            text = "Topsoil (0-1cm)",
                            style = TextStyle(color = FarmWidgetTheme.TextSecondary, fontSize = 9.sp)
                        )
                        Text(
                            text = soilMoisture,
                            style = TextStyle(
                                color = FarmWidgetTheme.AgriGreenAccent,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Text(
                            text = soilTemp,
                            style = TextStyle(color = FarmWidgetTheme.TextSecondary, fontSize = 10.sp)
                        )
                    }

                    Spacer(modifier = GlanceModifier.width(8.dp))

                    Column(
                        modifier = GlanceModifier
                            .defaultWeight()
                            .background(FarmWidgetTheme.SurfaceWhite)
                            .cornerRadius(16.dp)
                            .padding(8.dp)
                    ) {
                        Text(
                            text = "Field Wind",
                            style = TextStyle(color = FarmWidgetTheme.TextSecondary, fontSize = 9.sp)
                        )
                        Text(
                            text = wind,
                            style = TextStyle(
                                color = FarmWidgetTheme.TextPrimary,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        )
                        Text(
                            text = "Rain $rainProb",
                            style = TextStyle(color = FarmWidgetTheme.WeatherBlueAccent, fontSize = 10.sp)
                        )
                    }
                }
            }
        }
    }
}
