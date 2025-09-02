import { Star } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Vouch } from "@/types/vouch";

type VouchCardProps = {
  vouch: Vouch;
};

const VouchCard = ({ vouch }: VouchCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="font-medium">{vouch.reviewer.name}</div>
            <div className="text-sm text-gray-500">
              {new Date(vouch.created_at).toLocaleDateString()}
            </div>
          </div>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= vouch.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>{vouch.content}</p>
      </CardContent>
    </Card>
  );
};

export default VouchCard;