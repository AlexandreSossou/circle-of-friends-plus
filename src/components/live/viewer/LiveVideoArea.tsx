
import React from 'react';
import { Video, AlertTriangle } from 'lucide-react';
import LiveSessionControls from './LiveSessionControls';
import { useCalmMode } from '@/context/CalmModeContext';

interface LiveVideoAreaProps {
  isHost?: boolean;
  onEndStream?: () => void;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onRetryConnection?: () => void;
}

const LiveVideoArea: React.FC<LiveVideoAreaProps> = ({ 
  isHost = false, 
  onEndStream, 
  isLoading = false,
  hasError = false,
  errorMessage = "Failed to connect to the live stream",
  onRetryConnection
}) => {
  const { calmMode } = useCalmMode();
  
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
          {isHost && <LiveSessionControls onEndStream={onEndStream} onRetryConnection={onRetryConnection} hasError={true} />}
        </div>
      </div>
    );
  }
  
  // Default video state
  return (
    <div className={`w-full ${calmMode ? 'bg-calm-card' : 'bg-black'} relative flex items-center justify-center min-h-[300px]`}>
      {/* Placeholder for video */}
      <div className="text-center text-white">
        <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-medium">Live Session Demo</h3>
        <p className={`mt-2 ${calmMode ? 'text-calm-textSecondary' : 'text-gray-400'}`}>
          This is a placeholder for a real video stream.<br />
          In a real app, this would be connected to a live streaming service.
        </p>
      </div>
      
      {/* Host controls overlay - in a real app, these would only be visible to the host */}
      {isHost && <LiveSessionControls onEndStream={onEndStream} />}
    </div>
  );
};

export default LiveVideoArea;
