export interface FlutterFile {
  path: string;
  name: string;
  description: string;
  content: string;
}

export const FLUTTER_PROJECT_FILES: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    name: 'pubspec.yaml',
    description: 'Flutter dependencies & project specification',
    content: `name: farm_weather_app
description: "A farm weather and parcel monitoring app built in Flutter."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  http: ^1.2.0
  intl: ^0.19.0
  provider: ^6.1.1
  google_fonts: ^6.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
`,
  },
  {
    path: 'lib/main.dart',
    name: 'main.dart',
    description: 'Application entry point & navigation state',
    content: `import 'package:flutter/material.dart';
import 'screens/weather_home_screen.dart';
import 'screens/farm_map_screen.dart';
import 'screens/analytics_screen.dart';
import 'screens/harvest_screen.dart';
import 'screens/profile_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const FarmWeatherApp());
}

class FarmWeatherApp extends StatefulWidget {
  const FarmWeatherApp({super.key});

  @override
  State<FarmWeatherApp> createState() => _FarmWeatherAppState();
}

class _FarmWeatherAppState extends State<FarmWeatherApp> {
  int _currentIndex = 0;
  bool _isDarkMode = false;

  void toggleTheme() {
    setState(() {
      _isDarkMode = !_isDarkMode;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Farm Weather',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _isDarkMode ? ThemeMode.dark : ThemeMode.light,
      home: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: [
            WeatherHomeScreen(onToggleTheme: toggleTheme, isDarkMode: _isDarkMode),
            const FarmMapScreen(),
            const AnalyticsScreen(),
            const HarvestScreen(),
            ProfileScreen(onToggleTheme: toggleTheme, isDarkMode: _isDarkMode),
          ],
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (idx) => setState(() => _currentIndex = idx),
          destinations: const [
            NavigationDestination(icon: Icon(Icons.wb_sunny_outlined), selectedIcon: Icon(Icons.wb_sunny), label: 'Home'),
            NavigationDestination(icon: Icon(Icons.grid_view_outlined), selectedIcon: Icon(Icons.grid_view), label: 'Farm'),
            NavigationDestination(icon: Icon(Icons.show_chart_outlined), selectedIcon: Icon(Icons.show_chart), label: 'Analytics'),
            NavigationDestination(icon: Icon(Icons.eco_outlined), selectedIcon: Icon(Icons.eco), label: 'Harvest'),
            NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Profile'),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/screens/weather_home_screen.dart',
    name: 'weather_home_screen.dart',
    description: 'Weather home screen with animated hero & cards',
    content: `import 'package:flutter/material.dart';
import '../widgets/animated_farm_scene.dart';
import '../widgets/today_conditions_grid.dart';
import '../widgets/forecast_section.dart';
import '../widgets/recommendations_section.dart';
import '../services/open_meteo_service.dart';

class WeatherHomeScreen extends StatefulWidget {
  final VoidCallback onToggleTheme;
  final bool isDarkMode;

  const WeatherHomeScreen({
    super.key,
    required this.onToggleTheme,
    required this.isDarkMode,
  });

  @override
  State<WeatherHomeScreen> createState() => _WeatherHomeScreenState();
}

class _WeatherHomeScreenState extends State<WeatherHomeScreen> {
  String _selectedScene = 'clearing_up'; // sunny, clouds, wind, rain, clearing_up
  int _temperature = 26;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: widget.isDarkMode ? const Color(0xFF0F172A) : const Color(0xFFF9F7F2),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () {},
        ),
        title: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: widget.isDarkMode ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4, offset: const Offset(0, 2)),
            ],
          ),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.location_on, color: Colors.green, size: 16),
              SizedBox(width: 4),
              Text('Green Valley Farm', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              Icon(Icons.arrow_drop_down, size: 18),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(widget.isDarkMode ? Icons.light_mode : Icons.dark_mode),
            onPressed: widget.onToggleTheme,
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // The animated illustrated farm microclimate hero
            AnimatedFarmScene(
              sceneState: _selectedScene,
              temperature: _temperature,
              isDarkMode: widget.isDarkMode,
            ),
            // Today's conditions grid
            TodayConditionsGrid(isDarkMode: widget.isDarkMode),
            // 7-day forecast
            ForecastSection(isDarkMode: widget.isDarkMode),
            // Farm recommendations
            RecommendationsSection(isDarkMode: widget.isDarkMode),
          ],
        ),
      ),
    );
  }
}
`,
  },
  {
    path: 'lib/widgets/animated_farm_scene.dart',
    name: 'animated_farm_scene.dart',
    description: 'CustomPainter farm vector scene with rainbow and cows',
    content: `import 'package:flutter/material.dart';
import 'dart:math' as math;

class AnimatedFarmScene extends StatefulWidget {
  final String sceneState;
  final int temperature;
  final bool isDarkMode;

  const AnimatedFarmScene({
    super.key,
    required this.sceneState,
    required this.temperature,
    required this.isDarkMode,
  });

