
import { PostData } from "@/types/post";

// Get demo post data
export const getDemoPostData = (): PostData[] => {
  return [
    {
      id: "post-1",
      author: {
        id: "user-1",
        name: "Jane Smith",
        avatar: "/placeholder.svg",
        initials: "JS"
      },
      content: "Just finished a wonderful hike in the mountains! The views were absolutely breathtaking and the weather was perfect.",
      image: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=1000",
      timestamp: "2 hours ago",
      likes: 24,
      comments: [
        {
          id: "comment-1",
          author: {
            id: "user-3",
            name: "Michael Johnson",
            avatar: "/placeholder.svg",
            initials: "MJ"
          },
          content: "That looks amazing! Where is this?",
          timestamp: "1 hour ago"
        }
      ],
      liked: false
    },
    {
      id: "post-2",
      author: {
        id: "user-2",
        name: "Alex Williams",
        avatar: "/placeholder.svg",
        initials: "AW"
      },
      content: "I'm so excited to announce that I've started a new position as Senior Software Developer at TechCorp! Looking forward to this new chapter in my career.",
      timestamp: "5 hours ago",
      likes: 42,
      comments: [
        {
          id: "comment-2",
          author: {
            id: "user-4",
            name: "Sarah Davis",
            avatar: "/placeholder.svg",
            initials: "SD"
          },
          content: "Congratulations! They're lucky to have you!",
          timestamp: "4 hours ago"
        },
        {
          id: "comment-3",
          author: {
            id: "user-5",
            name: "David Wilson",
            avatar: "/placeholder.svg",
            initials: "DW"
          },
          content: "Amazing news! Let's catch up soon!",
          timestamp: "3 hours ago"
        }
      ],
      liked: true
    },
    {
      id: "post-3",
      author: {
        id: "group-1",
        name: "Tech Enthusiasts",
        avatar: "/placeholder.svg",
        initials: "TE"
      },
      content: "Our next virtual meetup will be on Friday at 7 PM EST. We'll be discussing the latest AI developments and their implications for the tech industry. Don't miss it!",
      timestamp: "Yesterday",
      likes: 15,
      comments: [],
      liked: false
    }
  ];
};
