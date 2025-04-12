
import { useFriendSearch } from "@/hooks/useFriendSearch";
import SearchFilters from "@/components/friend-search/SearchFilters";
import SearchResults from "@/components/friend-search/SearchResults";
import MainLayout from "@/components/layout/MainLayout";

const FriendSearch = () => {
  const {
    searchTerm,
    setSearchTerm,
    gender,
    setGender,
    maritalStatus,
    setMaritalStatus,
    ageRange,
    setAgeRange,
    searchResults,
    isLoading,
  } = useFriendSearch();

  return (
    <MainLayout>
      <div className="social-card p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">Find Friends</h1>
        
        <SearchFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          gender={gender}
          setGender={setGender}
          maritalStatus={maritalStatus}
          setMaritalStatus={setMaritalStatus}
          ageRange={ageRange}
          setAgeRange={setAgeRange}
        />
      </div>
      
      <SearchResults
        searchResults={searchResults}
        isLoading={isLoading}
        searchTerm={searchTerm}
        gender={gender}
        maritalStatus={maritalStatus}
        ageRange={ageRange}
      />
    </MainLayout>
  );
};

export default FriendSearch;
