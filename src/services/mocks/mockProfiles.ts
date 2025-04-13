
import { ProfileData } from "@/types/profile";

// Mock profile data to use when database profile is not available
export const mockProfiles: Record<string, ProfileData> = {
  "f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8": {
    id: "f8f8f8f8-f8f8-f8f8-f8f8-f8f8f8f8f8f8",
    full_name: "Emma Watson",
    username: "emmawatson",
    avatar_url: "/placeholder.svg",
    location: "London, UK",
    bio: "Actress and activist passionate about gender equality. Looking to connect with like-minded individuals who enjoy literature, sustainable fashion, and humanitarian work. Always up for meaningful conversations about social justice and environmental issues.",
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
    bio: "Software Engineer by day, amateur chef by night. Looking for friends to join weekend hiking trips and food festivals. Passionate about new technologies and always excited to learn new programming languages. My wife and I love hosting game nights!",
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
    bio: "Graphic designer with a passion for art and creativity. Looking to connect with other artists and attend design workshops together. When I'm not designing, you'll find me at yoga classes or exploring new coffee shops with my husband James.",
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
    bio: "Marketing specialist who loves outdoor adventures and photography. Looking for friends to join surfing trips and beach volleyball games. My wife Jessica and I enjoy traveling and are always planning our next international trip!",
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
    bio: "Professional photographer with a passion for capturing life's beautiful moments. Looking to connect with people who appreciate art and culture. I enjoy visiting galleries, attending concerts, and trying new restaurants with my husband Michael.",
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
    bio: "Professional chef and food enthusiast. Looking to connect with fellow foodies who enjoy exploring new restaurants and cooking together. I host monthly supper clubs and am always experimenting with flavors from around the world.",
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
    bio: "Elementary school teacher who loves dancing, music, and travel. Looking for friends to attend salsa classes and live music events. I'm passionate about education and enjoy organizing cultural exchange programs for my students.",
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
    bio: "Architect with a passion for sustainable design and urban planning. Looking to connect with other professionals in creative fields. I enjoy cycling, playing guitar in a local band, and exploring historic buildings.",
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
    bio: "Physician specializing in family medicine. Outside of work, I'm passionate about fitness, nutrition, and preventative health. Looking for running buddies and friends to join me at community wellness events and farmers markets.",
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
    bio: "Professional musician and music teacher. Looking to collaborate with other artists and find friends who enjoy attending live concerts. I play multiple instruments and love discovering new music genres and cultural traditions.",
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
