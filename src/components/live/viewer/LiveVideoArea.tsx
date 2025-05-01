
import React from 'react';
import { Video } from 'lucide-react';
import LiveSessionControls from './LiveSessionControls';

interface LiveVideoAreaProps {
  isHost?: boolean;
  onEndStream?: () => void;
}

const LiveVideoArea: React.FC<LiveVideoAreaProps> = ({ isHost = false, onEndStream }) => {
  return (
    <div className="w-full bg-black relative flex items-center justify-center">
      {/* Placeholder for video */}
      <div className="text-center text-white">
        <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-medium">Live Session Demo</h3>
        <p className="text-gray-400 mt-2">
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
