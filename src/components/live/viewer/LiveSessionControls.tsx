
import React from 'react';
import { VideoOff, MicOff, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCalmMode } from '@/context/CalmModeContext';

interface LiveSessionControlsProps {
  onEndStream?: () => void;
  onRetryConnection?: () => void;
  hasError?: boolean;
}

const LiveSessionControls: React.FC<LiveSessionControlsProps> = ({ 
  onEndStream, 
  onRetryConnection,
  hasError = false 
}) => {
  const { calmMode } = useCalmMode();
  
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
      <Button className="bg-red-500 hover:bg-red-600 rounded-full" onClick={onEndStream}>
        End Stream
      </Button>
    </div>
  );
};

export default LiveSessionControls;
