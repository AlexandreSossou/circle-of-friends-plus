
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CameraIcon, Edit, MapPin, MessageCircle, UserPlus } from "lucide-react";
import WinkButton from "./WinkButton";

type ProfileHeaderProps = {
  profileData: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    location: string | null;
    bio: string | null;
    gender: string | null;
    age: number | null;
    marital_status: string | null;
    partner_id: string | null;
    partner?: {
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  };
  isOwnProfile: boolean;
  handleAddFriend: () => void;
}

const ProfileHeader = ({ profileData, isOwnProfile, handleAddFriend }: ProfileHeaderProps) => {
  return (
    <div className="relative">
      <div className="h-48 md:h-64 lg:h-80 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg overflow-hidden relative">
        <img
          src="https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=1000"
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {isOwnProfile && (
          <div className="absolute bottom-4 right-4">
            <Button variant="secondary" size="sm" className="flex items-center gap-1">
              <CameraIcon className="w-4 h-4" />
              <span>Edit Cover</span>
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 pt-0 md:pt-0">
        <div className="flex flex-col md:flex-row md:items-end -mt-16 md:-mt-20 mb-4 md:mb-6 gap-4 md:gap-6">
          <div className="relative z-10">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white overflow-hidden">
              <img
                src={profileData?.avatar_url || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            {isOwnProfile && (
              <Button 
                variant="secondary" 
                size="icon"
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white"
              >
                <CameraIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{profileData?.full_name}</h1>
              
              <div className="flex flex-col space-y-1 mt-1">
                {profileData?.location && (
                  <p className="text-social-textSecondary flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profileData.location}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-x-4 text-social-textSecondary text-sm">
                  {profileData?.age && (
                    <span className="flex items-center">
                      <span className="font-medium mr-1">Age:</span> {profileData.age}
                    </span>
                  )}
                  
                  {profileData?.gender && (
                    <span className="flex items-center">
                      <span className="font-medium mr-1">Gender:</span> {profileData.gender}
                    </span>
                  )}
                  
                  {profileData?.marital_status && (
                    <span className="flex items-center">
                      <span className="font-medium mr-1">Status:</span> {profileData.marital_status}
                      {profileData.partner && profileData.partner_id && (
                        <span className="ml-1">
                          to <Link 
                              to={`/profile/${profileData.partner_id}`} 
                              className="text-social-blue hover:underline font-medium"
                            >
                              {profileData.partner.full_name}
                            </Link>
                        </span>
                      )}
                    </span>
                  )}
                </div>
                
                <p className="text-social-textSecondary">568 friends</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isOwnProfile && (
                <div className="flex flex-col gap-2">
                  <Button 
                    className="bg-social-blue hover:bg-social-darkblue" 
                    onClick={handleAddFriend}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                  <div className="flex gap-2">
                    <Link to={`/messages?recipient=${profileData.id}`}>
                      <Button variant="outline">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                    <WinkButton recipientId={profileData.id} />
                  </div>
                </div>
              )}
              
              {isOwnProfile && (
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
