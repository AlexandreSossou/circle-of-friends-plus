
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";

interface ProfileBioProps {
  bio?: string;
  isOwnProfile: boolean;
  isEditing: boolean;
  editedBio: string;
  onEditClick: () => void;
  onBioChange: (value: string) => void;
}

const ProfileBio = ({ 
  bio, 
  isOwnProfile, 
  isEditing, 
  editedBio, 
  onEditClick, 
  onBioChange 
}: ProfileBioProps) => {
  if (isEditing) {
    return (
      <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-2">About Me</h2>
        <Textarea 
          placeholder="Tell us about yourself"
          value={editedBio}
          onChange={(e) => onBioChange(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    );
  }

  if (bio) {
    return (
      <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-2">About Me</h2>
        <p className="text-gray-700 whitespace-pre-line">{bio}</p>
      </div>
    );
  }

  if (isOwnProfile) {
    return (
      <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200 border-dashed text-center">
        <h2 className="text-lg font-semibold mb-2">About Me</h2>
        <p className="text-gray-500 mb-3">Add a description to tell people more about yourself and what you're looking for.</p>
        <Button variant="outline" className="mx-auto" onClick={onEditClick}>
          <Edit className="w-4 h-4 mr-2" />
          Add Description
        </Button>
      </div>
    );
  }

  return null;
};

export default ProfileBio;
