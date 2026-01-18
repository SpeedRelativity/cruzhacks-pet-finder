'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid3x3, List, Loader2, AlertCircle } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  status: string;
  location: string;
  date: string;
  image: string;
  description: string;
}

interface ApiReport {
  report_id: string;
  report_type: string;
  pet_name: string | null;
  pet_type: string;
  image_urls: string[];
  image_count: number;
  tags: {
    species: string;
    breed: string;
    primary_color: string;
    age_group: string;
    size: string;
    marks: string[];
  };
  location: string;
  description: string | null;
  status: string;
  is_matched?: boolean;  // True if this report has an accepted match
  created_at: string;
}

export function Gallery() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'Dog' | 'Cat'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Lost' | 'Found'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  // Fetch pets from API
  useEffect(() => {
    fetchPets();
  }, [filterType, filterStatus]); // Refetch when filters change

  // Debounced search
  useEffect(() => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timer = setTimeout(() => {
      fetchPets();
    }, 500); // Wait 500ms after user stops typing

    setSearchDebounce(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchQuery]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('status', 'active');
      if (filterType !== 'all') {
        params.append('pet_type', filterType);
      }
      if (filterStatus !== 'all') {
        params.append('report_type', filterStatus);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      params.append('limit', '100'); // Get more results

      const response = await fetch(`http://localhost:8000/api/reports?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pets: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Map API response to Pet interface, filtering out map images
        const mappedPets: Pet[] = data.reports
          .filter((report: ApiReport) => {
            // Filter out reports with map images
            if (report.image_urls && report.image_urls.length > 0) {
              const imageUrl = report.image_urls[0].toLowerCase();
              // Skip if image URL contains 'map' or if AI detected it as a map/non-pet
              if (imageUrl.includes('map') || 
                  (report.tags && (report.tags.species?.toLowerCase().includes('map') || 
                                   report.description?.toLowerCase().includes('map')))) {
                return false;
              }
            }
            return true;
          })
          .map((report: ApiReport) => ({
            id: report.report_id,
            name: report.pet_name || 'Unknown',
            type: report.pet_type.toLowerCase(),
            breed: report.tags.breed || 'Unknown',
            status: report.is_matched ? 'matched' : report.report_type.toLowerCase(), // Use 'matched' if has accepted match, otherwise report_type
            location: report.location || 'Unknown',
            date: new Date(report.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }),
            image: report.image_urls && report.image_urls.length > 0 
              ? report.image_urls[0] 
              : '/images/hero.jpg', // Fallback image
            description: report.description || `A ${report.tags.breed || report.pet_type} ${report.tags.primary_color ? `with ${report.tags.primary_color} coloring` : ''}`
          }));

        setPets(mappedPets);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err: any) {
      console.error('Error fetching pets:', err);
      setError(err.message || 'Failed to load pets. Please try again later.');
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter pets (additional client-side filtering if needed)
  const filteredPets = pets.filter((pet) => {
    const matchesType = filterType === 'all' || pet.type.toLowerCase() === filterType.toLowerCase();
    const matchesStatus = filterStatus === 'all' || pet.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'missing' || statusLower === 'lost') {
      return 'bg-secondary';
    } else if (statusLower === 'matched') {
      return 'bg-accent';
    } else if (statusLower === 'found') {
      return 'bg-primary';
    } else if (statusLower === 'stray') {
      return 'bg-accent';
    }
    return 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'missing' || statusLower === 'lost') {
      return 'Missing';
    } else if (statusLower === 'matched') {
      return 'Matched';
    } else if (statusLower === 'found') {
      return 'Found';
    }
    return 'Stray';
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold">Pet Gallery</h1>
          <p className="text-muted-foreground">Browse all reported pets - lost, found, and strays</p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, breed, or location..."
              className="w-full pl-12 pr-4 py-3 bg-white backdrop-blur-xl border border-border rounded-xl text-foreground placeholder:text-muted outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors shadow-sm"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {/* Type Filters */}
              <div className="flex gap-2 items-center">
                <Filter className="w-4 h-4 text-muted" />
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterType === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('Dog')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterType === 'Dog'
                      ? 'bg-primary text-white'
                      : 'bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  Dogs
                </button>
                <button
                  onClick={() => setFilterType('Cat')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterType === 'Cat'
                      ? 'bg-primary text-white'
                      : 'bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  Cats
                </button>
              </div>

              {/* Status Filters */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterStatus === 'all'
                      ? 'bg-foreground text-background'
                      : 'bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setFilterStatus('Lost')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterStatus === 'Lost'
                      ? 'bg-secondary text-white'
                      : 'bg-card text-foreground hover:bg-secondary/50'
                  }`}
                >
                  Missing
                </button>
                <button
                  onClick={() => setFilterStatus('Found')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterStatus === 'Found'
                      ? 'bg-primary text-white'
                      : 'bg-card text-foreground hover:bg-primary/50'
                  }`}
                >
                  Found
                </button>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-card rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {loading ? 'Loading...' : `Showing ${filteredPets.length} pet${filteredPets.length !== 1 ? 's' : ''}`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted">Loading pets...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Error loading pets</h3>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={fetchPets}
                  className="mt-2 text-sm text-red-700 hover:underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && !error && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPets.map((pet) => (
                  <div key={pet.id} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-2xl bg-card backdrop-blur-xl border border-border shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={pet.image} 
                          alt={pet.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/hero.jpg';
                          }}
                        />
                        {/* MATCHED Badge Overlay - only show if matched */}
                        {pet.status === 'matched' && (
                          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-2.5 px-4 font-bold text-sm shadow-lg z-10">
                            ✓ MATCHED
                          </div>
                        )}
                        <div className={`absolute ${pet.status === 'matched' ? 'top-12' : 'top-3'} left-3`}>
                          <span className={`${getStatusColor(pet.status)} text-white rounded-full px-3 py-1 text-xs font-semibold`}>
                            {getStatusLabel(pet.status)}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="bg-card/90 rounded-full px-3 py-1 text-xs font-semibold text-foreground">
                            {pet.type === 'dog' ? '🐕' : '🐱'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-foreground">{pet.name}</h3>
                        <p className="text-sm text-muted">{pet.breed}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{pet.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                          <span>{pet.location}</span>
                          <span>{pet.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPets.map((pet) => (
                  <div key={pet.id} className="group cursor-pointer">
                    <div className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                      <div className="flex gap-6">
                        <div className="relative w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={pet.image} 
                            alt={pet.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/hero.jpg';
                            }}
                          />
                          {/* MATCHED Badge Overlay for List View - only show if matched */}
                          {pet.status === 'matched' && (
                            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-center py-1 px-2 font-bold text-xs shadow-lg z-10">
                              ✓ MATCHED
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-semibold text-foreground">{pet.name}</h3>
                              <p className="text-muted">{pet.breed}</p>
                            </div>
                            <div className="flex gap-2">
                              <span className={`${getStatusColor(pet.status)} text-white rounded-full px-4 py-1 text-sm font-semibold`}>
                                {getStatusLabel(pet.status)}
                              </span>
                              <span className="bg-secondary/20 rounded-full px-4 py-1 text-sm font-semibold text-foreground">
                                {pet.type === 'dog' ? '🐕 Dog' : '🐱 Cat'}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{pet.description}</p>
                          <div className="flex gap-6 text-sm text-muted-foreground">
                            <span>📍 {pet.location}</span>
                            <span>📅 {pet.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && filteredPets.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all' 
                ? 'No pets found' 
                : 'No pets in gallery yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'Be the first to report a lost or found pet!'}
            </p>
            {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                  setFilterStatus('all');
                }}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}