import React, { useState, useEffect } from 'react';
import { X, Brain, Target, TrendingUp, Award, Heart, CheckCircle } from 'lucide-react';
import { TherapeuticStoryData, TherapeuticFocus, ProgressMarker, EmotionType } from '../types';
import { TherapeuticService, TherapeuticInsights } from '../services/therapeuticService';
import { useGlimmerStore } from '../store/useGlimmerStore';

interface TherapeuticDashboardProps {
  therapeuticData: TherapeuticStoryData;
  onClose: () => void;
}

export const TherapeuticDashboard: React.FC<TherapeuticDashboardProps> = ({ 
  therapeuticData, 
  onClose 
}) => {
  const [insights, setInsights] = useState<TherapeuticInsights | null>(null);
  const [selectedTab, setSelectedTab] = useState<'progress' | 'insights' | 'activities'>('progress');
  const [engagement, setEngagement] = useState(7);
  const [emotionalResponse, setEmotionalResponse] = useState<EmotionType[]>(['happy']);
  const [sessionNotes, setSessionNotes] = useState('');
  const { preferences } = useGlimmerStore();

  useEffect(() => {
    const generatedInsights = TherapeuticService.generateInsights(therapeuticData);
    setInsights(generatedInsights);
  }, [therapeuticData]);

  const handleRecordOutcome = () => {
    const skillsDemonstrated = [
      'Engaged with story content',
      'Expressed emotions appropriately',
      'Participated in interactive elements'
    ];

    TherapeuticService.recordOutcome(
      therapeuticData,
      engagement,
      emotionalResponse,
      skillsDemonstrated,
      sessionNotes
    );

    // Reset form
    setEngagement(7);
    setEmotionalResponse(['happy']);
    setSessionNotes('');
  };

  const handleUpdateProgress = (markerId: string, achieved: boolean) => {
    TherapeuticService.updateProgressMarker(therapeuticData, markerId, achieved);
  };

  const getFocusAreaInfo = (focusArea: TherapeuticFocus) => {
    const focusInfo = {
      'emotional-regulation': { icon: '💝', color: 'pink', name: 'Emotional Regulation' },
      'social-skills': { icon: '🤝', color: 'blue', name: 'Social Skills' },
      'anxiety-management': { icon: '🌈', color: 'green', name: 'Anxiety Management' },
      'self-confidence': { icon: '⭐', color: 'yellow', name: 'Self-Confidence' },
      'communication': { icon: '💬', color: 'purple', name: 'Communication' },
      'trauma-processing': { icon: '🌱', color: 'emerald', name: 'Trauma Processing' }
    };
    return focusInfo[focusArea];
  };

  const focusInfo = getFocusAreaInfo(therapeuticData.focusArea);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r from-${focusInfo.color}-500 to-${focusInfo.color}-600 p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8" />
              <div>
                <h2 className={`font-bold ${preferences.accessibility.largeText ? 'text-2xl' : 'text-xl'}`}>
                  {focusInfo.icon} Therapeutic Dashboard
                </h2>
                <p className={`opacity-90 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                  {focusInfo.name} - Progress Tracking & Insights
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
          <div className="flex space-x-1">
            {[
              { id: 'progress', label: 'Progress Tracking', icon: Target },
              { id: 'insights', label: 'Insights & Analytics', icon: TrendingUp },
              { id: 'activities', label: 'Therapeutic Activities', icon: Heart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                  ${selectedTab === tab.id
                    ? `bg-${focusInfo.color}-500 text-white shadow-lg`
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                  ${preferences.accessibility.largeText ? 'text-base px-6 py-3' : 'text-sm'}
                `}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {selectedTab === 'progress' && (
            <div className="space-y-6">
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`bg-gradient-to-r from-${focusInfo.color}-50 to-${focusInfo.color}-100 dark:from-${focusInfo.color}-900/20 dark:to-${focusInfo.color}-800/20 rounded-xl p-6`}>
                  <div className="flex items-center space-x-3">
                    <Award className={`w-8 h-8 text-${focusInfo.color}-500`} />
                    <div>
                      <p className={`text-sm text-${focusInfo.color}-600 dark:text-${focusInfo.color}-400`}>Overall Progress</p>
                      <p className={`text-2xl font-bold text-${focusInfo.color}-700 dark:text-${focusInfo.color}-300`}>
                        {insights ? Math.round(insights.progressPercentage) : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Avg Engagement</p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {insights ? insights.averageEngagement.toFixed(1) : '0'}/10
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400">Goals Achieved</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {therapeuticData.progressMarkers.filter(m => m.achieved).length}/{therapeuticData.progressMarkers.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Markers */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className={`font-semibold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                  Progress Markers
                </h3>
                <div className="space-y-3">
                  {therapeuticData.progressMarkers.map((marker) => (
                    <div
                      key={marker.id}
                      className={`
                        flex items-center justify-between p-4 rounded-lg border-2
                        ${marker.achieved 
                          ? `border-${focusInfo.color}-200 bg-${focusInfo.color}-50 dark:bg-${focusInfo.color}-900/20` 
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center
                          ${marker.achieved 
                            ? `bg-${focusInfo.color}-500 text-white` 
                            : 'bg-gray-300 dark:bg-gray-600'
                          }
                        `}>
                          {marker.achieved && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className={`font-medium text-gray-800 dark:text-gray-200 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                            {marker.description}
                          </p>
                          {marker.timestamp && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Achieved: {marker.timestamp.toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpdateProgress(marker.id, !marker.achieved)}
                        className={`
                          px-3 py-1 rounded-lg text-xs font-medium transition-colors
                          ${marker.achieved
                            ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                            : `bg-${focusInfo.color}-500 text-white hover:bg-${focusInfo.color}-600`
                          }
                        `}
                      >
                        {marker.achieved ? 'Unmark' : 'Mark Complete'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Record Session Outcome */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className={`font-semibold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                  Record Session Outcome
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block font-medium text-gray-700 dark:text-gray-300 mb-2 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                      Engagement Level (1-10): {engagement}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={engagement}
                      onChange={(e) => setEngagement(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className={`block font-medium text-gray-700 dark:text-gray-300 mb-2 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                      Session Notes
                    </label>
                    <textarea
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      placeholder="Observations, breakthroughs, areas for improvement..."
                      className={`
                        w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                        bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                        focus:outline-none focus:ring-2 focus:ring-${focusInfo.color}-500
                        ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}
                      `}
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleRecordOutcome}
                    className={`
                      px-6 py-3 bg-gradient-to-r from-${focusInfo.color}-500 to-${focusInfo.color}-600
                      hover:from-${focusInfo.color}-600 hover:to-${focusInfo.color}-700
                      text-white font-semibold rounded-lg shadow-lg
                      transition-all duration-200 hover:scale-105
                      ${preferences.accessibility.largeText ? 'text-lg px-8 py-4' : 'text-base'}
                    `}
                  >
                    Record Session
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'insights' && insights && (
            <div className="space-y-6">
              {/* Insights Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className={`font-semibold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                    Strengths Identified
                  </h3>
                  <ul className="space-y-2">
                    {insights.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className={`text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                          {strength}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className={`font-semibold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                    Growth Areas
                  </h3>
                  <ul className="space-y-2">
                    {insights.areasForGrowth.map((area, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        <span className={`text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                          {area}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className={`font-semibold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                  Therapeutic Recommendations
                </h3>
                <div className="space-y-3">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                      <p className={`text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'activities' && (
            <div className="space-y-6">
              {/* Therapeutic Prompts */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className={`font-semibold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                  Therapeutic Discussion Prompts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TherapeuticService.generateTherapeuticPrompts(therapeuticData.focusArea).map((prompt, index) => (
                    <div key={index} className={`p-4 bg-${focusInfo.color}-50 dark:bg-${focusInfo.color}-900/20 rounded-lg`}>
                      <p className={`text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                        {prompt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Objectives */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h3 className={`font-semibold text-gray-800 dark:text-gray-200 mb-4 ${preferences.accessibility.largeText ? 'text-lg' : 'text-base'}`}>
                  Therapeutic Objectives
                </h3>
                <ul className="space-y-3">
                  {therapeuticData.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full bg-${focusInfo.color}-500 text-white flex items-center justify-center text-xs font-bold mt-0.5`}>
                        {index + 1}
                      </div>
                      <p className={`text-gray-700 dark:text-gray-300 ${preferences.accessibility.largeText ? 'text-base' : 'text-sm'}`}>
                        {objective}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};