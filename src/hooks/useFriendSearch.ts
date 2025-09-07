import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchFilters {
  searchTerm: string;
  gender: string[];
  relationshipStatus: string[];
  ageRange: [number, number];
  location: string;
  usaSearch: boolean;
  usaState: string;
  milesRange: number;
}

export const useFriendSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gender, setGender] = useState<string[]>([]);
  const [relationshipStatus, setRelationshipStatus] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 80]);
  const [location, setLocation] = useState("");
  const [usaSearch, setUsaSearch] = useState(false);
  const [usaState, setUsaState] = useState("");
  const [milesRange, setMilesRange] = useState(50);
  const [currentUserAge, setCurrentUserAge] = useState<number | null>(null);

  useEffect(() => {
    const fetchCurrentUserAge = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("age")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setCurrentUserAge(data.age);
        }
      }
    };
    
    fetchCurrentUserAge();
  }, []);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["friendSearch", searchTerm, gender, relationshipStatus, ageRange, location, usaSearch, usaState, milesRange],
    queryFn: async () => {
      // Get current user to exclude from results
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Use the secure function to get profiles
      const { data: profiles, error } = await supabase.rpc('get_safe_profiles_list');

      if (error) {
        console.error("Error fetching profiles:", error);
        return [];
      }

      if (!profiles) return [];

      // Fetch partner data for users in relationships
      const profilesWithPartners = await Promise.all(
        profiles.map(async (profile) => {
          if (profile.marital_status === 'Couple / Married' || profile.marital_status === 'Open Relationship' || profile.marital_status === 'Polyamorous') {
            try {
              let partners = [];
              
              // For polyamorous users, fetch all partners
              if (profile.marital_status === 'Polyamorous' && profile.partners && profile.partners.length > 0) {
                const partnerPromises = profile.partners.map(async (partnerId: string) => {
                  const { data: partnerData } = await supabase.rpc('get_safe_profile', { profile_id: partnerId });
                  return partnerData && partnerData.length > 0 ? partnerData[0] : null;
                });
                const partnerResults = await Promise.all(partnerPromises);
                partners = partnerResults.filter(p => p !== null);
              }
              // For other relationship types, fetch single partner
              else if (profile.partner_id) {
                const { data: partnerData } = await supabase.rpc('get_safe_profile', { profile_id: profile.partner_id });
                if (partnerData && partnerData.length > 0) {
                  partners = [partnerData[0]];
                }
              }
              
              if (partners.length > 0) {
                return {
                  ...profile,
                  partners: partners
                };
              }
            } catch (e) {
              console.error("Error fetching partner data:", e);
            }
          }
          return profile;
        })
      );

      // Filter results based on search criteria
      let filteredProfiles = profilesWithPartners.filter(profile => {
        // Exclude current user and banned users
        if (profile.id === user.id || profile.is_banned) return false;

        // Search term filter
        if (searchTerm && !profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }

        // Gender filter
        if (gender.length > 0 && !gender.includes(profile.gender || '')) return false;

        // Relationship status filter
        if (relationshipStatus.length > 0 && !relationshipStatus.includes(profile.marital_status || '')) return false;

        // Location filter
        if (usaSearch && usaState) {
          if (!profile.location?.toLowerCase().includes(usaState.toLowerCase())) return false;
        } else if (location && !usaSearch) {
          if (!profile.location?.toLowerCase().includes(location.toLowerCase())) return false;
        }

        // Age filter
        const minAge = currentUserAge && currentUserAge > 40 ? Math.max(22, ageRange[0]) : ageRange[0];
        if (profile.age && (profile.age < minAge || profile.age > ageRange[1])) return false;

        return true;
      });

      // Sort by full name
      filteredProfiles.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));

      return filteredProfiles;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
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
  };
};