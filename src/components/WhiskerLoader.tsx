export function WhiskerLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        {/* Animated whiskers */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse"></div>
        </div>
        
        {/* Whisker lines */}
        <div className="absolute inset-0 animate-spin">
          <div className="absolute top-1/2 left-0 w-8 h-0.5 bg-secondary origin-right" style={{ transform: 'translateY(-50%) rotate(30deg)' }}></div>
          <div className="absolute top-1/2 left-0 w-8 h-0.5 bg-secondary origin-right" style={{ transform: 'translateY(-50%) rotate(-30deg)' }}></div>
          <div className="absolute top-1/2 right-0 w-8 h-0.5 bg-secondary origin-left" style={{ transform: 'translateY(-50%) rotate(-30deg)' }}></div>
          <div className="absolute top-1/2 right-0 w-8 h-0.5 bg-secondary origin-left" style={{ transform: 'translateY(-50%) rotate(30deg)' }}></div>
        </div>
      </div>
      <p className="text-sm font-medium text-muted">Scanning for matches...</p>
    </div>
  );
}