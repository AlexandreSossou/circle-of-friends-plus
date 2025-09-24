

interface ProfileAvatarProps {
  avatarUrl: string;
  isOwnProfile: boolean;
  libido?: string;
}

const ProfileAvatar = ({ avatarUrl, isOwnProfile, libido }: ProfileAvatarProps) => {

  return (
    <div className="absolute top-28 md:top-32 lg:top-40 left-4 md:left-6 z-10">
      <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white bg-white overflow-hidden shadow-md">
        <img
          src={avatarUrl || "/placeholder.svg"}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      {libido && (
        <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
          <span className="text-lg">{libido}</span>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
