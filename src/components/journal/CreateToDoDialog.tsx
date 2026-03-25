import { useEffect, useState } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const LIFE_AREAS = ["Career", "Health", "Relationships", "Personal Growth", "Finance"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Not Started", "In Progress", "Completed"];

const toOptions = (items: string[]) => items.map((i) => ({ value: i, label: i }));

interface CreateToDoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (todo: TodoItem) => void;
  initialData?: TodoItem | null;
  // 🚀 Naya prop availableGoals receive karne ke liye
  availableGoals?: any[]; 
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
  goalId?: string; // 🚀 Linked goal id yahan aayega
}

const CreateToDoDialog = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData = null,
  availableGoals = [] 
}: CreateToDoDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lifeArea, setLifeArea] = useState("Career");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Not Started");
  const [targetDate, setTargetDate] = useState<Date>();
  const [recurring, setRecurring] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>("none"); // 🚀 State for dropdown
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const isEditMode = Boolean(initialData?.id);

  useEffect(() => {
    if (!open) return;
    if (!initialData) {
      setTitle("");
      setDescription("");
      setLifeArea("Career");
      setPriority("Medium");
      setStatus("Not Started");
      setTargetDate(undefined);
      setRecurring(false);
      setSelectedGoal("none");
      return;
    }

    setTitle(initialData.title ?? "");
    setDescription(initialData.description ?? "");
    setLifeArea(initialData.lifeArea ?? "Career");
    setPriority(initialData.priority ?? "Medium");
    setStatus(initialData.status ?? "Not Started");
    setTargetDate(initialData.targetDate);
    setRecurring(Boolean(initialData.recurring));
    setSelectedGoal(initialData.goalId ?? "none");
  }, [open, initialData]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      id: initialData?.id ?? crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      lifeArea,
      priority,
      status,
      targetDate,
      recurring,
      goalId: selectedGoal === "none" ? undefined : selectedGoal, // 🚀 Payload mein add kiya
    });
    
    // Reset all fields
    setTitle("");
    setDescription("");
    setLifeArea("Career");
    setPriority("Medium");
    setStatus("Not Started");
    setTargetDate(undefined);
    setRecurring(false);
    setSelectedGoal("none"); // Reset goal
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={isEditMode ? "text-title-1 text-foreground" : "text-title-1 text-[#222]"}>
            {isEditMode ? "Update To Do" : "Create New To Do"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-body-5 font-medium text-[#222]">Title *</label>
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-body-5 font-medium text-[#222]">Description</label>
            <Textarea
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-5 font-medium text-[#222]">Life Area</label>
              <div className="mt-1">
                <SearchableSelect
                  options={toOptions(LIFE_AREAS)}
                  value={lifeArea}
                  onValueChange={setLifeArea}
                  placeholder="Select area"
                  searchPlaceholder="Search areas..."
                />
              </div>
            </div>
            <div>
              <label className="text-body-5 font-medium text-[#222]">Priority</label>
              <div className="mt-1">
                <SearchableSelect
                  options={toOptions(PRIORITIES)}
                  value={priority}
                  onValueChange={setPriority}
                  placeholder="Select priority"
                  searchPlaceholder="Search priorities..."
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-5 font-medium text-[#222]">Status</label>
              <div className="mt-1">
                <SearchableSelect
                  options={toOptions(STATUSES)}
                  value={status}
                  onValueChange={setStatus}
                  placeholder="Select status"
                  searchPlaceholder="Search statuses..."
                />
              </div>
            </div>
            <div>
              <label className="text-body-5 font-medium text-[#222]">Target Date (optional)</label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
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
                    onSelect={(d) => {
                      setTargetDate(d);
                      if (d) setIsDatePickerOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* 🚀 NAYA DROPDOWN: LINK TO GOAL */}
          <div>
            <label className="text-body-5 font-medium text-[#222]">Link to Goal (Optional)</label>
            <div className="mt-1">
              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select a goal..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableGoals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id.toString()}>
                      {goal.title || goal.name || `Goal #${goal.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button variant="secondary" onClick={handleSubmit} disabled={!title.trim()} className="gap-1">
              <Save className="h-4 w-4" /> {isEditMode ? "Update To Do" : "Create To Do"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateToDoDialog;