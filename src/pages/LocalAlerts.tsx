import MainLayout from "@/components/layout/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LocalAlertForm } from "@/components/announcements/LocalAlertForm";
import { LocalAlertList } from "@/components/announcements/LocalAlertList";
import { EmptyLocalAlertState } from "@/components/announcements/EmptyLocalAlertState";
import { Megaphone, Info } from "lucide-react";
import { useLocalAlerts } from "@/hooks/useLocalAlerts";
import { Link } from "react-router-dom";

const LocalAlerts = () => {
  const {
    localAlerts,
    isLoading,
    localAlertData,
    isAddDialogOpen,
    setIsAddDialogOpen,
    deleteLocalAlertMutation,
    handleInputChange,
    handleSubmit,
    canCreate,
    limitReason
  } = useLocalAlerts();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6 py-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-heading-lg font-bold">Local Alerts</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!canCreate}>
                <Megaphone className="w-4 h-4 mr-2" />
                Create Local Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Local Alert</DialogTitle>
              </DialogHeader>
              <LocalAlertForm
                data={localAlertData}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                isLoading={false}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Local alerts are for immediate desires or events happening now or within the next 12 hours max. 
            For organizing activities in the coming days or months, use the{" "}
            <Link to="/travels" className="text-primary underline hover:no-underline">
              Travels
            </Link>{" "}
            or{" "}
            <Link to="/events" className="text-primary underline hover:no-underline">
              Events
            </Link>{" "}
            features instead.
          </AlertDescription>
        </Alert>

        {!canCreate && limitReason && (
          <Alert variant="destructive">
            <AlertDescription>{limitReason}</AlertDescription>
          </Alert>
        )}

        {localAlerts.length > 0 ? (
          <LocalAlertList 
            localAlerts={localAlerts} 
            onDelete={(id) => deleteLocalAlertMutation.mutate(id)} 
          />
        ) : (
          <EmptyLocalAlertState 
            onAddClick={() => canCreate && setIsAddDialogOpen(true)} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default LocalAlerts;