  @override
  State<AnimatedFarmScene> createState() => _AnimatedFarmSceneState();
}

class _AnimatedFarmSceneState extends State<AnimatedFarmScene> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 330,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: widget.isDarkMode
              ? [const Color(0xFF0B1329), const Color(0xFF1C2541)]
              : widget.sceneState == 'rain_shower'
                  ? [const Color(0xFF4A6273), const Color(0xFF9EACB5)]
                  : [const Color(0xFF7EC2E8), const Color(0xFFDFEFF6)],
        ),
      ),
      child: Stack(
        children: [
          // Custom painting of red barn, cows, hills, and rainbow
          CustomPaint(
            size: const Size(double.infinity, 330),
            painter: FarmScenePainter(
              animationValue: _controller.value,
              showRainbow: widget.sceneState == 'clearing_up',
              isRaining: widget.sceneState == 'rain_shower',
              isDarkMode: widget.isDarkMode,
            ),
          ),
          // Large temperature overlay
          Positioned(
            top: 20,
            left: 24,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '\${widget.temperature}°C',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w800,
                    color: widget.isDarkMode ? Colors.white : const Color(0xFF1C1917),
                  ),
                ),
                Text(
                  widget.sceneState == 'clearing_up'
                      ? 'Clearing up'
                      : widget.sceneState == 'rain_shower'
                          ? 'Rain shower'
                          : 'Sunny',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: widget.isDarkMode ? const Color(0xFFFDE047) : const Color(0xFF292524),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class FarmScenePainter extends CustomPainter {
  final double animationValue;
  final bool showRainbow;
  final bool isRaining;
  final bool isDarkMode;

  FarmScenePainter({
    required this.animationValue,
    required this.showRainbow,
    required this.isRaining,
    required this.isDarkMode,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw Rolling Green Hills
    final hillPaint = Paint()
      ..color = isDarkMode ? const Color(0xFF1B3B48) : const Color(0xFF86CC5D)
      ..style = PaintingStyle.fill;
    
    final path = Path()
      ..moveTo(0, size.height * 0.65)
      ..quadraticBezierTo(size.width * 0.3, size.height * 0.55, size.width * 0.6, size.height * 0.68)
      ..quadraticBezierTo(size.width * 0.85, size.height * 0.75, size.width, size.height * 0.6)
      ..lineTo(size.width, size.height)
      ..lineTo(0, size.height)
      ..close();
    canvas.drawPath(path, hillPaint);

    // 2. Draw Rainbow if clearing up
    if (showRainbow) {
      final center = Offset(size.width * 0.7, size.height * 0.7);
      final radius = size.width * 0.45;
      final colors = [Colors.red, Colors.orange, Colors.yellow, Colors.green, Colors.cyan, Colors.purple];
      for (int i = 0; i < colors.length; i++) {
        final rPaint = Paint()
          ..color = colors[i].withOpacity(0.6)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 3.5;
        canvas.drawArc(
          Rect.fromCircle(center: center, radius: radius - (i * 3)),
          math.pi * 0.8,
          math.pi * 0.6,
          false,
          rPaint,
        );
      }
    }

    // 3. Draw Red Barn & Silo
    final barnPaint = Paint()..color = const Color(0xFFBD2D2D);
    canvas.drawRect(Rect.fromLTWH(size.width * 0.65, size.height * 0.52, 60, 45), barnPaint);

    final roofPaint = Paint()..color = const Color(0xFFFFFFFF)..strokeWidth = 3..style = PaintingStyle.stroke;
    final roofPath = Path()
      ..moveTo(size.width * 0.63, size.height * 0.52)
      ..lineTo(size.width * 0.65 + 30, size.height * 0.44)
      ..lineTo(size.width * 0.65 + 64, size.height * 0.52);
    canvas.drawPath(roofPath, roofPaint);
  }

  @override
  bool shouldRepaint(covariant FarmScenePainter oldDelegate) => true;
}
`,
  },
  {
    path: 'lib/theme/app_theme.dart',
    name: 'app_theme.dart',
    description: 'Light and Dark Mode theme specifications',
    content: `import 'package:flutter/material.dart';

class AppTheme {
  // Light Theme (Warm Cream / Agrarian Palette from Video)
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: const Color(0xFFF9F7F2),
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF15803D),
        surface: Colors.white,
        onSurface: const Color(0xFF1C1917),
      ),
      cardTheme: CardTheme(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFE7E5E4)),
        ),
      ),
    );
  }

  // Dark Theme (Agrarian Night / Deep Slate Palette)
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: const Color(0xFF0F172A),
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF22C55E),
        brightness: Brightness.dark,
        surface: const Color(0xFF1E293B),
        onSurface: const Color(0xFFF8FAFC),
      ),
      cardTheme: CardTheme(
        color: const Color(0xFF1E293B),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF334155)),
        ),
      ),
    );
  }
}
`,
  },
];
