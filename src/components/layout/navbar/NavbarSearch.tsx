
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const NavbarSearch = () => {
  return (
    <div className="hidden md:flex relative flex-1 max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-social-textSecondary" />
      </div>
      <Input
        type="search"
        placeholder="Search Lovaville..."
        className="pl-10 bg-social-gray rounded-full border-none"
      />
    </div>
  );
};

export default NavbarSearch;
