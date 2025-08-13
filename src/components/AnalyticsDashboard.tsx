import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Award, Brain, Users, Download, Calendar } from 'lucide-react';
import { analyticsService, AnalyticsData } from '../services/analyticsService';
import { useGlimmerStore } from '../store/useGlimmerStore';
import { format } from 'date-fns';

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const { preferences, savedStories } = useGlimmerStore();

  useEffect(() => {
    if (showDashboard) {
      analyticsService.loadFromStorage();
      const data = analyticsService.generateAnalytics();
      setAnalytics(data);
    }
  }, [showDashboard, savedStories]);

  const exportAnalytics = () => {
    if (!analytics) return;
    
    const dataStr = analyticsService.exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `glimmer-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  if (!showDashboard) {
    return (
      <button
        onClick={() => setShowDashboard(true)}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-xl
          bg-gradient-to-r from-blue-500 to-indigo-600
          hover:from-blue-600 hover:to-indigo-700
          text-white font-semibold shadow-lg
          transition-all duration-200 hover:scale-105
          focus:outline-none focus:ring-2 focus:ring-blue-400
          ${preferences.accessibility.largeText ? 'text-lg px-6 py-3' : 'text-base'}
        `}
      >
        <TrendingUp className="w-5 h-5" />
        <span>View Analytics</span>
      </button>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  const emotionData = Object.entries(analytics.favoriteEmotions).map(([emotion, count]) => ({
    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    count,
  }));

  const symbolData = Object.entries(analytics.symbolUsage)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([symbol, count]) => ({ symbol, count }));

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#6b7280'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportAnalytics}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowDashboard(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <Award className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Creativity Score</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {analytics.creativityScore}/100
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <Brain className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Stories Created</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {analytics.totalStories}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400">Unique Symbols</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {analytics.engagementMetrics.uniqueSymbolsUsed}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Session Time</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {Math.round(analytics.sessionDuration / 60000)}m
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Emotion Distribution */}
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Favorite Emotions
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emotionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ emotion, percent }) => `${emotion} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {emotionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Symbol Usage */}
            <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Most Used Symbols
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={symbolData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="symbol" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Learning Progress */}
          <div className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Learning Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.learningProgress.vocabularyGrowth}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Vocabulary Growth
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {analytics.learningProgress.emotionalRange}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Emotional Range
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {analytics.learningProgress.narrativeComplexity}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Narrative Complexity
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              🎯 Personalized Insights
            </h3>
            <div className="space-y-3">
              {analytics.creativityScore > 70 && (
                <p className="text-green-700 dark:text-green-300">
                  🌟 Excellent creativity! You're using diverse symbols and emotions in your stories.
                </p>
              )}
              {analytics.engagementMetrics.averageStoryLength > 100 && (
                <p className="text-blue-700 dark:text-blue-300">
                  📚 You create detailed, rich stories with an average of {analytics.engagementMetrics.averageStoryLength} words!
                </p>
              )}
              {analytics.learningProgress.emotionalRange >= 5 && (
                <p className="text-purple-700 dark:text-purple-300">
                  💝 Great emotional range! You've explored {analytics.learningProgress.emotionalRange} different emotions.
                </p>
              )}
              {analytics.totalStories >= 5 && (
                <p className="text-orange-700 dark:text-orange-300">
                  🏆 Story master! You've created {analytics.totalStories} unique stories.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};