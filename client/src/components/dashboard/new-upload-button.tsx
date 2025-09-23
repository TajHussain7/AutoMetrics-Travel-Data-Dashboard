import { Button } from "@/components/ui/button";
import { clearStorage } from "@/lib/local-storage";
import { useLocation } from "wouter";

export function NewUploadButton() {
  const [, setLocation] = useLocation();

  const handleNewUpload = () => {
    // Clear the stored data
    clearStorage();
    // Navigate to upload page
    setLocation("/");
    // Reload page to clear all states
    window.location.reload();
  };

  return (
    <Button
      onClick={handleNewUpload}
      variant="default"
      className="bg-primary hover:bg-primary/90"
    >
      New Upload
    </Button>
  );
}
