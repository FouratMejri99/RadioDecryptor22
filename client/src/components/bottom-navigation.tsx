import { Search, List, Bookmark, Settings, Play, Pause } from "lucide-react";

interface BottomNavigationProps {
  currentPage: 'scan' | 'presets' | 'bookmarks' | 'settings';
  onPageChange: (page: 'scan' | 'presets' | 'bookmarks' | 'settings') => void;
  isScanning: boolean;
  onToggleScan: () => void;
}

export function BottomNavigation({ 
  currentPage, 
  onPageChange, 
  isScanning, 
  onToggleScan 
}: BottomNavigationProps) {
  const navItems = [
    { id: 'scan' as const, icon: isScanning ? Pause : Play, label: isScanning ? 'Pause' : 'Scan', action: onToggleScan },
    { id: 'presets' as const, icon: List, label: 'Presets', action: () => onPageChange('presets') },
    { id: 'bookmarks' as const, icon: Bookmark, label: 'Saved', action: () => onPageChange('bookmarks') },
    { id: 'settings' as const, icon: Settings, label: 'Settings', action: () => onPageChange('settings') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const isActive = item.id === 'scan' ? isScanning : currentPage === item.id;
          const IconComponent = item.icon;
          
          return (
            <button 
              key={item.id}
              className="flex flex-col items-center gap-1 p-2 hover:bg-secondary rounded-lg transition-colors" 
              onClick={item.action}
              data-testid={`nav-${item.id}`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
              <span className={`text-xs ${isActive ? 'text-accent' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
