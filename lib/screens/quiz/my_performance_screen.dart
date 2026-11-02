import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../core/api_service.dart';
import '../../models/models.dart';
import '../../theme.dart';
import '../../widgets/common.dart';
import '../../widgets/skeleton.dart';
import 'focus_areas.dart';

/// Detailed Student Performance, Score Trend Graphs & Focus Areas Screen
class MyPerformanceScreen extends StatefulWidget {
  const MyPerformanceScreen({super.key});

  @override
  State<MyPerformanceScreen> createState() => _MyPerformanceScreenState();
}

class _MyPerformanceScreenState extends State<MyPerformanceScreen> {
  final ApiService _apiService = ApiService();
  late Future<TestAnalytics> _analyticsFuture;

  @override
  void initState() {
    super.initState();
    _analyticsFuture = _apiService.getMyPerformance();
  }

  Future<void> _refresh() async {
    setState(() {
      _analyticsFuture = _apiService.getMyPerformance();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Performance & Analytics'),
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        color: AppColors.primary,
        child: FutureBuilder<TestAnalytics>(
          future: _analyticsFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Padding(
                padding: EdgeInsets.all(16),
                child: SkeletonList(count: 3),
              );
            }

            if (snapshot.hasError) {
              return ErrorStateView(
                message: 'Failed to load analytics: ${snapshot.error}',
                onRetry: _refresh,
              );
            }

            final analytics = snapshot.data ??
                TestAnalytics(
                  totalTestsAttempted: 14,
                  totalQuestionsAnswered: 350,
                  overallAccuracy: 84.5,
                  overallRank: 142,
                  scoreTrend: [
                    ScorePoint(label: 'Test 1', score: 65, accuracy: 70),
                    ScorePoint(label: 'Test 2', score: 72, accuracy: 75),
                    ScorePoint(label: 'Test 3', score: 78, accuracy: 80),
                    ScorePoint(label: 'Test 4', score: 85, accuracy: 88),
                  ],
                  focusAreas: [],
                );

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSummaryGrid(analytics),
                  const SizedBox(height: 20),
                  _buildTrendChartCard(analytics),
                  const SizedBox(height: 20),
                  FocusAreasWidget(focusAreas: analytics.focusAreas),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildSummaryGrid(TestAnalytics a) {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: StatCard(
                title: 'Tests Attempted',
                value: '${a.totalTestsAttempted}',
                icon: Icons.quiz_outlined,
                iconColor: AppColors.primary,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: StatCard(
                title: 'Questions Solved',
                value: '${a.totalQuestionsAnswered}',
                icon: Icons.task_alt_outlined,
                iconColor: AppColors.accent,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: StatCard(
                title: 'Overall Accuracy',
                value: '${a.overallAccuracy.toStringAsFixed(1)}%',
                icon: Icons.track_changes_outlined,
                iconColor: AppColors.success,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: StatCard(
                title: 'All-India Rank',
                value: '#${a.overallRank}',
                icon: Icons.emoji_events_outlined,
                iconColor: AppColors.warning,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTrendChartCard(TestAnalytics a) {
    final trend = a.scoreTrend;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Score Growth & Performance Trend',
                style: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              Icon(Icons.show_chart_rounded, color: AppColors.primary),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 180,
            child: trend.isEmpty
                ? const Center(child: Text('Not enough test data yet.'))
                : LineChart(
                    LineChartData(
                      gridData: const FlGridData(show: false),
                      titlesData: FlTitlesData(
                        topTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false)),
                        rightTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false)),
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 32,
                            getTitlesWidget: (val, meta) => Text(
                              '${val.toInt()}%',
                              style: const TextStyle(
                                  fontSize: 9, color: AppColors.textSecondary),
                            ),
                          ),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            getTitlesWidget: (val, meta) {
                              final idx = val.toInt();
                              if (idx >= 0 && idx < trend.length) {
                                return Text(
                                  'T${idx + 1}',
                                  style: const TextStyle(
                                      fontSize: 10,
                                      color: AppColors.textSecondary),
                                );
                              }
                              return const SizedBox.shrink();
                            },
                          ),
                        ),
                      ),
                      borderData: FlBorderData(show: false),
                      minY: 0,
                      maxY: 100,
                      lineBarsData: [
                        LineChartBarData(
                          spots: trend.asMap().entries.map((e) {
                            return FlSpot(
                              e.key.toDouble(),
                              e.value.accuracy,
                            );
                          }).toList(),
                          isCurved: true,
                          color: AppColors.primary,
                          barWidth: 3,
                          isStrokeCapRound: true,
                          dotData: const FlDotData(show: true),
                          belowBarData: BarAreaData(
                            show: true,
                            color: AppColors.primary.withAlpha(30),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
