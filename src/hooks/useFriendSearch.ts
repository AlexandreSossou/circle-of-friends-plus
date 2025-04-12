
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchFilters {
  searchTerm: string;
  gender: string | undefined;
  maritalStatus: string | undefined;
  ageRange: [number, number];
}

export const useFriendSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [maritalStatus, setMaritalStatus] = useState<string | undefined>(undefined);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 80]);
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
    queryKey: ["friendSearch", searchTerm, gender, maritalStatus, ageRange],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("full_name", { ascending: true });

      if (searchTerm) {
        query = query.ilike("full_name", `%${searchTerm}%`);
      }

      if (gender) {
        query = query.eq("gender", gender);
      }

      if (maritalStatus) {
        query = query.eq("marital_status", maritalStatus);
      }

      // Enforce the age restriction in the query as well
      const minAge = currentUserAge && currentUserAge > 40 ? Math.max(22, ageRange[0]) : ageRange[0];
      if (minAge > 18 || ageRange[1] < 80) {
        query = query.gte("age", minAge).lte("age", ageRange[1]);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching friends:", error);
        return [];
      }

      return data || [];
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
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
  };
};
