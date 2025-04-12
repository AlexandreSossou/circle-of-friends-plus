
const ProfileLoading = () => {
  return (
    <div className="social-card p-6 animate-pulse">
      <div className="h-48 md:h-64 bg-gray-200 rounded-t-lg"></div>
      <div className="flex flex-col md:flex-row md:items-end -mt-16 md:-mt-20 mb-4 md:mb-6 gap-4 md:gap-6">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-300 border-4 border-white"></div>
        <div className="flex-1">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/5"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileLoading;
