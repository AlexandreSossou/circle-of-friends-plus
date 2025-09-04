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
    relationshipStatus,
    setRelationshipStatus,
    ageRange,
    setAgeRange,
    location,
    setLocation,
    usaSearch,
    setUsaSearch,
    usaState,
    setUsaState,
    milesRange,
    setMilesRange,
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
          relationshipStatus={relationshipStatus}
          setRelationshipStatus={setRelationshipStatus}
          ageRange={ageRange}
          setAgeRange={setAgeRange}
          location={location}
          setLocation={setLocation}
          usaSearch={usaSearch}
          setUsaSearch={setUsaSearch}
          usaState={usaState}
          setUsaState={setUsaState}
          milesRange={milesRange}
          setMilesRange={setMilesRange}
        />
      </div>
      
      <SearchResults
        searchResults={searchResults}
        isLoading={isLoading}
        searchTerm={searchTerm}
        gender={gender}
        relationshipStatus={relationshipStatus}
        ageRange={ageRange}
        location={usaSearch ? usaState : location}
      />
    </MainLayout>
  );
};

export default FriendSearch;