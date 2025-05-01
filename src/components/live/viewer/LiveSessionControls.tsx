
import React from 'react';
import { VideoOff, MicOff, RefreshCcw, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCalmMode } from '@/context/CalmModeContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/LanguageContext';

interface LiveSessionControlsProps {
  onEndStream?: () => void;
  onRetryConnection?: () => void;
  hasError?: boolean;
  availableLanguages?: string[];
  onLanguageChange?: (language: string) => void;
  currentLanguage?: string;
}

const LiveSessionControls: React.FC<LiveSessionControlsProps> = ({ 
  onEndStream, 
  onRetryConnection,
  hasError = false,
  availableLanguages = [],
  onLanguageChange,
  currentLanguage = 'en'
}) => {
  const { calmMode } = useCalmMode();
  const { t } = useLanguage();
  
  // Helper function to get language name and flag emoji
  const getLanguageInfo = (languageCode: string) => {
    const flagMap: Record<string, string> = {
      'en': '🇬🇧 English',
      'es': '🇪🇸 Spanish',
      'fr': '🇫🇷 French',
      'de': '🇩🇪 German',
      'it': '🇮🇹 Italian',
      'pt': '🇵🇹 Portuguese',
      'ru': '🇷🇺 Russian',
      'zh': '🇨🇳 Chinese',
      'ja': '🇯🇵 Japanese',
      'ko': '🇰🇷 Korean',
      'ar': '🇸🇦 Arabic',
      'hi': '🇮🇳 Hindi',
      'tr': '🇹🇷 Turkish',
      'nl': '🇳🇱 Dutch',
      'pl': '🇵🇱 Polish',
      'sv': '🇸🇪 Swedish',
      'da': '🇩🇰 Danish',
      'fi': '🇫🇮 Finnish',
      'no': '🇳🇴 Norwegian',
    };
    
    return flagMap[languageCode] || `🌐 ${languageCode.toUpperCase()}`;
  };
  
  if (hasError) {
    return (
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
        <Button 
          className={`${calmMode ? 'bg-calm-primary hover:bg-calm-primary/90' : 'bg-blue-500 hover:bg-blue-600'} rounded-full`} 
          onClick={onRetryConnection}
        >
          <RefreshCcw className="h-5 w-5 mr-2" />
          Retry Connection
        </Button>
        <Button className="bg-red-500 hover:bg-red-600 rounded-full" onClick={onEndStream}>
          End Stream
        </Button>
      </div>
    );
  }
  
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-gray-900 bg-opacity-70 px-4 py-2 rounded-full">
      <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 rounded-full h-10 w-10">
        <VideoOff className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 rounded-full h-10 w-10">
        <MicOff className="h-5 w-5" />
      </Button>
      
      {availableLanguages.length > 1 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800 rounded-full h-10 w-10">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="bg-gray-900 text-white border-gray-700">
            {availableLanguages.map((lang) => (
              <DropdownMenuItem 
                key={lang}
                className={`hover:bg-gray-800 cursor-pointer ${currentLanguage === lang ? 'bg-gray-800' : ''}`}
                onClick={() => onLanguageChange && onLanguageChange(lang)}
              >
                {getLanguageInfo(lang)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      <Button className="bg-red-500 hover:bg-red-600 rounded-full" onClick={onEndStream}>
        End Stream
      </Button>
    </div>
  );
};

export default LiveSessionControls;
