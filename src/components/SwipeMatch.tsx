'use client';

import { useState, useEffect } from 'react';
import { X, Heart, Info, MapPin, Calendar, Sparkles, Mail, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Match {
  match_id: string;
  lost_report: {
    report_id: string;
    pet_name: string;
    pet_type: string;
    image_urls: string[];
    tags: {
      species: string;
      breed: string;
      primary_color: string;
      age_group: string;
      size: string;
      marks: string[];
    };
    location: string;
    description: string;
    created_at: string;
  };
  found_report: {
    report_id: string;
    pet_name: string;
    pet_type: string;
    image_urls: string[];
    tags: {
      species: string;
      breed: string;
      primary_color: string;
      age_group: string;
      size: string;
      marks: string[];
    };
    location: string;
    description: string;
    created_at: string;
  };
  match_score: number;
  matched_tags: string[];
  status: string;
  created_at: string;
}

export function SwipeMatch() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8000/api/matches?status=pending');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setMatches(data.matches || []);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err: any) {
      console.error("Failed to fetch matches:", err);
      setError(err.message || 'Failed to load matches');
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision: 'accept' | 'reject') => {
    const currentMatch = matches[currentIndex];
    if (!currentMatch || processing) return;

    try {
      setProcessing(true);
      
      // Send decision as query parameter
      const response = await fetch(`http://localhost:8000/api/matches/${currentMatch.match_id}/decision?decision=${decision}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `Failed to ${decision} match`);
      }

      const result = await response.json();
      
      // Remove the match from the list
      const newMatches = matches.filter(m => m.match_id !== currentMatch.match_id);
      setMatches(newMatches);
      
      // Adjust current index properly
      if (newMatches.length === 0) {
        setCurrentIndex(0);
      } else {
        // If we're at the last match, go to the previous one
        // Otherwise stay at the same index (which now shows the next match)
        if (currentIndex >= newMatches.length) {
          setCurrentIndex(Math.max(0, newMatches.length - 1));
        }
        // If currentIndex is valid, it stays the same (next match slides in)
      }

      if (decision === 'accept') {
        console.log('✅ Match accepted! Pet status updated to "Found"');
        // Show success message briefly
        setTimeout(() => {
          // Could trigger a refresh of the dashboard here
        }, 1000);
      }
    } catch (err: any) {
      console.error(`Failed to ${decision} match:`, err);
      const errorMessage = err.message || `Failed to ${decision} match`;
      setError(errorMessage);
      // Show error toast instead of alert for better UX
      setTimeout(() => {
        setError(null);
      }, 5000);
    } finally {
      setProcessing(false);
    }
  };

  const currentMatch = matches[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error && matches.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error loading matches</h2>
          <p className="text-muted mb-4">{error}</p>
          <button
            onClick={fetchMatches}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentMatch || matches.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-foreground">Currently No More Matches</h2>
          <p className="text-muted-foreground mb-6 text-lg">
            We don't have any pending matches right now. Keep checking back - new matches appear automatically when pets are reported!
          </p>
          <div className="space-y-3">
            <button
              onClick={fetchMatches}
              className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
            >
              Refresh Matches
            </button>
            <p className="text-sm text-muted-foreground">
              💡 Tip: Upload a Lost or Found pet report to generate new matches
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground">Match Found! 🎉</h1>
          <p className="text-lg text-muted-foreground">Perfect matches based on AI-tagged attributes (3/3 tags matched)</p>
        </div>

        {/* Match Score Badge */}
        <div className="mb-6 flex justify-center">
          <div className="bg-primary/20 border border-primary rounded-full px-6 py-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">
              {currentMatch.match_score}/3 Tags Matched
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted">Reviewing matches</span>
            <span className="text-sm font-medium text-primary">{currentIndex + 1} / {matches.length}</span>
          </div>
          <div className="h-2 bg-primary-light rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 shadow-sm"
              style={{ width: `${((currentIndex + 1) / matches.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Swipe Navigation Hint */}
        {matches.length > 1 && (
          <div className="mb-4 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Swipe left/right or use buttons below to navigate between matches
            </p>
          </div>
        )}

        {/* Main Card */}
        <div className="relative mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-card backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
            {/* Image Section - Show Found Pet */}
            <div className="relative">
              <img
                src={currentMatch.found_report.image_urls?.[0] || '/images/hero.jpg'}
                alt="Found pet"
                className="w-full h-[400px] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/hero.jpg';
                }}
              />

              {/* Comparison Toggle */}
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="absolute top-4 right-4 px-4 py-2 bg-card/95 backdrop-blur-xl rounded-xl font-medium text-sm text-foreground shadow-lg hover:bg-secondary hover:text-secondary-foreground transition-colors flex items-center gap-2 border border-border"
              >
                <Info className="w-4 h-4" />
                Compare
              </button>

              {/* Match Badge */}
              <div className="absolute top-4 left-4 px-4 py-2 bg-accent text-accent-foreground rounded-xl font-semibold text-sm shadow-lg">
                🎯 Perfect Match
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {currentMatch.found_report.pet_name || 'Unknown Pet'}
                </h2>
                <p className="text-foreground">{currentMatch.found_report.description || `Found ${currentMatch.found_report.pet_type}`}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>{currentMatch.found_report.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span>{new Date(currentMatch.found_report.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Matched Tags */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Matching Features (3/3)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-2 rounded-xl text-sm font-medium bg-primary text-white shadow-sm">
                    <span className="font-semibold">Species:</span> {currentMatch.found_report.tags.species}
                  </div>
                  <div className="px-3 py-2 rounded-xl text-sm font-medium bg-primary text-white shadow-sm">
                    <span className="font-semibold">Breed:</span> {currentMatch.found_report.tags.breed}
                  </div>
                  <div className="px-3 py-2 rounded-xl text-sm font-medium bg-primary text-white shadow-sm">
                    <span className="font-semibold">Color:</span> {currentMatch.found_report.tags.primary_color}
                  </div>
                </div>
                {currentMatch.found_report.tags.marks && currentMatch.found_report.tags.marks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentMatch.found_report.tags.marks.map((mark: string, idx: number) => (
                      <div key={idx} className="px-3 py-2 rounded-xl text-sm bg-primary-light text-primary font-medium">
                        {mark}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center justify-center gap-6">
            {/* Previous Match Button */}
            {matches.length > 1 && (
              <button
                onClick={() => {
                  setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length);
                }}
                disabled={processing}
                className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:border-primary"
                aria-label="Previous match"
              >
                <ChevronLeft className="w-8 h-8 text-foreground" />
              </button>
            )}
            <button
              onClick={() => handleDecision('reject')}
              disabled={processing}
              className="w-20 h-20 rounded-full bg-card border-3 border-destructive flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <X className="w-10 h-10 text-destructive" />
            </button>
            <button
              onClick={() => handleDecision('accept')}
              disabled={processing}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-accent via-accent to-primary flex items-center justify-center hover:scale-110 hover:shadow-2xl transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ring-4 ring-accent/30"
            >
              <CheckCircle2 className="w-14 h-14 text-white fill-white" />
            </button>
            {/* Next Match Button */}
            {matches.length > 1 && (
              <button
                onClick={() => {
                  setCurrentIndex((prev) => (prev + 1) % matches.length);
                }}
                disabled={processing}
                className="w-16 h-16 rounded-full bg-card border-2 border-border flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:border-primary"
                aria-label="Next match"
              >
                <ChevronRight className="w-8 h-8 text-foreground" />
              </button>
            )}
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-muted-foreground">← No, not a match</p>
            <p className="text-base font-bold text-accent">Yes - This is my pet! →</p>
          </div>
        </div>

        {/* Comparison Mode Modal */}
        {showComparison && currentMatch && (
          <div className="fixed inset-0 bg-dark-overlay backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowComparison(false)}>
            <div className="bg-card backdrop-blur-xl rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold mb-6 text-center text-foreground">Side-by-Side Comparison</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-secondary text-center">Lost Pet</p>
                  <img 
                    src={currentMatch.lost_report.image_urls?.[0] || '/images/hero.jpg'} 
                    alt="Lost pet" 
                    className="w-full h-80 object-cover rounded-2xl shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero.jpg';
                    }}
                  />
                  <div className="p-4 bg-background/50 rounded-xl space-y-2 border border-border">
                    <p className="font-semibold text-foreground">{currentMatch.lost_report.pet_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{currentMatch.lost_report.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">{currentMatch.lost_report.tags.breed}</span>
                      <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">{currentMatch.lost_report.tags.primary_color}</span>
                      <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium">{currentMatch.lost_report.tags.size}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">📍 {currentMatch.lost_report.location}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-primary text-center">Found Pet</p>
                  <img 
                    src={currentMatch.found_report.image_urls?.[0] || '/images/hero.jpg'} 
                    alt="Found pet" 
                    className="w-full h-80 object-cover rounded-2xl shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero.jpg';
                    }}
                  />
                  <div className="p-4 bg-background/50 rounded-xl space-y-2 border border-border">
                    <p className="font-semibold text-foreground">{currentMatch.found_report.pet_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{currentMatch.found_report.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium">{currentMatch.found_report.tags.breed}</span>
                      <span className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium">{currentMatch.found_report.tags.primary_color}</span>
                      <span className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium">{currentMatch.found_report.tags.size}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">📍 {currentMatch.found_report.location}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="mt-6 w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 shadow-primary"
              >
                Close Comparison
              </button>
            </div>
          </div>
        )}

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-4 rounded-xl shadow-lg z-50 animate-fade-in max-w-md">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Processing Overlay */}
        {processing && (
          <div className="fixed inset-0 bg-dark-overlay backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-card backdrop-blur-xl rounded-3xl p-8 max-w-md w-full text-center space-y-6 border border-border shadow-2xl">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
              <p className="text-foreground font-semibold">Processing your decision...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}