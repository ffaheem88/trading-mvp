import { useEffect, useState } from 'react';
import { competitionAPI } from '../services/api';
import toast from 'react-hot-toast';
import type { Competition } from '../types';
import Sparkline from '../components/Sparkline';

export default function MyCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyCompetitions();
  }, []);

  const loadMyCompetitions = async () => {
    try {
      const response = await competitionAPI.getMy();
      setCompetitions(response.data);
    } catch (error) {
      toast.error('Failed to load your competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (competitionId: string, competitionName: string) => {
    if (!confirm(`Are you sure you want to leave "${competitionName}"?`)) {
      return;
    }

    try {
      await competitionAPI.leave(competitionId);
      toast.success('Successfully left competition!');
      loadMyCompetitions(); // Reload the list
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to leave competition');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Generate mock trading volume data based on competition ID for consistency
  const generateTradingData = (id: string) => {
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const dataPoints = 15;
    const data: number[] = [];
    let value = 50 + (seed % 30);

    for (let i = 0; i < dataPoints; i++) {
      value += (Math.sin(seed + i) * 10) + (Math.cos(seed * i) * 5);
      data.push(Math.max(20, Math.min(100, value)));
    }
    return data;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading your competitions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Competitions
          </h1>
          <p className="mt-2 text-gray-600">
            Competitions you've joined
          </p>
        </div>

        {competitions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg mb-4">You haven't joined any competitions yet.</p>
            <a href="/competitions" className="text-blue-600 hover:text-blue-700 font-medium">
              Browse available competitions
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {competitions.map((competition) => {
              const participationPercentage = (competition.currentParticipants / competition.maxParticipants) * 100;
              const isFull = participationPercentage >= 100;
              const tradingData = generateTradingData(competition.id);

              return (
                <div key={competition.id} className="bg-white overflow-hidden shadow-md rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200 group">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                        {competition.name}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm border flex-shrink-0 ${
                        competition.status === 'OPEN'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {competition.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 h-10 overflow-hidden mb-3">
                      {competition.description}
                    </p>

                    {/* Trading Volume Sparkline */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-xs font-medium text-gray-600">Trading Activity</span>
                      </div>
                      <Sparkline data={tradingData} width={100} height={20} color="#10b981" fillColor="rgba(16, 185, 129, 0.15)" label="Volume" />
                    </div>
                  </div>

                  <div className="px-6 py-5">
                    <div className="space-y-3 mb-5">
                      {/* Entry Fee */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">Entry Fee</span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {competition.entryFee === 0 ? (
                            <span className="text-green-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              FREE
                            </span>
                          ) : (
                            `$${competition.entryFee}`
                          )}
                        </span>
                      </div>

                      {/* Prize Pool */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                          <span className="font-medium">Prize Pool</span>
                        </div>
                        <span className="font-bold text-amber-600">${competition.prizePool.toLocaleString()}</span>
                      </div>

                      {/* Participants */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="font-medium">Participants</span>
                        </div>
                        <span className="font-bold text-gray-900">
                          {competition.currentParticipants}<span className="text-gray-500">/{competition.maxParticipants}</span>
                        </span>
                      </div>

                      {/* Duration */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-start text-xs text-gray-600">
                          <svg className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <div className="font-medium text-gray-700">Duration</div>
                            <div className="mt-0.5">{formatDate(competition.startDate)} - {formatDate(competition.endDate)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span className="font-medium">Slots filled</span>
                        <span className="font-bold">{Math.round(participationPercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            isFull ? 'bg-red-500' : participationPercentage > 75 ? 'bg-amber-500' : 'bg-gradient-to-r from-green-500 to-green-600'
                          }`}
                          style={{ width: `${Math.min(participationPercentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleLeave(competition.id, competition.name)}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-sm hover:shadow-md active:scale-95 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Leave Competition</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
