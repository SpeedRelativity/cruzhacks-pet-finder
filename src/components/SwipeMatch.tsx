import { useState, useEffect } from 'react';
import { X, Heart, Info, MapPin, Calendar, Sparkles, Mail } from 'lucide-react';

interface Pet {
  id: number;
  image: string;
  userImage?: string;
  description: string;
  location: string;
  date: string;
  confidence: number;
  tags: Array<{
    category: string;
    value: string;
    match: boolean;
  }>;
}

// Removed mockPets constant

/*
const mockPets: Pet[] = [
  // ... kept for reference if needed
];
*/

// Inside SwipeMatch component
export function SwipeMatch() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/reports');
        const data = await response.json();

        // Map backend data to frontend Pet interface
        const mappedPets: Pet[] = data.map((report: any) => ({
          id: report._id,
          image: report.image_urls?.[0] || 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80',
          userImage: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=800&fit=crop', // Placeholder for now
          description: report.description || `Found ${report.pet_type} named ${report.pet_name}`,
          location: report.user_info?.location || 'Unknown Location',
          date: new Date(report.created_at || Date.now()).toLocaleDateString(),
          confidence: Math.floor(Math.random() * 20) + 80, // Mock confidence for now
          tags: [
            { category: 'Species', value: report.tags.species, match: true },
            { category: 'Breed', value: report.tags.breed, match: true },
            { category: 'Color', value: report.tags.primary_color, match: true },
            ...(report.tags.marks || []).map((mark: string) => ({ category: 'Marking', value: mark, match: true }))
          ]
        }));

        setPets(mappedPets);
      } catch (error) {
        console.error("Failed to fetch pets:", error);
        // Fallback or empty state
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  const currentPet = pets[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Show confidence animation
      setShowConfidence(true);
      setTimeout(() => {
        setShowConfidence(false);
        // Navigate to next or show success
        if (currentIndex < pets.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0);
        }
      }, 2000);
    } else {
      // Just move to next
      if (currentIndex < pets.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }
    setDragOffset({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      </div>
    );
  }

  if (!currentPet) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No more matches</h2>
          <p className="text-muted">Check back later for new findings!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl font-bold">Swipe to Match</h1>
          <p className="text-muted">Smart matches based on your pet's description</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted">Reviewing matches</span>
            <span className="text-sm font-medium text-primary">{currentIndex + 1} / {pets.length}</span>
          </div>
          <div className="h-2 bg-primary-light rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / pets.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="relative mb-8">
          <div
            className={`relative transition-transform duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`,
            }}
          >
            {/* Glassmorphism Card */}
            <div className="relative overflow-hidden rounded-3xl bg-white border border-border shadow-2xl">
              {/* Image Section */}
              <div className="relative">
                <img
                  src={currentPet.image}
                  alt="Found pet"
                  className="w-full h-[500px] object-cover"
                />

                {/* Comparison Toggle */}
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="absolute top-4 right-4 px-4 py-2 bg-white/95 backdrop-blur-xl rounded-xl font-medium text-sm text-foreground shadow-lg hover:bg-secondary hover:text-white transition-colors flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  Compare
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-foreground">{currentPet.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span>{currentPet.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span>{currentPet.date}</span>
                  </div>
                </div>

                {/* Metadata Tags */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">Detected Features</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentPet.tags.map((tag, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${tag.match
                          ? 'bg-primary text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600'
                          }`}
                      >
                        <span className="font-semibold">{tag.category}:</span> {tag.value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Swipe Indicators */}
          <div
            className={`absolute top-1/4 left-8 transition-opacity ${dragOffset.x < -50 ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div className="bg-red-500 text-white px-6 py-3 rounded-2xl font-bold text-2xl rotate-[-15deg] shadow-xl border-4 border-white">
              SKIP
            </div>
          </div>
          <div
            className={`absolute top-1/4 right-8 transition-opacity ${dragOffset.x > 50 ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-2xl rotate-[15deg] shadow-xl border-4 border-white">
              MATCH
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          >
            <X className="w-8 h-8 text-gray-600" />
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
          >
            <Heart className="w-10 h-10 text-white fill-white" />
          </button>
        </div>

        {/* Comparison Mode Modal */}
        {showComparison && currentPet.userImage && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowComparison(false)}>
            <div className="bg-white rounded-3xl p-6 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold mb-6 text-center">Side-by-Side Comparison</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted text-center">Your Pet</p>
                  <img src={currentPet.userImage} alt="Your pet" className="w-full h-80 object-cover rounded-2xl" />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-muted text-center">Found Pet</p>
                  <img src={currentPet.image} alt="Found pet" className="w-full h-80 object-cover rounded-2xl" />
                </div>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="mt-6 w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90"
              >
                Close Comparison
              </button>
            </div>
          </div>
        )}

        {/* Confidence Score Animation */}
        {showConfidence && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 animate-fade-in">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Heart className="w-16 h-16 text-white fill-white animate-pulse" />
              </div>
              <div>
                <div className="text-6xl font-bold text-primary mb-2">{currentPet.confidence}%</div>
                <p className="text-xl font-semibold text-foreground">Match Confidence</p>
              </div>
              <p className="text-muted">Based on analysis of markings, breed, and color</p>

              {/* Email Contact Section */}
              <div className="bg-background rounded-2xl p-4 space-y-4">
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <Mail className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-semibold">Contact Owner via Email</span>
                </div>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors"
                />
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Write a message to the finder..."
                  className="w-full px-4 py-3 bg-white border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors resize-none"
                  rows={3}
                />
              </div>

              <button
                onClick={() => {
                  // Handle email submission
                  console.log('Sending email:', { email: contactEmail, message: contactMessage });
                  setShowConfidence(false);
                  // Reset form
                  setContactEmail('');
                  setContactMessage('');
                }}
                className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Send Contact Request
              </button>
            </div>
          </div>
        )}

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowContactForm(false)}>
            <div className="bg-white rounded-3xl p-6 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-bold mb-6 text-center">Contact Finder</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    rows={4}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90"
                >
                  Send Message
                </button>
              </form>
              <button
                onClick={() => setShowContactForm(false)}
                className="mt-6 w-full px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}