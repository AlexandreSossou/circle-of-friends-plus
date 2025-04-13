
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CameraIcon, Edit, MapPin, MessageCircle, UserPlus, X } from "lucide-react";
import WinkButton from "./WinkButton";
import { ProfileData } from "@/types/profile";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

type ProfileHeaderProps = {
  profileData: ProfileData;
  isOwnProfile: boolean;
  handleAddFriend: () => void;
}

const ProfileHeader = ({ profileData, isOwnProfile, handleAddFriend }: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(profileData?.bio || "");
  const [editedLocation, setEditedLocation] = useState(profileData?.location || "");
  const { toast } = useToast();

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedBio(profileData?.bio || "");
    setEditedLocation(profileData?.location || "");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = () => {
    // In a real implementation, this would save to the database
    // For now, just show a toast notification
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  return (
    <div className="relative">
      {/* Cover photo section with reduced height */}
      <div className="h-40 md:h-56 lg:h-64 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-lg overflow-hidden relative">
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

      <div className="p-4 md:p-6 pt-16 md:pt-20">
        <div className="flex flex-col md:flex-row md:items-end mb-4 md:mb-6 gap-4 md:gap-6">
          {/* Profile avatar positioned higher to overlap with cover photo */}
          <div className="absolute top-28 md:top-32 lg:top-40 left-4 md:left-6 z-10">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
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
          
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 ml-32 md:ml-40">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{profileData?.full_name}</h1>
              
              <div className="flex flex-col space-y-1 mt-1">
                {!isEditing && profileData?.location && (
                  <p className="text-social-textSecondary flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {profileData.location}
                  </p>
                )}
                
                {isEditing && (
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4" />
                    <Input 
                      value={editedLocation}
                      onChange={(e) => setEditedLocation(e.target.value)}
                      placeholder="Your location"
                      className="w-full max-w-xs h-8"
                    />
                  </div>
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
              
              {isOwnProfile && !isEditing && (
                <Button variant="outline" onClick={handleEditClick}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
              
              {isOwnProfile && isEditing && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile description/bio section */}
        {!isEditing && profileData?.bio && (
          <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-2">About Me</h2>
            <p className="text-gray-700 whitespace-pre-line">{profileData.bio}</p>
          </div>
        )}
        
        {isEditing && (
          <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-2">About Me</h2>
            <Textarea 
              placeholder="Tell us about yourself"
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        )}
        
        {isOwnProfile && !isEditing && !profileData?.bio && (
          <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200 border-dashed text-center">
            <h2 className="text-lg font-semibold mb-2">About Me</h2>
            <p className="text-gray-500 mb-3">Add a description to tell people more about yourself and what you're looking for.</p>
            <Button variant="outline" className="mx-auto" onClick={handleEditClick}>
              <Edit className="w-4 h-4 mr-2" />
              Add Description
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
