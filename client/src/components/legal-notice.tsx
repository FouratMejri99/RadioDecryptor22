import { Info, ExternalLink } from "lucide-react";

export function LegalNotice() {
  const handleLearnMore = () => {
    // Open legal information
    window.open('https://www.fcc.gov/wireless/bureau-divisions/mobility-division/rules-regulations-title-47', '_blank');
  };

  return (
    <div className="px-4 pb-6">
      <div className="bg-muted/30 rounded-lg p-4 border border-border">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-accent mb-1">Legal Notice</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              This app is for receive-only operation and educational purposes. 
              Transmitting requires proper licensing. Users must comply with local 
              radio regulations and respect privacy laws. Some frequencies may be 
              restricted for monitoring in your area.
            </p>
            <button 
              className="text-xs text-accent hover:text-accent/80 flex items-center gap-1" 
              onClick={handleLearnMore}
              data-testid="learn-more"
            >
              Learn More <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
