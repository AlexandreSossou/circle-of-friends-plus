
import React from 'react';
import { Video, AlertTriangle } from 'lucide-react';
import LiveSessionControls from './LiveSessionControls';
import { useCalmMode } from '@/context/CalmModeContext';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';

interface LiveVideoAreaProps {
  isHost?: boolean;
  onEndStream?: () => void;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onRetryConnection?: () => void;
  availableLanguages?: string[];
  onLanguageChange?: (language: string) => void;
  currentLanguage?: string;
  isRecording?: boolean;
  isSpeaking?: boolean;
}

const LiveVideoArea: React.FC<LiveVideoAreaProps> = ({ 
  isHost = false, 
  onEndStream, 
  isLoading = false,
  hasError = false,
  errorMessage = "Failed to connect to the live stream",
  onRetryConnection,
  availableLanguages = [],
  onLanguageChange,
  currentLanguage = 'en',
  isRecording = false,
  isSpeaking = false
}) => {
  const { calmMode } = useCalmMode();
  const { t } = useLanguage();
  
  // Map language codes to flag emojis for display
  const getLanguageFlag = (languageCode: string) => {
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
  
  // Loading state
  if (isLoading) {
    return (
      <div className={`w-full ${calmMode ? 'bg-calm-card' : 'bg-black'} relative flex items-center justify-center min-h-[300px]`}>
        <div className="text-center text-white">
          <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4 border-white opacity-50"></div>
          <h3 className="text-xl font-medium">Connecting to live stream...</h3>
          <p className={`mt-2 ${calmMode ? 'text-calm-textSecondary' : 'text-gray-400'}`}>
            Please wait while we establish the connection
          </p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (hasError) {
    return (
      <div className={`w-full ${calmMode ? 'bg-calm-card' : 'bg-black'} relative flex items-center justify-center min-h-[300px]`}>
        <div className="text-center text-white">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-medium">Stream Connection Error</h3>
          <p className={`mt-2 ${calmMode ? 'text-calm-textSecondary' : 'text-gray-400'}`}>
            {errorMessage}
          </p>
          {isHost && (
            <LiveSessionControls 
              onEndStream={onEndStream} 
              onRetryConnection={onRetryConnection} 
              hasError={true} 
              availableLanguages={availableLanguages}
              onLanguageChange={onLanguageChange}
              currentLanguage={currentLanguage}
            />
          )}
        </div>
      </div>
    );
  }
  
  // Default video state
  return (
    <div className={`w-full ${calmMode ? 'bg-calm-card' : 'bg-black'} relative flex items-center justify-center min-h-[300px]`}>
      {/* Current language badge */}
      {availableLanguages.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="secondary" className={`${calmMode ? 'bg-calm-accent text-calm-text' : 'bg-gray-800 text-white'}`}>
            {getLanguageFlag(currentLanguage)} {currentLanguage.toUpperCase()}
          </Badge>
        </div>
      )}
      
      {/* Placeholder for video */}
      <div className="text-center text-white">
        <Video className={`h-16 w-16 mx-auto mb-4 opacity-50 ${isSpeaking ? 'text-green-500 animate-pulse' : ''}`} />
        <h3 className="text-xl font-medium">
          {isRecording ? "🎙️ Recording..." : "Live Session Active"}
        </h3>
        <p className={`mt-2 ${calmMode ? 'text-calm-textSecondary' : 'text-gray-400'}`}>
          {isSpeaking ? "AI is speaking..." : isRecording ? "Listening for audio..." : "Audio streaming active"}
        </p>
        {isRecording && (
          <div className="mt-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mx-auto"></div>
          </div>
        )}
      </div>
      
      {/* Host controls overlay - in a real app, these would only be visible to the host */}
      {isHost && (
        <LiveSessionControls 
          onEndStream={onEndStream} 
          availableLanguages={availableLanguages}
          onLanguageChange={onLanguageChange}
          currentLanguage={currentLanguage}
        />
      )}
    </div>
  );
};

export default LiveVideoArea;
