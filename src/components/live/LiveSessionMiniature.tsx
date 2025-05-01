
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LiveSession } from './LiveSessionCard';
import { Users } from 'lucide-react';
import { useCalmMode } from '@/context/CalmModeContext';

interface LiveSessionMiniatureProps {
  session: LiveSession;
}

const LiveSessionMiniature: React.FC<LiveSessionMiniatureProps> = ({ session }) => {
  const navigate = useNavigate();
  const { calmMode } = useCalmMode();
  
  const getLanguageFlag = (languageCode: string) => {
    // Map language codes to flag emojis
    const flagMap: Record<string, string> = {
      'en': '🇬🇧',
      'es': '🇪🇸',
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'ru': '🇷🇺',
      'zh': '🇨🇳',
      'ja': '🇯🇵',
      'ko': '🇰🇷',
      'ar': '🇸🇦',
      'hi': '🇮🇳',
      'tr': '🇹🇷',
      'nl': '🇳🇱',
      'pl': '🇵🇱',
      'sv': '🇸🇪',
      'da': '🇩🇰',
      'fi': '🇫🇮',
      'no': '🇳🇴',
    };
    
    return flagMap[languageCode] || '🌐';
  };
  
  return (
    <div 
      className={`relative rounded-lg overflow-hidden cursor-pointer ${calmMode ? 'shadow-sm' : 'shadow-md'} hover:shadow-lg transition-shadow`}
      onClick={() => navigate(`/live-sessions`)}
    >
      {/* Video thumbnail - using a placeholder gradient */}
      <div className={`${calmMode ? 'bg-gradient-to-br from-calm-primary to-calm-accent' : 'bg-gradient-to-br from-social-blue to-purple-600'} aspect-video flex items-center justify-center`}>
        <span className="h-3 w-3 bg-red-500 rounded-full animate-pulse inline-block mr-2"></span>
        <span className="text-white font-semibold">LIVE</span>
      </div>
      
      {/* Session info */}
      <div className={`p-3 ${calmMode ? 'bg-calm-card' : 'bg-white'}`}>
        <div className="flex justify-between items-start">
          <h4 className={`font-medium text-sm line-clamp-1 ${calmMode ? 'text-calm-text' : ''}`}>{session.title}</h4>
          <span className="text-lg ml-2" title={`Language: ${session.language}`}>
            {getLanguageFlag(session.language)}
          </span>
        </div>
        <p className={`text-xs ${calmMode ? 'text-calm-textSecondary' : 'text-social-textSecondary'} mt-1`}>{session.hostName}</p>
        <div className={`flex items-center mt-1 text-xs ${calmMode ? 'text-calm-textSecondary' : 'text-social-textSecondary'}`}>
          <Users className="h-3 w-3 mr-1" />
          <span>{session.viewerCount}</span>
        </div>
      </div>
      
      {/* Red pulse animation at the top right corner */}
      <div className="absolute top-2 right-2 flex items-center bg-black bg-opacity-60 rounded-full px-2 py-0.5">
        <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse inline-block mr-1"></span>
        <span className="text-white text-xs">LIVE</span>
      </div>
    </div>
  );
};

export default LiveSessionMiniature;
