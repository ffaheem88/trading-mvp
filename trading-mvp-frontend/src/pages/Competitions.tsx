import { useEffect, useState } from 'react';
import { competitionAPI } from '../services/api';
import CompetitionCard from '../components/CompetitionCard';
import toast from 'react-hot-toast';
import type { Competition, PageResponse, CompetitionFilters } from '../types';

export default function Competitions() {
  const [pageData, setPageData] = useState<PageResponse<Competition> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CompetitionFilters>({
    search: '',
    freeOnly: false,
    page: 0,
    size: 9,
  });

  useEffect(() => {
    loadCompetitions();
  }, [filters]);

  const loadCompetitions = async () => {
    setLoading(true);
    try {
      // Clean up filters - convert empty strings to undefined
      const cleanFilters = {
        ...filters,
        search: filters.search || undefined,
      };
      const response = await competitionAPI.getPaginated(cleanFilters);
      setPageData(response.data);
    } catch (error) {
      toast.error('Failed to load competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (competitionId: string) => {
    try {
      await competitionAPI.join(competitionId);
      toast.success('Successfully joined competition!');
      loadCompetitions(); // Reload to update
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to join competition');
    }
  };

  const handleFilterChange = (key: keyof CompetitionFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 })); // Reset to page 0 when filtering
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      freeOnly: false,
      page: 0,
      size: 9,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Available Competitions
          </h1>
          <p className="mt-2 text-gray-600">
            Browse and join trading competitions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6">
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Filter Competitions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Free Only Checkbox */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price Filter
              </label>
              <label className="flex items-center space-x-3 cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-lg border border-gray-200 transition-colors group">
                <input
                  type="checkbox"
                  checked={filters.freeOnly}
                  onChange={(e) => handleFilterChange('freeOnly', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Show Free Only</span>
              </label>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all font-medium shadow-sm hover:shadow flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Info */}
        {pageData && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {pageData.content.length} of {pageData.totalElements} competitions
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">Loading competitions...</div>
          </div>
        ) : pageData && pageData.content.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No competitions found matching your filters.</p>
          </div>
        ) : (
          <>
            {/* Competition Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {pageData?.content.map((competition) => (
                <CompetitionCard
                  key={competition.id}
                  competition={competition}
                  onJoin={handleJoin}
                />
              ))}
            </div>

            {/* Pagination */}
            {pageData && pageData.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={pageData.first}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: pageData.totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-2 border rounded-md ${
                        i === pageData.pageNumber
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={pageData.last}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
