import VouchCard from "./VouchCard";
import { Vouch } from "@/types/vouch";

type VouchListProps = {
  vouches: Vouch[];
};

const VouchList = ({ vouches }: VouchListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Vouches</h3>
      {vouches.length === 0 ? (
        <p className="text-gray-500">No vouches yet.</p>
      ) : (
        vouches.map((vouch) => (
          <VouchCard key={vouch.id} vouch={vouch} />
        ))
      )}
    </div>
  );
};

export default VouchList;