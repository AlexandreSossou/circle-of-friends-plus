
import React from 'react';
import { VideoOff, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LiveSessionControlsProps {
  onEndStream?: () => void;
}

const LiveSessionControls: React.FC<LiveSessionControlsProps> = ({ onEndStream }) => {
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
