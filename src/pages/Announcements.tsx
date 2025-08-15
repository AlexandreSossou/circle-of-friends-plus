import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Plus } from "lucide-react";
import { AnnouncementForm } from "@/components/announcements/AnnouncementForm";
import { AnnouncementList } from "@/components/announcements/AnnouncementList";
import { EmptyAnnouncementState } from "@/components/announcements/EmptyAnnouncementState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import MainLayout from "@/components/layout/MainLayout";

const Announcements = () => {
  const {
    announcements,
    isLoading,
    announcementData,
    isAddDialogOpen,
    setIsAddDialogOpen,
    deleteAnnouncementMutation,
    handleInputChange,
    handleSubmit,
  } = useAnnouncements();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-social-blue" />
            <h1 className="text-2xl font-bold">Announcements</h1>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <AnnouncementForm
                data={announcementData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                isLoading={false}
              />
            </DialogContent>
          </Dialog>
        </div>

        {announcements.length > 0 ? (
          <AnnouncementList
            announcements={announcements}
            onDelete={(id) => deleteAnnouncementMutation.mutate(id)}
          />
        ) : (
          <EmptyAnnouncementState onAddClick={() => setIsAddDialogOpen(true)} />
        )}
      </div>
    </MainLayout>
  );
};

export default Announcements;