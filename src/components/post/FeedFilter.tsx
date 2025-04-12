
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Globe } from "lucide-react";

export type FeedType = "connections" | "global";

interface FeedFilterProps {
  activeFeed: FeedType;
  onFeedChange: (feed: FeedType) => void;
}

const FeedFilter = ({ activeFeed, onFeedChange }: FeedFilterProps) => {
  return (
    <div className="social-card p-3 mb-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Your Feed</h2>
        <div className="flex space-x-2">
          <Button
            variant={activeFeed === "connections" ? "default" : "outline"}
            size="sm"
            onClick={() => onFeedChange("connections")}
            className="flex items-center"
          >
            <Users className="w-4 h-4 mr-2" />
            Connections
          </Button>
          <Button
            variant={activeFeed === "global" ? "default" : "outline"}
            size="sm"
            onClick={() => onFeedChange("global")}
            className="flex items-center"
          >
            <Globe className="w-4 h-4 mr-2" />
            Global
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedFilter;
