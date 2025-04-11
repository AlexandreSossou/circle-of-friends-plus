
import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const yourGroups = [
    { 
      id: "group-1", 
      name: "Tech Enthusiasts", 
      avatar: "/placeholder.svg", 
      initials: "TE", 
      members: 542,
      category: "Technology",
      isAdmin: true
    },
    { 
      id: "group-2", 
      name: "Travel Bugs", 
      avatar: "/placeholder.svg", 
      initials: "TB", 
      members: 1023,
      category: "Travel",
      isAdmin: false
    },
    { 
      id: "group-3", 
      name: "Cooking Masters", 
      avatar: "/placeholder.svg", 
      initials: "CM", 
      members: 327,
      category: "Food",
      isAdmin: false
    }
  ];
  
  const suggestedGroups = [
    { 
      id: "group-4", 
      name: "Photography Club", 
      avatar: "/placeholder.svg", 
      initials: "PC", 
      members: 823,
      category: "Photography"
    },
    { 
      id: "group-5", 
      name: "Book Readers", 
      avatar: "/placeholder.svg", 
      initials: "BR", 
      members: 612,
      category: "Books"
    },
    { 
      id: "group-6", 
      name: "Fitness Motivation", 
      avatar: "/placeholder.svg", 
      initials: "FM", 
      members: 1548,
      category: "Fitness"
    },
    { 
      id: "group-7", 
      name: "Gaming Community", 
      avatar: "/placeholder.svg", 
      initials: "GC", 
      members: 2356,
      category: "Gaming"
    }
  ];
  
  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreatingGroup(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsCreatingGroup(false);
      setNewGroupName("");
      setNewGroupDescription("");
      setDialogOpen(false);
      
      toast({
        title: "Group created",
        description: `Your group "${newGroupName}" has been created successfully`,
      });
    }, 1000);
  };
  
  const handleJoinGroup = (groupId: string, groupName: string) => {
    toast({
      title: "Group joined",
      description: `You have successfully joined "${groupName}"`,
    });
  };
  
  const filteredGroups = yourGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <MainLayout>
      <div className="social-card p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Groups</h1>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-social-blue hover:bg-social-darkblue">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create new group</DialogTitle>
                <DialogDescription>
                  Create a new group to connect with people who share your interests.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="groupName" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="groupName"
                    placeholder="Group name"
                    className="col-span-3"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="groupDescription" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="groupDescription"
                    placeholder="Group description"
                    className="col-span-3"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateGroup} 
                  disabled={isCreatingGroup}
                  className="bg-social-blue hover:bg-social-darkblue"
                >
                  {isCreatingGroup ? "Creating..." : "Create Group"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="your-groups">
          <TabsList className="mb-6">
            <TabsTrigger value="your-groups">Your Groups</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>
          
          <TabsContent value="your-groups">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search your groups..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGroups.map((group) => (
                  <div key={group.id} className="social-card p-4">
                    <Link to={`/groups/${group.id}`} className="flex items-center">
                      <Avatar className="w-16 h-16 mr-4">
                        <AvatarImage src={group.avatar} alt={group.name} />
                        <AvatarFallback>{group.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-lg">{group.name}</h3>
                        <p className="text-sm text-social-textSecondary">{group.category}</p>
                        <div className="flex items-center mt-1 text-xs text-social-textSecondary">
                          <Users className="w-3 h-3 mr-1" />
                          <span>{group.members} members</span>
                          {group.isAdmin && (
                            <span className="ml-3 px-2 py-0.5 bg-social-blue text-white rounded-full text-xs">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-social-textSecondary">
                <p>No groups match your search.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="discover">
            <h3 className="font-semibold text-lg mb-4">Suggested Groups</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedGroups.map((group) => (
                <div key={group.id} className="social-card p-4">
                  <div className="flex items-center justify-between">
                    <Link to={`/groups/${group.id}`} className="flex items-center flex-1">
                      <Avatar className="w-16 h-16 mr-4">
                        <AvatarImage src={group.avatar} alt={group.name} />
                        <AvatarFallback>{group.initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-lg">{group.name}</h3>
                        <p className="text-sm text-social-textSecondary">{group.category}</p>
                        <div className="flex items-center mt-1 text-xs text-social-textSecondary">
                          <Users className="w-3 h-3 mr-1" />
                          <span>{group.members} members</span>
                        </div>
                      </div>
                    </Link>
                    <Button
                      onClick={() => handleJoinGroup(group.id, group.name)}
                      className="bg-social-blue hover:bg-social-darkblue"
                    >
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Groups;
