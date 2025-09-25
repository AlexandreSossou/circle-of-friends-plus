

interface ProfileAvatarProps {
  avatarUrl: string;
  isOwnProfile: boolean;
  libido?: string;
}

// Utility function to check if URL is a video file
const isVideoFile = (url: string): boolean => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

const ProfileAvatar = ({ avatarUrl, isOwnProfile, libido }: ProfileAvatarProps) => {

  return (
    <div className="absolute top-28 md:top-32 lg:top-40 left-4 md:left-6 z-10">
      <div className="w-28 h-36 md:w-36 md:h-48 rounded-lg border-4 border-white bg-white overflow-hidden shadow-md">
        {isVideoFile(avatarUrl) ? (
          <video
            src={avatarUrl}
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onLoadedData={(e) => {
              // Play video on user interaction to avoid browser darkening
              const video = e.target as HTMLVideoElement;
              const playVideo = () => {
                video.play().catch(console.warn);
                document.removeEventListener('click', playVideo);
                document.removeEventListener('scroll', playVideo);
              };
              document.addEventListener('click', playVideo, { once: true });
              document.addEventListener('scroll', playVideo, { once: true });
            }}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={avatarUrl || "/placeholder.svg"}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        )}
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
