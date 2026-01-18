import { useState } from 'react';
import { Search, Filter, Grid3x3, List } from 'lucide-react';

interface Pet {
  id: number;
  name: string;
  type: 'dog' | 'cat';
  breed: string;
  status: 'missing' | 'found' | 'stray';
  location: string;
  date: string;
  image: string;
  description: string;
}

export function Gallery() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'dog' | 'cat'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'missing' | 'found' | 'stray'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const allPets: Pet[] = [
    {
      id: 1,
      name: 'Luna',
      type: 'dog',
      breed: 'Golden Retriever',
      status: 'missing',
      location: 'Brooklyn, NY',
      date: 'Dec 15, 2024',
      image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=600&h=600&fit=crop',
      description: 'Friendly golden retriever, responds to Luna',
    },
    {
      id: 2,
      name: 'Max',
      type: 'dog',
      breed: 'Beagle',
      status: 'missing',
      location: 'Queens, NY',
      date: 'Dec 13, 2024',
      image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&h=600&fit=crop',
      description: 'Tricolor beagle with blue tag',
    },
    {
      id: 3,
      name: 'Unknown',
      type: 'cat',
      breed: 'Domestic Shorthair',
      status: 'found',
      location: 'Manhattan, NY',
      date: 'Dec 16, 2024',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=600&fit=crop',
      description: 'Orange tabby cat found near Central Park',
    },
    {
      id: 4,
      name: 'Bella',
      type: 'dog',
      breed: 'Labrador',
      status: 'found',
      location: 'Bronx, NY',
      date: 'Dec 14, 2024',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&h=600&fit=crop',
      description: 'Yellow lab found wandering',
    },
    {
      id: 5,
      name: 'Whiskers',
      type: 'cat',
      breed: 'Maine Coon',
      status: 'missing',
      location: 'Staten Island, NY',
      date: 'Dec 10, 2024',
      image: 'https://images.unsplash.com/photo-1573865526739-10c1dd7be1f9?w=600&h=600&fit=crop',
      description: 'Large fluffy cat with distinctive markings',
    },
    {
      id: 6,
      name: 'Rocky',
      type: 'dog',
      breed: 'German Shepherd',
      status: 'stray',
      location: 'Brooklyn, NY',
      date: 'Dec 12, 2024',
      image: 'https://images.unsplash.com/photo-1568572933382-74d440642117?w=600&h=600&fit=crop',
      description: 'German Shepherd found without collar',
    },
    {
      id: 7,
      name: 'Mittens',
      type: 'cat',
      breed: 'Siamese',
      status: 'missing',
      location: 'Manhattan, NY',
      date: 'Dec 11, 2024',
      image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=600&h=600&fit=crop',
      description: 'Siamese cat with blue eyes',
    },
    {
      id: 8,
      name: 'Charlie',
      type: 'dog',
      breed: 'Pug',
      status: 'found',
      location: 'Queens, NY',
      date: 'Dec 15, 2024',
      image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&h=600&fit=crop',
      description: 'Small pug found in park',
    },
    {
      id: 9,
      name: 'Shadow',
      type: 'cat',
      breed: 'Black Cat',
      status: 'stray',
      location: 'Bronx, NY',
      date: 'Dec 13, 2024',
      image: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=600&h=600&fit=crop',
      description: 'Black cat with green eyes',
    },
    {
      id: 10,
      name: 'Buddy',
      type: 'dog',
      breed: 'Corgi',
      status: 'missing',
      location: 'Brooklyn, NY',
      date: 'Dec 9, 2024',
      image: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=600&h=600&fit=crop',
      description: 'Corgi with short legs and big ears',
    },
    {
      id: 11,
      name: 'Ginger',
      type: 'cat',
      breed: 'Persian',
      status: 'found',
      location: 'Manhattan, NY',
      date: 'Dec 16, 2024',
      image: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?w=600&h=600&fit=crop',
      description: 'Persian cat with long fur',
    },
    {
      id: 12,
      name: 'Zeus',
      type: 'dog',
      breed: 'Husky',
      status: 'stray',
      location: 'Queens, NY',
      date: 'Dec 14, 2024',
      image: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&h=600&fit=crop',
      description: 'Siberian Husky with blue eyes',
    },
  ];

  const filteredPets = allPets.filter((pet) => {
    const matchesType = filterType === 'all' || pet.type === filterType;
    const matchesStatus = filterStatus === 'all' || pet.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'missing':
        return 'bg-secondary';
      case 'found':
        return 'bg-primary';
      case 'stray':
        return 'bg-accent';
      default:
        return 'bg-gray-500';
    }
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
                  onClick={() => setFilterType('dog')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterType === 'dog'
                      ? 'bg-primary text-white'
                      : 'bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  Dogs
                </button>
                <button
                  onClick={() => setFilterType('cat')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterType === 'cat'
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
                  onClick={() => setFilterStatus('missing')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterStatus === 'missing'
                      ? 'bg-secondary text-white'
                      : 'bg-card text-foreground hover:bg-secondary/50'
                  }`}
                >
                  Missing
                </button>
                <button
                  onClick={() => setFilterStatus('found')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterStatus === 'found'
                      ? 'bg-primary text-white'
                      : 'bg-card text-foreground hover:bg-primary/50'
                  }`}
                >
                  Found
                </button>
                <button
                  onClick={() => setFilterStatus('stray')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filterStatus === 'stray'
                      ? 'bg-accent text-white'
                      : 'bg-card text-foreground hover:bg-accent/50'
                  }`}
                >
                  Stray
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
          <p className="text-sm text-muted">
            Showing {filteredPets.length} of {allPets.length} pets
          </p>
        </div>

        {/* Gallery Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPets.map((pet) => (
              <div key={pet.id} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-card backdrop-blur-xl border border-border shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                  <div className="relative h-64 overflow-hidden">
                    <img src={pet.image} alt={pet.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className={`${getStatusColor(pet.status)} text-white rounded-full px-3 py-1 text-xs font-semibold`}>
                        {pet.status}
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
                    <img src={pet.image} alt={pet.name} className="w-32 h-32 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-foreground">{pet.name}</h3>
                          <p className="text-muted">{pet.breed}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`${getStatusColor(pet.status)} text-white rounded-full px-4 py-1 text-sm font-semibold`}>
                            {pet.status}
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

        {/* Empty State */}
        {filteredPets.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No pets found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}