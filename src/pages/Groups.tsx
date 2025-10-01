import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Users, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useGroups } from "@/hooks/useGroups";
import { GroupFormData } from "@/types/group";

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    description: "",
    category: "general",
    is_public: true,
    join_policy: "open",
    allowed_genders: null
  });
  const { toast } = useToast();
  
  const {
    userGroups,
    publicGroups,
    isLoadingUserGroups,
    isLoadingPublicGroups,
    createGroupMutation,
    joinGroupMutation,
  } = useGroups();
  
  const categories = [
    "General", "Technology", "Travel", "Books", "Photography", 
    "Fitness", "Gaming", "Food", "Music", "Art", "Sports"
  ];

  const genderOptions = [
    "Man", "Woman", "Trans man", "Trans woman", "Non-binary", 
    "Genderfluid", "Agender", "Genderqueer", "Trav (Male Cross-Dresser)"
  ];
  
  const handleCreateGroup = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive"
      });
      return;
    }
    
    createGroupMutation.mutate(formData, {
      onSuccess: () => {
        setFormData({
          name: "",
          description: "",
          category: "general",
          is_public: true,
          join_policy: "open",
          allowed_genders: null
        });
        setDialogOpen(false);
      }
    });
  };
  
  const handleGenderToggle = (gender: string, checked: boolean) => {
    setFormData(prev => {
      const currentGenders = prev.allowed_genders || [];
      if (checked) {
        return { ...prev, allowed_genders: [...currentGenders, gender] };
      } else {
        return { ...prev, allowed_genders: currentGenders.filter(g => g !== gender) };
      }
    });
  };

  const handleJoinGroup = (groupId: string, groupName: string) => {
    joinGroupMutation.mutate(groupId);
  };
  
  const filteredGroups = userGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getGroupInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };
  
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
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="groupCategory" className="text-right">
                    Category
                  </Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.toLowerCase()} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="groupPublic" className="text-right">
                    Public
                  </Label>
                  <Switch
                    id="groupPublic"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="joinPolicy" className="text-right">
                    Join Policy
                  </Label>
                  <Select value={formData.join_policy} onValueChange={(value: 'open' | 'request') => setFormData(prev => ({ ...prev, join_policy: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select join policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open - Anyone can join</SelectItem>
                      <SelectItem value="request">Request - Approval required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">
                    Gender Restrictions
                  </Label>
                  <div className="col-span-3">
                    <p className="text-sm text-gray-600 mb-3">
                      Leave empty to allow all genders, or select specific genders to restrict membership.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {genderOptions.map((gender) => (
                        <div key={gender} className="flex items-center space-x-2">
                          <Checkbox
                            id={`gender-${gender}`}
                            checked={formData.allowed_genders?.includes(gender) || false}
                            onCheckedChange={(checked) => handleGenderToggle(gender, checked as boolean)}
                          />
                          <Label 
                            htmlFor={`gender-${gender}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {gender}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={handleCreateGroup} 
                  disabled={createGroupMutation.isPending}
                  className="bg-social-blue hover:bg-social-darkblue"
                >
                  {createGroupMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Group"
                  )}
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
            
{isLoadingUserGroups ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGroups.map((group) => (
                  <div key={group.id} className="social-card p-4">
                    <Link to={`/groups/${group.id}`} className="flex items-center">
                      <Avatar className="w-16 h-16 mr-4">
                        <AvatarImage src={group.avatar_url || "/placeholder.svg"} alt={group.name} />
                        <AvatarFallback>{getGroupInitials(group.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-lg">{group.name}</h3>
                        <p className="text-sm text-social-textSecondary capitalize">{group.category}</p>
                        <div className="flex items-center mt-1 text-xs text-social-textSecondary">
                          <Users className="w-3 h-3 mr-1" />
                          <span>{group.member_count || 0} members</span>
                          {group.allowed_genders && group.allowed_genders.length > 0 && (
                            <span className="ml-3 px-2 py-0.5 bg-pink-100 text-pink-800 rounded-full text-xs">
                              {group.allowed_genders.join(", ")}
                            </span>
                          )}
                          {group.user_role === 'admin' && (
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
                <p>{searchQuery ? "No groups match your search." : "You haven't joined any groups yet."}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="discover">
            <h3 className="font-semibold text-lg mb-4">Discover Groups</h3>
            {isLoadingPublicGroups ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : publicGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publicGroups.filter(group => !userGroups.some(ug => ug.id === group.id)).map((group) => (
                  <div key={group.id} className="social-card p-4">
                    <div className="flex items-center justify-between">
                      <Link to={`/groups/${group.id}`} className="flex items-center flex-1">
                        <Avatar className="w-16 h-16 mr-4">
                          <AvatarImage src={group.avatar_url || "/placeholder.svg"} alt={group.name} />
                          <AvatarFallback>{getGroupInitials(group.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-lg">{group.name}</h3>
                          <p className="text-sm text-social-textSecondary capitalize">{group.category}</p>
                          <div className="flex items-center mt-1 text-xs text-social-textSecondary">
                            <Users className="w-3 h-3 mr-1" />
                            <span>{group.member_count || 0} members</span>
                            {group.allowed_genders && group.allowed_genders.length > 0 && (
                              <span className="ml-3 px-2 py-0.5 bg-pink-100 text-pink-800 rounded-full text-xs">
                                {group.allowed_genders.join(", ")}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                      <Button
                        onClick={() => handleJoinGroup(group.id, group.name)}
                        disabled={joinGroupMutation.isPending}
                        className="bg-social-blue hover:bg-social-darkblue"
                      >
                        {joinGroupMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Join"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-social-textSecondary">
                <p>No public groups available to join.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Groups;
