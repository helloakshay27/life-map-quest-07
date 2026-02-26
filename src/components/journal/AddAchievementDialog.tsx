import { useState } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddAchievementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (achievement: { title: string; points: number }) => void;
}

const AddAchievementDialog = ({ open, onOpenChange, onSubmit }: AddAchievementDialogProps) => {
  const [title, setTitle] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), points: 10 });
    setTitle("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-title-1 text-primary">
            <Trophy className="h-5 w-5" /> Add Achievement
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-body-5 font-medium text-foreground">What did you achieve today?</label>
            <Input
              placeholder="e.g., Completed project milestone..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!title.trim()}>Add Win 🎉</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddAchievementDialog;
