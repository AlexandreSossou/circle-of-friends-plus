
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
  // Adding 10 new users with different relationship statuses and demographics
  "abcd1234-5678-90ab-cdef-1234567890ab": {
    id: "abcd1234-5678-90ab-cdef-1234567890ab",
    full_name: "Alex Johnson",
    username: "alexjohnson",
    avatar_url: "/placeholder.svg",
    location: "Chicago, USA",
    bio: "Tech entrepreneur passionate about AI and machine learning. Looking to connect with other innovators and thought leaders.",
    gender: "Male",
    age: 29,
    marital_status: "Single",
    partner_id: null
  },
  "bcde2345-6789-01bc-defg-2345678901bc": {
    id: "bcde2345-6789-01bc-defg-2345678901bc",
    full_name: "Sophia Rodriguez",
    username: "sophiarodriguez",
    avatar_url: "/placeholder.svg",
    location: "Barcelona, Spain",
    bio: "Travel blogger with a passion for sustainable tourism. Looking to connect with eco-conscious travelers and local guides.",
    gender: "Female",
    age: 27,
    marital_status: "Single",
    partner_id: null
  },
  "cdef3456-7890-12cd-efgh-3456789012cd": {
    id: "cdef3456-7890-12cd-efgh-3456789012cd",
    full_name: "Liam Chen",
    username: "liamchen",
    avatar_url: "/placeholder.svg",
    location: "Vancouver, Canada",
    bio: "Product designer working in the sustainability space. Interested in connecting with others in tech for good.",
    gender: "Male",
    age: 31,
    marital_status: "Single",
    partner_id: null
  },
  "defg4567-8901-23de-fghi-4567890123de": {
    id: "defg4567-8901-23de-fghi-4567890123de",
    full_name: "Maya Patel",
    username: "mayapatel",
    avatar_url: "/placeholder.svg",
    location: "Mumbai, India",
    bio: "Neuroscientist and science communicator. Always looking to discuss latest research and connect with fellow academics.",
    gender: "Female",
    age: 34,
    marital_status: "Single",
    partner_id: null
  },
  "efgh5678-9012-34ef-ghij-5678901234ef": {
    id: "efgh5678-9012-34ef-ghij-5678901234ef",
    full_name: "Noah Williams",
    username: "noahwilliams",
    avatar_url: "/placeholder.svg",
    location: "Melbourne, Australia",
    bio: "Music producer and sound engineer. Looking to collaborate with musicians and artists from diverse backgrounds.",
    gender: "Male",
    age: 30,
    marital_status: "Single",
    partner_id: null
  },
  "fghi6789-0123-45fg-hijk-6789012345fg": {
    id: "fghi6789-0123-45fg-hijk-6789012345fg",
    full_name: "Isabella Martinez",
    username: "isabellamartinez",
    avatar_url: "/placeholder.svg",
    location: "Mexico City, Mexico",
    bio: "Environmental engineer specializing in renewable energy. Passionate about sustainable urban development.",
    gender: "Female",
    age: 32,
    marital_status: "Single",
    partner_id: null
  },
  "ghij7890-1234-56gh-ijkl-7890123456gh": {
    id: "ghij7890-1234-56gh-ijkl-7890123456gh",
    full_name: "Ethan Kim",
    username: "ethankim",
    avatar_url: "/placeholder.svg",
    location: "Seoul, South Korea",
    bio: "Game developer and esports enthusiast. Looking to connect with fellow gamers and industry professionals.",
    gender: "Male",
    age: 26,
    marital_status: "Single",
    partner_id: null
  },
  "hijk8901-2345-67hi-jklm-8901234567hi": {
    id: "hijk8901-2345-67hi-jklm-8901234567hi",
    full_name: "Zoe Thompson",
    username: "zoethompson",
    avatar_url: "/placeholder.svg",
    location: "Cape Town, South Africa",
    bio: "Marine biologist studying ocean conservation. Passionate about scuba diving and protecting marine ecosystems.",
    gender: "Female",
    age: 33,
    marital_status: "Single",
    partner_id: null
  },
  "ijkl9012-3456-78ij-klmn-9012345678ij": {
    id: "ijkl9012-3456-78ij-klmn-9012345678ij",
    full_name: "Lucas Ferreira",
    username: "lucasferreira",
    avatar_url: "/placeholder.svg",
    location: "Rio de Janeiro, Brazil",
    bio: "Architect specializing in sustainable urban design. Looking to connect with professionals in related fields.",
    gender: "Male",
    age: 35,
    marital_status: "Single",
    partner_id: null
  },
  "jklm0123-4567-89jk-lmno-0123456789jk": {
    id: "jklm0123-4567-89jk-lmno-0123456789jk",
    full_name: "Amara Okafor",
    username: "amaraokafor",
    avatar_url: "/placeholder.svg",
    location: "Lagos, Nigeria",
    bio: "Fintech entrepreneur working on financial inclusion. Passionate about blockchain technology and its applications.",
    gender: "Female",
    age: 28,
    marital_status: "Single",
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
