'use client';

import { useState } from 'react';
import { Search, Upload, TrendingUp, Clock, MapPin, Calendar } from 'lucide-react';
import { WhiskerLoader } from './WhiskerLoader';
import { Badge } from './Badge';
import Link from 'next/link';
const heroImageSrc = '/images/hero.jpg';

export function Dashboard() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
              <TrendingUp className="w-6 h-6 text-secondary" />
              <h2 className="text-2xl font-bold">User Reports</h2>
            </div>
            <button className="text-secondary font-medium hover:underline">View all →</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userReports.map((report) => (
              <div key={report.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-card backdrop-blur-xl border border-border shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                  <div className="relative h-64 overflow-hidden">
                    <img src={report.image} alt={report.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <Badge variant={report.status}>{report.status}</Badge>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-semibold text-foreground">{report.name}</h3>
                    <p className="text-sm text-muted">{report.type}</p>
                    <div className="flex flex-wrap gap-2">
                      {report.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-secondary text-white text-xs font-medium rounded-lg">
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

        {/* Scraped Social Matches Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold">Recent Matches</h2>
            </div>
            <button className="text-accent font-medium hover:underline">View all →</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scrapedMatches.map((match) => (
              <div key={match.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-card backdrop-blur-xl border border-border shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                  <div className="relative h-64 overflow-hidden">
                    <img src={match.image} alt={match.description} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <div className="px-3 py-1 bg-primary rounded-lg flex items-center gap-1">
                        <span className="text-white font-bold text-sm">{match.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <p className="text-sm text-foreground font-medium">{match.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {match.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-secondary text-white text-xs font-medium rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span>{match.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-accent" />
                      <span>{match.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
