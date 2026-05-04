import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LIFE_AREA_OPTIONS = [
  { value: "Personal", label: "\u2728 Personal" },
  { value: "Travel", label: "\u2708\uFE0F Travel" },
  { value: "Career", label: "\uD83D\uDCBC Career" },
  { value: "Adventure", label: "\uD83E\uDDD7 Adventure" },
  { value: "Learning", label: "\uD83D\uDCDA Learning" },
];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Not Started", "In Progress", "Completed"];
const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const RECURRENCE_PATTERNS = ["Daily", "Weekly", "Monthly", "Custom"];

const toOptions = (items: string[]) =>
  items.map((i) => ({ value: i, label: i }));

// Helper: Date -> "YYYY-MM-DD" string for input[type=date]
const toInputDate = (d?: Date): string => {
  if (!d) return "";
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Helper: "YYYY-MM-DD" string -> Date
const fromInputDate = (s: string): Date | undefined => {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

interface GoalOption {
  id: number | string;
  title?: string;
  name?: string;
}

interface CreateToDoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (todo: TodoItem) => void;
  initialData?: TodoItem | null;
  availableGoals?: GoalOption[];
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
  goalId?: string;
  recurrencePattern?: string;
  recurringDays?: string[];
  repeatInterval?: string;
}

const CreateToDoDialog = ({
  open,
  onOpenChange,
  onSubmit,
  initialData = null,
  availableGoals = [],
}: CreateToDoDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lifeArea, setLifeArea] = useState("Personal");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Not Started");
  const [targetDateStr, setTargetDateStr] = useState<string>("");
  const [recurring, setRecurring] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string>("none");

  // New States for Recurring Logic
  const [recurrencePattern, setRecurrencePattern] = useState("Weekly");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [repeatInterval, setRepeatInterval] = useState("");

  const isEditMode = Boolean(initialData?.id);

  useEffect(() => {
    if (!open) return;
    if (!initialData) {
      setTitle("");
      setDescription("");
      setLifeArea("Personal");
      setPriority("Medium");
      setStatus("Not Started");
      setTargetDateStr("");
      setRecurring(false);
      setSelectedGoal("none");
      setRecurrencePattern("Weekly");
      setSelectedDays([]);
      setRepeatInterval("");
      return;
    }

    setTitle(initialData.title ?? "");
    setDescription(initialData.description ?? "");
    setLifeArea(initialData.lifeArea ?? "Personal");
    setPriority(initialData.priority ?? "Medium");
    setStatus(initialData.status ?? "Not Started");
    setTargetDateStr(toInputDate(initialData.targetDate));
    setRecurring(Boolean(initialData.recurring));
    setSelectedGoal(initialData.goalId ?? "none");
    setRecurrencePattern(initialData.recurrencePattern ?? "Weekly");
    setSelectedDays(initialData.recurringDays ?? []);
    setRepeatInterval(initialData.repeatInterval ?? "");
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
      targetDate: fromInputDate(targetDateStr),
      recurring,
      goalId: selectedGoal === "none" ? undefined : selectedGoal,
      recurrencePattern: recurring ? recurrencePattern : undefined,
      recurringDays:
        recurring &&
        (recurrencePattern === "Weekly" || recurrencePattern === "Custom")
          ? selectedDays
          : undefined,
      repeatInterval:
        recurring && recurrencePattern === "Custom"
          ? repeatInterval
          : undefined,
    });

    setTitle("");
    setDescription("");
    setLifeArea("Personal");
    setPriority("Medium");
    setStatus("Not Started");
    setTargetDateStr("");
    setRecurring(false);
    setSelectedGoal("none");
    setRecurrencePattern("Weekly");
    setSelectedDays([]);
    setRepeatInterval("");
    onOpenChange(false);
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className={
              isEditMode
                ? "text-title-1 text-foreground"
                : "text-title-1 text-[#222]"
            }
          >
            {isEditMode ? "Update To Do" : "Create New To Do"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-body-5 font-medium text-[#222]">
              Title *
            </label>
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-body-5 font-medium text-[#222]">
              Description
            </label>
            <Textarea
              placeholder="Add details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-5 font-medium text-[#222]">
                Life Area
              </label>
              <div className="mt-1">
                <SearchableSelect
                  options={LIFE_AREA_OPTIONS}
                  value={lifeArea}
                  onValueChange={setLifeArea}
                  placeholder="Select area"
                  searchPlaceholder="Search areas..."
                />
              </div>
            </div>
            <div>
              <label className="text-body-5 font-medium text-[#222]">
                Priority
              </label>
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
              <label className="text-body-5 font-medium text-[#222]">
                Status
              </label>
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
              <label className="text-body-5 font-medium text-[#222]">
                Target Date (optional)
              </label>
              <input
                type="date"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-body-5 font-medium text-[#222]">
              Link to Goal (Optional)
            </label>
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
            {availableGoals.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                No goals found. Make sure goals are created first.
              </p>
            )}
          </div>

          <div className="border-t border-[#D6B99D] pt-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="recurring"
                checked={recurring}
                className="border-[#D6B99D] data-[state=checked]:bg-[#DA7756] data-[state=checked]:border-[#DA7756]"
                onCheckedChange={(v) => setRecurring(v === true)}
              />
              <label
                htmlFor="recurring"
                className="text-body-4 font-medium text-[#2C2C2A] cursor-pointer"
              >
                Recurring To Do
              </label>
            </div>

            {recurring && (
              <div className="mt-4 space-y-4 rounded-md border border-[#D6B99D] bg-[#FEF4EE] p-4">
                <div>
                  <label className="text-body-5 font-medium text-[#2C2C2A]">
                    Recurrence Pattern
                  </label>
                  <div className="mt-1">
                    <Select
                      value={recurrencePattern}
                      onValueChange={setRecurrencePattern}
                    >
                      <SelectTrigger className="w-full border-[#D6B99D] bg-white focus:ring-[#DA7756]">
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        {RECURRENCE_PATTERNS.map((pattern) => (
                          <SelectItem key={pattern} value={pattern}>
                            {pattern}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(recurrencePattern === "Weekly" ||
                  recurrencePattern === "Custom") && (
                  <div>
                    <label className="text-body-5 font-medium text-[#2C2C2A]">
                      Repeat on
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                            selectedDays.includes(day)
                              ? "bg-[#DA7756] text-white border-[#DA7756] shadow-sm"
                              : "bg-white text-[#C96B4D] border-[#DA7756]/30 hover:bg-[#DA7756]/10"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {recurrencePattern === "Custom" && (
                  <div>
                    <label className="text-body-5 font-medium text-[#2C2C2A]">
                      Repeat every (days)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={repeatInterval}
                      onChange={(e) => setRepeatInterval(e.target.value)}
                      className="mt-1 border-[#D6B99D] bg-white focus-visible:ring-[#DA7756]"
                      placeholder="e.g. 3"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-[#D6B99D] pt-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="gap-1 bg-[#DA7756] hover:bg-[#C96B4D] text-white"
            >
              <Save className="h-4 w-4" />{" "}
              {isEditMode ? "Update To Do" : "Create To Do"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateToDoDialog;
