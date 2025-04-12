
import { useState } from "react";
import { Plus } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { TravelCard } from "@/components/travel/TravelCard";
import { TravelForm } from "@/components/travel/TravelForm";
import { TravelList } from "@/components/travel/TravelList";
import { EmptyTravelState } from "@/components/travel/EmptyTravelState";
import { useTravels } from "@/hooks/useTravels";

const Travels = () => {
  const { user } = useAuth();
  const {
    travels,
    isLoading,
    travelData,
    shareAsPost,
    isAddDialogOpen,
    addTravelMutation,
    deleteTravelMutation,
    setTravelData,
    setShareAsPost,
    setIsAddDialogOpen,
    handleInputChange,
    handleSubmit,
  } = useTravels(user);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Travel Plans</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" /> Add Travel Plan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Travel Plan</DialogTitle>
              </DialogHeader>
              <TravelForm
                travelData={travelData}
                shareAsPost={shareAsPost}
                isPending={addTravelMutation.isPending}
                onInputChange={handleInputChange}
                onLookingForChange={(value) => setTravelData((prev) => ({ ...prev, looking_for: value as "locals" | "tourists" | "both" }))}
                onShareAsPostChange={(checked) => setShareAsPost(checked)}
                onSubmit={handleSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <p>Loading travel plans...</p>
          </div>
        ) : travels && travels.length > 0 ? (
          <TravelList 
            travels={travels} 
            currentUser={user} 
            onDelete={(id) => deleteTravelMutation.mutate(id)} 
          />
        ) : (
          <EmptyTravelState onAddClick={() => setIsAddDialogOpen(true)} />
        )}
      </div>
    </MainLayout>
  );
};

export default Travels;
