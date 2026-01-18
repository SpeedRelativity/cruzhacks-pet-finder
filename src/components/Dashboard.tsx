'use client';

import { useState, useEffect } from 'react';
import { Search, Upload, TrendingUp, Clock, MapPin, Calendar, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { WhiskerLoader } from './WhiskerLoader';
import { Badge } from './Badge';
import Link from 'next/link';
const heroImageSrc = '/images/hero.jpg';

interface RecentMatch {
  match_id: string;
  lost_report: {
    pet_name: string;
    pet_type: string;
    image_urls: string[];
    location: string;
    tags: {
      breed: string;
      primary_color: string;
    };
  };
  found_report: {
    pet_name: string;
    pet_type: string;
    image_urls: string[];
    location: string;
    tags: {
      breed: string;
      primary_color: string;
    };
  };
  created_at: string;
  decision_made_at: string;
}

export function Dashboard() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    fetchRecentMatches();
  }, []);

  const fetchRecentMatches = async () => {
    try {
      setMatchesLoading(true);
      const response = await fetch('http://localhost:8000/api/matches?status=accepted&limit=20');
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          // Filter for cats only
          const catMatches = (data.matches || []).filter((match: RecentMatch) => 
            match.found_report.pet_type.toLowerCase() === 'cat' || 
            match.lost_report.pet_type.toLowerCase() === 'cat'
          );
          setRecentMatches(catMatches);
          setCurrentMatchIndex(0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch recent matches:', error);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (recentMatches.length === 0) return;
    
    setSwipeDirection(direction);
    setTimeout(() => {
      if (direction === 'left') {
        setCurrentMatchIndex((prev) => (prev + 1) % recentMatches.length);
      } else {
        setCurrentMatchIndex((prev) => (prev - 1 + recentMatches.length) % recentMatches.length);
      }
      setSwipeDirection(null);
    }, 300);
  };

  const handleSearch = () => {
    if (searchQuery) {
      setIsSearching(true);
      setTimeout(() => setIsSearching(false), 3000);
    }
  };

  const userReports = [
    {
      id: 1,
      name: 'Luna',
      type: 'Golden Retriever',
      status: 'missing' as const,
      location: 'Brooklyn, NY',
      date: 'Dec 15, 2024',
      image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop',
      tags: ['Golden', 'Large', 'Red Collar'],
    },
    {
      id: 2,
      name: 'Max',
      type: 'Beagle',
      status: 'missing' as const,
      location: 'Queens, NY',
      date: 'Dec 13, 2024',
      image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&h=400&fit=crop',
      tags: ['Tricolor', 'Medium', 'Blue Tag'],
    },
  ];

  const scrapedMatches = [
    {
      id: 1,
      description: 'Friendly cat found near Central Park',
      source: 'twitter' as const,
      location: 'Manhattan, NY',
      date: '2 hours ago',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
      confidence: 87,
      tags: ['Orange Tabby', 'White Paws', 'Green Eyes'],
    },
    {
      id: 2,
      description: 'Found golden dog wandering',
      source: 'twitter' as const,
      location: 'Brooklyn, NY',
      date: '4 hours ago',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
      confidence: 92,
      tags: ['Golden', 'Large', 'Red Collar'],
    },
    {
      id: 3,
      description: 'Small beagle found in park',
      source: 'twitter' as const,
      location: 'Queens, NY',
      date: '6 hours ago',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=400&fit=crop',
      confidence: 78,
      tags: ['Tricolor', 'Small', 'No Collar'],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Full-Width Hero Section */}
      <section className="relative w-full">
        {/* Hero Image Container */}
        <div className="relative w-full h-[600px] overflow-hidden">
          {/* Background Image */}
          <img
            src={heroImageSrc}
            alt="Happy dog and cat together"
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-2xl space-y-6">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight text-white">
                  Every pet deserves to <span className="text-primary">come home</span>
                </h1>
                <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                  Powered matching connects lost pets with their families using social media and community reports
                </p>
                <Link href="/upload" className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg hover:opacity-90 transition-opacity shadow-primary inline-flex items-center gap-2">
                  Report Lost Pet
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Search Bar Section */}
        <section className="max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/30 to-accent/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-border rounded-2xl p-2 shadow-lg">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-muted ml-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Describe your pet or upload a photo..."
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted py-3"
                />
                <Link href="/upload" className="flex items-center gap-2 px-4 py-2.5 bg-secondary rounded-xl cursor-pointer hover:opacity-90 transition-opacity">
                  <Upload className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">Upload</span>
                </Link>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-primary"
                >
                  Search
                </button>
              </div>
            </div>
          </div>

          {isSearching && (
            <div className="animate-fade-in">
              <WhiskerLoader />
            </div>
          )}
        </section>

        {/* Curved Divider */}
        <div className="relative h-24 -mx-6">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 100">
            <path d="M0,0 Q600,100 1200,0 L1200,100 L0,100 Z" fill="rgba(78, 205, 196, 0.05)" />
          </svg>
        </div>

        {/* User Reports Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">User Reports</h2>
            </div>
            <Link href="/gallery" className="text-secondary font-medium hover:underline flex items-center gap-1">
              View all <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userReports.map((report) => (
              <div key={report.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-card backdrop-blur-xl border border-border shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] hover:border-primary/30">
                  <div className="relative h-64 overflow-hidden">
                    <img src={report.image} alt={report.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 left-3">
                      <Badge variant={report.status}>{report.status}</Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">{report.type}</p>
                    <div className="flex flex-wrap gap-2">
                      {report.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-lg border border-secondary/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span>{report.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-accent" />
                      <span>{report.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Curved Divider */}
        <div className="relative h-24 -mx-6">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 100">
            <path d="M0,100 Q600,0 1200,100 L1200,0 L0,0 Z" fill="rgba(155, 126, 222, 0.05)" />
          </svg>
        </div>

        {/* Recent Matched Cats Section with Swiping */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Recent Matched Cats</h2>
            </div>
            <button 
              onClick={() => {
                const event = new CustomEvent('navigateToMatches', { detail: 'matches' });
                window.dispatchEvent(event);
              }}
              className="text-accent font-medium hover:underline flex items-center gap-1"
            >
              View all <span>→</span>
            </button>
          </div>

          {matchesLoading ? (
            <div className="flex justify-center py-12">
              <WhiskerLoader />
            </div>
          ) : recentMatches.length > 0 ? (
            <div className="relative">
              {/* Swipeable Match Card */}
              <div className="relative max-w-2xl mx-auto">
                <div 
                  className={`relative overflow-hidden rounded-3xl bg-card backdrop-blur-xl border-2 border-accent/30 shadow-2xl transition-all duration-300 transform hover:border-accent/50 ${
                    swipeDirection === 'left' ? 'animate-slide-out-left' : swipeDirection === 'right' ? 'animate-slide-out-right' : ''
                  }`}
                >
                  {recentMatches[currentMatchIndex] && (
                    <>
                      <div className="relative h-96 overflow-hidden">
                        <img 
                          src={recentMatches[currentMatchIndex].found_report.image_urls?.[0] || '/images/hero.jpg'} 
                          alt={recentMatches[currentMatchIndex].found_report.pet_name || 'Matched cat'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/hero.jpg';
                          }}
                        />
                        <div className="absolute top-4 right-4">
                          <span className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                            <CheckCircle2 className="w-4 h-4" />
                            MATCHED
                          </span>
                        </div>
                        {/* Swipe Navigation Arrows */}
                        {recentMatches.length > 1 && (
                          <>
                            <button
                              onClick={() => handleSwipe('right')}
                              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all shadow-lg hover:scale-110"
                              aria-label="Previous match"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                              onClick={() => handleSwipe('left')}
                              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all shadow-lg hover:scale-110"
                              aria-label="Next match"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                          </>
                        )}
                        {/* Match Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                          {currentMatchIndex + 1} / {recentMatches.length}
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-1">
                            {recentMatches[currentMatchIndex].lost_report.pet_name || 'Unknown'} ↔ {recentMatches[currentMatchIndex].found_report.pet_name || 'Unknown'}
                          </h3>
                          <p className="text-muted-foreground">Perfect Match - Cat Reunited!</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-accent" />
                            <span>{recentMatches[currentMatchIndex].found_report.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-accent" />
                            <span>{new Date(recentMatches[currentMatchIndex].decision_made_at || recentMatches[currentMatchIndex].created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <span className="px-3 py-1.5 bg-primary/20 text-primary text-sm font-medium rounded-lg">
                            {recentMatches[currentMatchIndex].found_report.tags.breed}
                          </span>
                          <span className="px-3 py-1.5 bg-primary/20 text-primary text-sm font-medium rounded-lg">
                            {recentMatches[currentMatchIndex].found_report.tags.primary_color}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* Swipe Hint */}
              {recentMatches.length > 1 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Swipe or use arrows to see more matched cats
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted/20 flex items-center justify-center">
                <Clock className="w-10 h-10 text-muted" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Currently No More Matches</h3>
              <p className="text-muted-foreground mb-4">No matched cats to display right now.</p>
              <p className="text-sm text-muted-foreground">Check back later or accept a cat match to see it here!</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
