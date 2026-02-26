import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const LIFE_AREAS = ["Career", "Health", "Relationships", "Personal Growth", "Finance"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Not Started", "In Progress", "Completed"];

interface CreateToDoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (todo: TodoItem) => void;
}

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  lifeArea: string;
  priority: string;
  status: string;
  targetDate?: Date;
  recurring: boolean;
}

const CreateToDoDialog = ({ open, onOpenChange, onSubmit }: CreateToDoDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lifeArea, setLifeArea] = useState("Career");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Not Started");
  const [targetDate, setTargetDate] = useState<Date>();
  const [recurring, setRecurring] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      lifeArea,
      priority,
      status,
      targetDate,
      recurring,
    });
    // Reset
    setTitle("");
    setDescription("");
    setLifeArea("Career");
    setPriority("Medium");
    setStatus("Not Started");
    setTargetDate(undefined);
    setRecurring(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-title-1 text-primary">Create New To Do</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-body-5 font-medium text-primary">Title *</label>
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-body-5 font-medium text-primary">Description</label>
            <Textarea
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-5 font-medium text-primary">Life Area</label>
              <Select value={lifeArea} onValueChange={setLifeArea}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LIFE_AREAS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-body-5 font-medium text-primary">Priority</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-5 font-medium text-primary">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-body-5 font-medium text-primary">Target Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "mt-1 w-full justify-start text-left font-normal",
                      !targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "dd/MM/yyyy") : "dd/mm/yyyy"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="border-t pt-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="recurring"
                checked={recurring}
                onCheckedChange={(v) => setRecurring(v === true)}
              />
              <label htmlFor="recurring" className="text-body-4 font-medium text-foreground cursor-pointer">
                Recurring To Do
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t pt-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!title.trim()} className="gap-1">
              <Save className="h-4 w-4" /> Create To Do
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateToDoDialog;
