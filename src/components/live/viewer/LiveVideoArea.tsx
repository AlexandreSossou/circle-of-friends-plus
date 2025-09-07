
import React, { useRef, useEffect, useState } from 'react';
import { Video, AlertTriangle, Camera, CameraOff } from 'lucide-react';
import LiveSessionControls from './LiveSessionControls';
import { useCalmMode } from '@/context/CalmModeContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // Camera access functions
  const startCamera = async () => {
    try {
      if (cameraEnabled && stream) {
        console.log('Camera already running');
        return;
      }
      setCameraError(null);
      // Ensure any previous tracks are stopped before starting a new one
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false // Audio is handled separately by the realtime session
      });
      
      setStream(mediaStream);
      setCameraEnabled(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          // Ensure inline playback across browsers
          videoRef.current.muted = true;
          (videoRef.current as any).playsInline = true;
          await (videoRef.current as HTMLVideoElement).play();
        } catch (e) {
          console.warn('Autoplay blocked, will try after metadata', e);
          videoRef.current.addEventListener('loadedmetadata', () => {
            videoRef.current?.play().catch(() => {});
          }, { once: true });
        }
      }
      
      toast({
        title: "Camera Started",
        description: "Your camera is now streaming",
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera';
      setCameraError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraEnabled(false);
    setCameraError(null);
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    toast({
      title: "Camera Stopped",
      description: "Your camera stream has been stopped",
    });
  };

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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
    <div className={`w-full ${calmMode ? 'bg-calm-card' : 'bg-black'} relative h-full min-h-[300px]`}>
      {/* Current language badge */}
      {availableLanguages.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="secondary" className={`${calmMode ? 'bg-calm-accent text-calm-text' : 'bg-gray-800 text-white'}`}>
            {getLanguageFlag(currentLanguage)} {currentLanguage.toUpperCase()}
          </Badge>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="text-center text-white">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4 border-white opacity-70"></div>
            <h3 className="text-xl font-medium">Connecting to live stream...</h3>
            <p className={`${calmMode ? 'text-calm-textSecondary' : 'text-gray-300'}`}>Preparing audio connection</p>
          </div>
        </div>
      )}
      
      {/* Camera controls */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          onClick={cameraEnabled ? stopCamera : startCamera}
          variant={cameraEnabled ? "destructive" : "secondary"}
          size="sm"
          className="flex items-center gap-2"
        >
          {cameraEnabled ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          {cameraEnabled ? "Stop Camera" : "Start Camera"}
        </Button>
      </div>
      
      {/* Video stream or placeholder */}
      {cameraEnabled && !cameraError ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white">
            <Video className={`h-16 w-16 mx-auto mb-4 opacity-50 ${isSpeaking ? 'text-green-500 animate-pulse' : ''}`} />
            <h3 className="text-xl font-medium">
              {cameraError ? "Camera Error" : isRecording ? "🎙️ Recording..." : "Live Session Active"}
            </h3>
            <p className={`mt-2 ${calmMode ? 'text-calm-textSecondary' : 'text-gray-400'}`}>
              {cameraError ? cameraError : 
               isSpeaking ? "AI is speaking..." : 
               isRecording ? "Listening for audio..." : 
               "Audio streaming active"}
            </p>
            {isRecording && !cameraError && (
              <div className="mt-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Status indicator overlay */}
      {(isRecording || isSpeaking) && (
        <div className="absolute bottom-4 left-4 z-10">
          <Badge 
            variant={isSpeaking ? "default" : "secondary"}
            className={`${
              isSpeaking 
                ? 'bg-green-500 text-white animate-pulse' 
                : 'bg-red-500 text-white animate-pulse'
            }`}
          >
            {isSpeaking ? "🗣️ AI Speaking" : "🎙️ Recording"}
          </Badge>
        </div>
      )}
      
      {/* Host controls overlay */}
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
