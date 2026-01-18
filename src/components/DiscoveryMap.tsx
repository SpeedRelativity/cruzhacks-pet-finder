import { useState } from 'react';
import { MapPin, Filter, Search, Calendar } from 'lucide-react';

interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  type: 'found' | 'lost';
  count: number;
  pets: Array<{
    name: string;
    image: string;
    description: string;
  }>;
}

export function DiscoveryMap() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'found' | 'lost'>('all');
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // Mock data for heat map clusters
  const markers: MapMarker[] = [
    {
      id: 1,
      lat: 40.7128,
      lng: -73.9352,
      type: 'found',
      count: 12,
      pets: [
        {
          name: 'Unknown Orange Cat',
          image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop',
          description: 'Found near Central Park',
        },
        {
          name: 'Golden Retriever',
          image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop',
          description: 'Wandering in East Village',
        },
      ],
    },
    {
      id: 2,
      lat: 40.6501,
      lng: -73.9496,
      type: 'lost',
      count: 8,
      pets: [
        {
          name: 'Luna',
          image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=200&h=200&fit=crop',
          description: 'Missing from Prospect Park area',
        },
      ],
    },
    {
      id: 3,
      lat: 40.7614,
      lng: -73.9776,
      type: 'found',
      count: 15,
      pets: [
        {
          name: 'Small Beagle',
          image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200&h=200&fit=crop',
          description: 'Found in Upper West Side',
        },
      ],
    },
    {
      id: 4,
      lat: 40.7282,
      lng: -73.7949,
      type: 'lost',
      count: 5,
      pets: [
        {
          name: 'Max',
          image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=200&h=200&fit=crop',
          description: 'Missing from Queens',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Discovery Map</h1>
          <p className="text-muted-foreground">Real-time heat map of found and lost pet reports from social media</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-white text-foreground hover:bg-primary/20 border border-border'
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setSelectedFilter('found')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedFilter === 'found'
                  ? 'bg-accent text-white'
                  : 'bg-white text-foreground hover:bg-accent/20 border border-border'
              }`}
            >
              Found Pets
            </button>
            <button
              onClick={() => setSelectedFilter('lost')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedFilter === 'lost'
                  ? 'bg-secondary text-white'
                  : 'bg-white text-foreground hover:bg-secondary/20 border border-border'
              }`}
            >
              Lost Pets
            </button>
          </div>

          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Search location..."
                className="w-full pl-11 pr-4 py-2.5 bg-white backdrop-blur-xl border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map - Using sample image */}
          <div className="lg:col-span-2">
            <div className="relative h-[600px] bg-white rounded-3xl overflow-hidden border border-border shadow-lg">
              {/* Map Background Image */}
              <img 
                src="https://images.unsplash.com/photo-1747566068635-9937c15f4f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
                alt="Map view" 
                className="w-full h-full object-cover opacity-90"
              />

              {/* Heat Map Clusters Overlay */}
              <div className="absolute inset-0">
                {markers.map((marker, index) => {
                  if (selectedFilter !== 'all' && marker.type !== selectedFilter) return null;
                  
                  const x = ((marker.lng + 74) / 0.2) * 100;
                  const y = ((40.8 - marker.lat) / 0.15) * 100;
                  const size = Math.min(marker.count * 8, 120);
                  
                  return (
                    <div
                      key={marker.id}
                      className="absolute cursor-pointer group"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      onClick={() => setSelectedMarker(marker)}
                    >
                      {/* Heat glow */}
                      <div
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-all ${
                          marker.type === 'found' 
                            ? 'bg-accent/40 group-hover:bg-accent/60' 
                            : 'bg-secondary/40 group-hover:bg-secondary/60'
                        }`}
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                        }}
                      ></div>
                      
                      {/* Center dot */}
                      <div
                        className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                          marker.type === 'found' ? 'bg-accent' : 'bg-secondary'
                        } group-hover:scale-110 transition-transform`}
                      >
                        {marker.count}
                      </div>

                      {/* Tooltip */}
                      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-xl rounded-xl px-3 py-2 shadow-xl whitespace-nowrap">
                          <p className="text-sm font-semibold text-foreground">{marker.count} {marker.type} reports</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-xl border border-border rounded-2xl p-4 space-y-3 shadow-sm">
                <p className="text-sm font-semibold text-foreground">Legend</p>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-accent"></div>
                  <span className="text-xs text-muted-foreground">Found Pets</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-secondary"></div>
                  <span className="text-xs text-muted-foreground">Lost Pets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-foreground">Live Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Reports</span>
                  <span className="text-xl font-bold text-primary">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Found Today</span>
                  <span className="text-xl font-bold text-accent">23</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lost Today</span>
                  <span className="text-xl font-bold text-secondary">15</span>
                </div>
              </div>
            </div>

            {/* Selected Cluster Details */}
            {selectedMarker ? (
              <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-foreground">Cluster Details</h3>
                  <button
                    onClick={() => setSelectedMarker(null)}
                    className="text-sm text-muted hover:text-foreground"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedMarker.pets.map((pet, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-background rounded-xl hover:bg-secondary/10 transition-colors cursor-pointer">
                      <img src={pet.image} alt={pet.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{pet.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{pet.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-border rounded-2xl p-6 text-center shadow-sm">
                <MapPin className="w-12 h-12 text-muted mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Click on a cluster to see details</p>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { type: 'found', location: 'Manhattan', time: '2m ago' },
                  { type: 'lost', location: 'Brooklyn', time: '5m ago' },
                  { type: 'found', location: 'Queens', time: '12m ago' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'found' ? 'bg-accent' : 'bg-secondary'
                    }`}></div>
                    <span className="text-foreground flex-1">{activity.location}</span>
                    <span className="text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}