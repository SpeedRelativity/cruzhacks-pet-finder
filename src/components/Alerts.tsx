import { Bell, MapPin, Clock, Heart, AlertCircle } from 'lucide-react';

export function Alerts() {
  const alerts = [
    {
      id: 1,
      type: 'match',
      title: 'New potential match found!',
      description: 'A golden retriever matching your description was found in Brooklyn',
      confidence: 92,
      time: '5 minutes ago',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop',
      source: 'reddit',
    },
    {
      id: 2,
      type: 'proximity',
      title: 'Lost pet near your location',
      description: 'A beagle was reported missing 0.5 miles from your area',
      time: '1 hour ago',
      image: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=200&h=200&fit=crop',
    },
    {
      id: 3,
      type: 'update',
      title: 'Your report has been viewed',
      description: '12 people have viewed your lost pet report today',
      time: '2 hours ago',
    },
    {
      id: 4,
      type: 'match',
      title: 'Possible match detected',
      description: 'An orange tabby cat found in Manhattan matches your search',
      confidence: 78,
      time: '3 hours ago',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop',
      source: 'twitter',
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Alerts</h1>
            <button className="text-sm text-primary font-medium hover:underline">
              Mark all as read
            </button>
          </div>
          <p className="text-muted-foreground">Stay updated on potential matches and activity</p>
        </div>

        {/* Alert Settings */}
        <div className="mb-6 bg-white/60 backdrop-blur-xl border border-primary-medium rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold">Alert Preferences</h3>
                <p className="text-sm text-muted">Get notified about new matches and updates</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white/60 backdrop-blur-xl border border-primary-medium rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex gap-4">
                {/* Icon/Image */}
                <div className="flex-shrink-0">
                  {alert.image ? (
                    <div className="relative">
                      <img
                        src={alert.image}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      {alert.source && (
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-md flex items-center justify-center ${
                          alert.source === 'reddit' ? 'bg-[#FF4500]' : 'bg-black'
                        }`}>
                          {alert.source === 'reddit' ? (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="white">
                              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                            </svg>
                          ) : (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="white">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      alert.type === 'match' ? 'bg-primary/20' :
                      alert.type === 'proximity' ? 'bg-accent/20' :
                      'bg-gray-100'
                    }`}>
                      {alert.type === 'match' ? (
                        <Heart className="w-8 h-8 text-primary" />
                      ) : alert.type === 'proximity' ? (
                        <MapPin className="w-8 h-8 text-accent" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-muted" />
                      )}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {alert.title}
                    </h3>
                    {alert.confidence && (
                      <span className="flex-shrink-0 px-2 py-1 bg-primary/20 text-primary rounded-lg text-xs font-bold">
                        {alert.confidence}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Clock className="w-3 h-3" />
                    <span>{alert.time}</span>
                  </div>
                </div>

                {/* Action Arrow */}
                <div className="flex-shrink-0 self-center">
                  <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if needed) */}
        {alerts.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No alerts yet</h3>
            <p className="text-muted-foreground">
              We'll notify you when we find potential matches for your pet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
