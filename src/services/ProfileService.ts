import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";

// Mock profile data to use when database profile is not available
export const mockProfiles: Record<string, ProfileData> = {
  "f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8": {
    id: "f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8",
    full_name: "Emma Watson",
    username: "emmawatson",
    avatar_url: "/placeholder.svg",
    location: "London, UK",
    bio: "Actress and activist",
    gender: "Female",
    age: 33,
    marital_status: "Single",
    partner_id: null
  },
  "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1": {
    id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    full_name: "James Smith",
    username: "jamessmith",
    avatar_url: "/placeholder.svg",
    location: "New York, USA",
    bio: "Software Engineer",
    gender: "Male",
    age: 28,
    marital_status: "Married",
    partner_id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    partner: {
      full_name: "Sarah Johnson",
      avatar_url: "/placeholder.svg"
    }
  },
  "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2": {
    id: "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2",
    full_name: "Sarah Johnson",
    username: "sarahjohnson",
    avatar_url: "/placeholder.svg",
    location: "Toronto, Canada",
    bio: "Graphic Designer",
    gender: "Female",
    age: 31,
    marital_status: "Married",
    partner_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1",
    partner: {
      full_name: "James Smith",
      avatar_url: "/placeholder.svg"
    }
  },
  "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3": {
    id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    full_name: "Michael Brown",
    username: "michaelbrown",
    avatar_url: "/placeholder.svg",
    location: "Sydney, Australia",
    bio: "Marketing Specialist",
    gender: "Male",
    age: 35,
    marital_status: "Married",
    partner_id: "d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4",
    partner: {
      full_name: "Jessica Taylor",
      avatar_url: "/placeholder.svg"
    }
  },
  "d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4": {
    id: "d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4",
    full_name: "Jessica Taylor",
    username: "jessicataylor",
    avatar_url: "/placeholder.svg",
    location: "Paris, France",
    bio: "Photographer",
    gender: "Female",
    age: 29,
    marital_status: "Married",
    partner_id: "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3",
    partner: {
      full_name: "Michael Brown",
      avatar_url: "/placeholder.svg"
    }
  },
  "e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5": {
    id: "e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5",
    full_name: "David Lee",
    username: "davidlee",
    avatar_url: "/placeholder.svg",
    location: "Berlin, Germany",
    bio: "Chef",
    gender: "Male",
    age: 34,
    marital_status: "Single",
    partner_id: null
  },
  "aa1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d": {
    id: "aa1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    full_name: "Olivia Martinez",
    username: "oliviamartinez",
    avatar_url: "/placeholder.svg",
    location: "Madrid, Spain",
    bio: "Teacher",
    gender: "Female",
    age: 27,
    marital_status: "Single",
    partner_id: null
  },
  "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e": {
    id: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    full_name: "Ryan Cooper",
    username: "ryancooper",
    avatar_url: "/placeholder.svg",
    location: "Dublin, Ireland",
    bio: "Architect",
    gender: "Male",
    age: 32,
    marital_status: "Married",
    partner_id: null
  },
  "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f": {
    id: "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    full_name: "Sophia Anderson",
    username: "sophiaanderson",
    avatar_url: "/placeholder.svg",
    location: "Amsterdam, Netherlands",
    bio: "Doctor",
    gender: "Female",
    age: 36,
    marital_status: "Single",
    partner_id: null
  },
  "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a": {
    id: "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
    full_name: "Christopher Wilson",
    username: "christopherwilson",
    avatar_url: "/placeholder.svg",
    location: "Stockholm, Sweden",
    bio: "Musician",
    gender: "Male",
    age: 30,
    marital_status: "In a relationship",
    partner_id: null
  }
};

// Mock posts for when database posts aren't available
export const mockPostsByUser: Record<string, any[]> = {
  "f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8": [
    { id: "post-1", content: "Just finished filming a new project!", created_at: new Date().toISOString() }
  ],
  "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1": [
    { id: "post-2", content: "Learning a new programming language today", created_at: new Date().toISOString() }
  ],
  "b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2": [
    { id: "post-3", content: "Created a new logo for a client", created_at: new Date().toISOString() }
  ],
  "c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3": [
    { id: "post-4", content: "Just launched a successful marketing campaign", created_at: new Date().toISOString() }
  ],
  "d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4": [
    { id: "post-5", content: "Check out my new photography portfolio", created_at: new Date().toISOString() }
  ]
};

export const fetchProfileData = async (profileId: string | undefined): Promise<ProfileData | null> => {
  if (!profileId) return null;

  // First try to get the profile from the database
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (error) {
      console.log("Error fetching profile from database:", error.message);
      console.log("Falling back to mock profile data");
      
      // If we have mock data for this profile ID, use it
      if (mockProfiles[profileId]) {
        return mockProfiles[profileId];
      }
      return null;
    }

    if (data.partner_id) {
      try {
        const { data: partnerData, error: partnerError } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", data.partner_id)
          .single();

        if (!partnerError) {
          return {
            ...data,
            partner: partnerData
          } as ProfileData;
        }
      } catch (e) {
        console.error("Error fetching partner data:", e);
      }
    }

    return data as ProfileData;
  } catch (e) {
    console.error("Unexpected error fetching profile:", e);
    
    // Fallback to mock data
    if (mockProfiles[profileId]) {
      return mockProfiles[profileId];
    }
    return null;
  }
};

export const fetchProfilePosts = async (profileId: string | undefined): Promise<any[]> => {
  if (!profileId) return [];

  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Error fetching posts from database:", error.message);
      console.log("Falling back to mock post data");
      
      // If we have mock data for this profile ID, use it
      if (mockPostsByUser[profileId]) {
        return mockPostsByUser[profileId];
      }
      return [];
    }

    return data || [];
  } catch (e) {
    console.error("Unexpected error fetching posts:", e);
    
    // Fallback to mock data
    if (mockPostsByUser[profileId]) {
      return mockPostsByUser[profileId];
    }
    return [];
  }
};
