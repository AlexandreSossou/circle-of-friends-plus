
import React from 'react';
import { Link } from 'react-router-dom';
import { Video } from 'lucide-react';
import { LiveSession } from './LiveSessionCard';
import LiveSessionMiniature from './LiveSessionMiniature';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from '@/components/ui/carousel';
import { useCalmMode } from '@/context/CalmModeContext';

interface LiveSessionsCarouselProps {
  sessions: LiveSession[];
}

const LiveSessionsCarousel: React.FC<LiveSessionsCarouselProps> = ({ sessions }) => {
  const { calmMode } = useCalmMode();
  
  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className={`social-card p-4 mb-4 ${calmMode ? 'bg-calm-card border-calm-border' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Video className={`h-5 w-5 mr-2 ${calmMode ? 'text-red-400' : 'text-social-red'}`} />
          <h2 className={`text-lg font-semibold ${calmMode ? 'text-calm-text' : ''}`}>Live Now</h2>
        </div>
        <Link to="/live-sessions" className={`text-sm ${calmMode ? 'text-calm-primary' : 'text-social-blue'}`}>
          See all
        </Link>
      </div>
      
      <Carousel className="w-full">
        <CarouselContent className="-ml-2 md:-ml-4">
          {sessions.map((session) => (
            <CarouselItem key={session.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
              <LiveSessionMiniature session={session} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};

export default LiveSessionsCarousel;
