import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Eye, EyeOff, GripVertical, Pencil, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateToDoDialog, { TodoItem } from "@/components/journal/CreateToDoDialog";

const API_BASE_URL = "https://life-api.lockated.com";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("auth_token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  return response;
};

const LIFE_AREAS = ["Career", "Health", "Relationships", "Personal Growth", "Finance"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const toApiStatus = (ui: string) => {
  const map: Record<string, string> = {
    "Not Started": "not_started",
    "In Progress": "in_progress",
    "Completed": "completed",
    "Someday": "someday",
  };
  return map[ui] ?? ui.toLowerCase().replace(/ /g, "_");
};

const toApiPriority = (ui: string) => ui.toLowerCase();

interface DragState {
  todoId: string;
  pointerId: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  cardWidth: number;
  cardHeight: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
}

const Todos = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [selectedArea, setSelectedArea] = useState("all-areas");
  const [selectedPriority, setSelectedPriority] = useState("all-priorities");
  const [selectedStatus, setSelectedStatus] = useState("all-statuses");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dragStateRef = useRef<DragState | null>(null);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const savedTodosRaw = localStorage.getItem("user_todos");
        const savedTodos: TodoItem[] | null = savedTodosRaw ? JSON.parse(savedTodosRaw) : null;
        if (savedTodos) setTodos(savedTodos);

        const response = await fetchWithAuth("/todos", { method: "GET" });
        if (response.ok) {
          const rawData = await response.json();
          const formattedData = rawData.map((item: any) => {
            const statusMap: Record<string, string> = {
              "not_started": "Not Started",
              "in_progress": "In Progress",
              "completed": "Completed",
              "someday": "Someday"
            };
            const priorityMap: Record<string, string> = {
              "low": "Low",
              "medium": "Medium",
              "high": "High",
              "urgent": "Urgent"
            };
            return {
              ...item,
              id: String(item.id),
              lifeArea: item.life_area || "General",
              status: statusMap[item.status] || "Not Started",
              priority: priorityMap[item.priority] || "Medium",
            };
          });

          const localById = new Map<string, TodoItem>(
            (savedTodos ?? []).map((t) => [String(t.id), t]),
          );

          const merged: TodoItem[] = formattedData.map((t: TodoItem) => {
            const local = localById.get(String(t.id));
            return local
              ? {
                  ...t,
                  title: local.title ?? t.title,
                  description: local.description ?? t.description,
                  lifeArea: local.lifeArea ?? t.lifeArea,
                  priority: local.priority ?? t.priority,
                  status: t.status,
                }
              : t;
          });

          for (const lt of savedTodos ?? []) {
            if (!formattedData.some((t: TodoItem) => String(t.id) === String(lt.id))) {
              merged.push(lt);
            }
          }

          setTodos(merged);
          localStorage.setItem("user_todos", JSON.stringify(merged));
          return;
        }
        throw new Error("Failed to fetch from API");
      } catch (error) {
        console.log("API unavailable, falling back to local storage", error);
        try {
          const savedTodos = localStorage.getItem("user_todos");
          if (savedTodos) {
            setTodos(JSON.parse(savedTodos));
          }
        } catch (parseError) {
          console.error("Failed to parse local storage todos");
        }
      }
    };
    loadTodos();
  }, []);

  const statuses = [
    { key: "Not Started", label: "Not Started", color: "bg-indigo-50 border-indigo-200", hoverColor: "bg-indigo-100 border-indigo-500 shadow-lg shadow-indigo-100" },
    { key: "In Progress", label: "In Progress", color: "bg-blue-50 border-blue-200",     hoverColor: "bg-blue-100 border-blue-500 shadow-lg shadow-blue-100"    },
    { key: "Completed",   label: "Completed",   color: "bg-green-50 border-green-200",   hoverColor: "bg-green-100 border-green-500 shadow-lg shadow-green-100"  },
    { key: "Someday",     label: "Someday",     color: "bg-purple-50 border-purple-200", hoverColor: "bg-purple-100 border-purple-500 shadow-lg shadow-purple-100"},
  ];

  const filteredTodos = todos.filter((todo) => {
    const areaMatch     = selectedArea     === "all-areas"      || todo.lifeArea === selectedArea;
    const priorityMatch = selectedPriority === "all-priorities" || todo.priority === selectedPriority;
    const statusMatch   = selectedStatus   === "all-statuses"   || todo.status   === selectedStatus;
    return areaMatch && priorityMatch && statusMatch;
  });

  const getTodosByStatus = (status: string) =>
    filteredTodos.filter((todo) => todo.status === status);

  const handleCreateTodo = async (newTodo: TodoItem) => {
    try {
      const finalTodo = { ...newTodo };
      try {
        const apiPayload = {
          ...newTodo,
          status: toApiStatus(newTodo.status),
          priority: toApiPriority(newTodo.priority),
          life_area: newTodo.lifeArea,
        };
        const response = await fetchWithAuth("/todos", { method: "POST", body: JSON.stringify(apiPayload) });
        if (response.ok) {
          const data = await response.json();
          finalTodo.id = data.id || newTodo.id;
          finalTodo.status = newTodo.status;
        }
      } catch {
        console.log("API unavailable, saving locally");
      }
      setTodos((prev) => {
        const updated = [...prev, finalTodo];
        localStorage.setItem("user_todos", JSON.stringify(updated));
        return updated;
      });
      toast({
        title: "To do created",
        description: "Saved successfully. Drag cards between columns to change status.",
        variant: "goalsSuccess",
      });
    } catch (error) {
      console.error("Failed to create todo:", error);
      toast({ title: "Error", description: "Failed to create to do", variant: "destructive" });
    }
  };

  const handleUpdateTodo = async (updated: TodoItem) => {
    const previous = [...todos];
    setTodos((prev) => {
      const next = prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t));
      localStorage.setItem("user_todos", JSON.stringify(next));
      return next;
    });

    try {
      const payloadWrapped = {
        todo: {
          title: updated.title,
          description: updated.description,
          life_area: updated.lifeArea,
          priority: toApiPriority(updated.priority),
          status: toApiStatus(updated.status),
          recurring: updated.recurring,
          target_date: updated.targetDate
            ? new Date(updated.targetDate).toISOString().split("T")[0]
            : null,
          goal_id: updated.goalId ? Number(updated.goalId) : null,
        },
      };

      let res = await fetchWithAuth(`/todos/${updated.id}`, {
        method: "PUT",
        body: JSON.stringify(payloadWrapped),
      });
      if (!res.ok) {
        res = await fetchWithAuth(`/todos/${updated.id}`, {
          method: "PATCH",
          body: JSON.stringify(payloadWrapped),
        });
      }

      if (!res.ok) {
        const payloadFlat: any = {
          ...updated,
          status: toApiStatus(updated.status),
          priority: toApiPriority(updated.priority),
        };
        res = await fetchWithAuth(`/todos/${updated.id}`, {
          method: "PUT",
          body: JSON.stringify(payloadFlat),
        });
        if (!res.ok) {
          res = await fetchWithAuth(`/todos/${updated.id}`, {
            method: "PATCH",
            body: JSON.stringify(payloadFlat),
          });
        }
      }

      if (!res.ok) throw new Error(`Failed (${res.status})`);
      toast({
        title: "To do updated",
        description: "Your changes have been saved.",
        variant: "goalsSuccess",
      });
    } catch (e) {
      console.error("Failed to update todo:", e);
      setTodos(previous);
      localStorage.setItem("user_todos", JSON.stringify(previous));
      toast({ title: "Error", description: "Failed to update to do", variant: "destructive" });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      try { await fetchWithAuth(`/todos/${id}`, { method: "DELETE" }); } catch { console.log("API unavailable, deleting locally"); }
      setTodos((prev) => { const updated = prev.filter((t) => t.id !== id); localStorage.setItem("user_todos", JSON.stringify(updated)); return updated; });
      toast({
        title: "To do deleted",
        description: "Removed successfully.",
        variant: "todoDelete",
      });
    } catch (error) {
      console.error("Failed to delete todo:", error);
      toast({ title: "Error", description: "Failed to delete to do", variant: "destructive" });
    }
  };

  // ✅ FIX: Added previous state snapshot, rollback on failure, correct error toast in catch
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // ✅ FIX 1: Save previous state for rollback
    const previous = [...todos];

    const updatedTodo = todos.find((t) => t.id === id);
    if (!updatedTodo) return;

    // Optimistic UI update
    setTodos((prev) => {
      const newTodos = prev.map((t) => t.id === id ? { ...t, status: newStatus } : t);
      localStorage.setItem("user_todos", JSON.stringify(newTodos));
      return newTodos;
    });

    try {
      const payloadWrapped = {
        todo: {
          status: toApiStatus(newStatus),
          priority: toApiPriority(updatedTodo.priority),
          life_area: updatedTodo.lifeArea,
          title: updatedTodo.title,
          description: updatedTodo.description,
        },
      };

      let res = await fetchWithAuth(`/todos/${id}`, {
        method: "PUT",
        body: JSON.stringify(payloadWrapped),
      });
      if (!res.ok) {
        res = await fetchWithAuth(`/todos/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payloadWrapped),
        });
      }
      if (!res.ok) {
        const payloadFlat = { ...updatedTodo, status: toApiStatus(newStatus) };
        res = await fetchWithAuth(`/todos/${id}`, {
          method: "PUT",
          body: JSON.stringify(payloadFlat),
        });
        if (!res.ok) {
          res = await fetchWithAuth(`/todos/${id}`, {
            method: "PATCH",
            body: JSON.stringify(payloadFlat),
          });
        }
      }

      if (res.ok) {
        // ✅ Success — show success toast
        toast({
          title: "To do moved",
          description: `Updated status to ${newStatus}.`,
          variant: "goalsSuccess",
        });
      } else {
        // ✅ FIX 2: Non-ok response — rollback UI + show error toast
        setTodos(previous);
        localStorage.setItem("user_todos", JSON.stringify(previous));
        toast({ title: "Error", description: "Failed to move to do", variant: "destructive" });
      }
    } catch (error) {
      // ✅ FIX 3: Network/exception — rollback UI + show error toast (not success)
      console.error("Failed to update todo status:", error);
      setTodos(previous);
      localStorage.setItem("user_todos", JSON.stringify(previous));
      toast({ title: "Error", description: "Failed to move to do. Please try again.", variant: "destructive" });
    }
  };

  const getHoveredColumn = useCallback((x: number, y: number): string | null => {
    for (const [statusKey, el] of Object.entries(columnRefs.current)) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return statusKey;
      }
    }
    return null;
  }, []);

  const handlePointerDown = (e: React.PointerEvent, todoId: string) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragState({
      todoId,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      cardWidth: rect.width,
      cardHeight: rect.height,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      isDragging: false,
    });
  };

  const updateDragPosition = useCallback((clientX: number, clientY: number) => {
    const current = dragStateRef.current;
    if (!current) return;
    const dx = clientX - current.startX;
    const dy = clientY - current.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const isDragging = current.isDragging || dist > 6;
    if (isDragging) {
      setDragState((prev) =>
        prev
          ? { ...prev, currentX: clientX, currentY: clientY, isDragging: true }
          : null,
      );
      setHoveredStatus(getHoveredColumn(clientX, clientY));
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    }
  }, [getHoveredColumn]);

  const commitDrop = useCallback((clientX: number, clientY: number) => {
    const current = dragStateRef.current;
    if (!current) return;
    if (current.isDragging) {
      const targetStatus = getHoveredColumn(clientX, clientY);
      const todo = todos.find((t) => t.id === current.todoId);
      if (targetStatus && todo && todo.status !== targetStatus) {
        handleUpdateStatus(current.todoId, targetStatus);
      }
    }
    setDragState(null);
    setHoveredStatus(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [todos, getHoveredColumn]);

  const handlePointerCancel = useCallback(() => {
    setDragState(null);
    setHoveredStatus(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    if (!dragState) return;

    const onMove = (e: PointerEvent) => {
      const current = dragStateRef.current;
      if (!current) return;
      if (e.pointerId !== current.pointerId) return;
      e.preventDefault();
      updateDragPosition(e.clientX, e.clientY);
    };

    const onUp = (e: PointerEvent) => {
      const current = dragStateRef.current;
      if (!current) return;
      if (e.pointerId !== current.pointerId) return;
      e.preventDefault();
      commitDrop(e.clientX, e.clientY);
    };

    const onCancel = (e: PointerEvent) => {
      const current = dragStateRef.current;
      if (!current) return;
      if (e.pointerId !== current.pointerId) return;
      handlePointerCancel();
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp, { passive: false });
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [dragState, updateDragPosition, commitDrop, handlePointerCancel]);

  const ghostStyle = dragState?.isDragging
    ? {
        position: "fixed" as const,
        left: dragState.currentX - dragState.offsetX,
        top: dragState.currentY - dragState.offsetY,
        width: dragState.cardWidth,
        pointerEvents: "none" as const,
        zIndex: 9999,
        transform: "rotate(2deg) scale(1.04)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        transition: "none",
      }
    : undefined;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent": return "bg-red-100 text-red-800";
      case "High":   return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low":    return "bg-green-100 text-green-800";
      default:       return "bg-gray-100 text-gray-800";
    }
  };

  const draggingTodo = dragState ? todos.find((t) => t.id === dragState.todoId) : null;

  return (
    <div className="relative w-full min-h-[calc(100vh-7rem)] animate-fade-in space-y-8 rounded-xl bg-[#F6F4EE] p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">To Do's</h1>
          <p className="text-sm text-muted-foreground">Manage your tasks and action items</p>
        </div>
        <Button
          size="sm"
          className="bg-[#DA7756] hover:bg-[#C96B4D] text-white w-full sm:w-auto px-4 py-2.5"
          onClick={() => {
            setEditingTodo(null);
            setIsCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />New To Do
        </Button>
      </div>

      <div className="w-full min-h-[520px] flex flex-col bg-[#F6F4EE] rounded-2xl border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-100 bg-[#F6F4EE]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 w-full sm:w-auto">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-full text-sm"><SelectValue placeholder="All Areas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-areas">All Areas</SelectItem>
                {LIFE_AREAS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full text-sm"><SelectValue placeholder="All Priorities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-priorities">All Priorities</SelectItem>
                {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full text-sm"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                {statuses.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => setViewMode("list")} className={`flex-1 sm:flex-none text-xs sm:text-sm ${viewMode === "list" ? "bg-[#DA7756] text-white border-[#DA7756] hover:bg-[#C96B4D] hover:text-white" : "text-[#DA7756] border-[#DA7756]/40 hover:bg-[#DA7756]/10"}`}>
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />List
            </Button>
            <Button variant="outline" size="sm" onClick={() => setViewMode("kanban")} className={`flex-1 sm:flex-none text-xs sm:text-sm ${viewMode === "kanban" ? "bg-[#DA7756] text-white border-[#DA7756] hover:bg-[#C96B4D] hover:text-white" : "text-[#DA7756] border-[#DA7756]/40 hover:bg-[#DA7756]/10"}`}>
              Kanban
            </Button>
          </div>
        </div>

        <div className="p-4 sm:p-6 min-h-[420px]">
          {/* Kanban View */}
          {viewMode === "kanban" && (
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statuses.map((status) => {
                const statusTodos = getTodosByStatus(status.key);
                const isHovered = hoveredStatus === status.key && dragState?.isDragging;

                return (
                  <div key={status.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{status.label}</h3>
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs sm:text-sm font-medium text-gray-700">
                        {statusTodos.length}
                      </span>
                    </div>

                    <div
                      ref={(el) => { columnRefs.current[status.key] = el; }}
                      className={`
                        min-h-64 sm:min-h-80 lg:min-h-96 rounded-lg border-2 border-dashed p-3 sm:p-4
                        transition-all duration-150
                        ${isHovered ? status.hoverColor : status.color}
                        ${dragState?.isDragging && !isHovered ? "opacity-70" : ""}
                      `}
                    >
                      {isHovered && (
                        <div className="mb-3 rounded-lg border-2 border-dashed border-gray-400 bg-white/70 h-14 flex items-center justify-center gap-2">
                          <div className="w-1.5 h-5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-7 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "80ms" }} />
                          <div className="w-1.5 h-4 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "160ms" }} />
                          <span className="text-xs text-gray-500 font-semibold ml-1">Drop here</span>
                        </div>
                      )}

                      {statusTodos.length === 0 && !isHovered ? (
                        <div className="flex h-full min-h-48 sm:min-h-56 flex-col items-center justify-center">
                          <svg className="mb-3 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="2" fill="currentColor" />
                            <circle cx="12" cy="12" r="6" fill="none" />
                            <circle cx="12" cy="12" r="10" fill="none" />
                          </svg>
                          <p className="text-center text-xs sm:text-sm text-muted-foreground">No tasks</p>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          {statusTodos.map((todo) => {
                            const isBeingDragged = dragState?.todoId === todo.id && dragState?.isDragging;
                            return (
                              <Card
                                key={todo.id}
                                onPointerDown={(e) => handlePointerDown(e, todo.id)}
                                onPointerCancel={handlePointerCancel}
                                className={`
                                  bg-white p-2 sm:p-3 shadow-sm select-none touch-none
                                  transition-all duration-150
                                  ${isBeingDragged
                                    ? "opacity-25 scale-95 shadow-none"
                                    : "cursor-grab hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5 active:cursor-grabbing"
                                  }
                                `}
                              >
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <GripVertical className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground/40" />
                                    <p className="text-sm sm:text-base font-medium text-foreground flex-1 line-clamp-2">{todo.title}</p>
                                    <button
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onClick={() => {
                                        setEditingTodo(todo);
                                        setIsCreateDialogOpen(true);
                                      }}
                                      className="text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
                                      title="Edit"
                                    >
                                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </button>
                                    <button
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onClick={() => handleDeleteTodo(todo.id)}
                                      className="text-[#DA7756] hover:text-[#C96B4D] transition-colors flex-shrink-0"
                                      title="Delete"
                                    >
                                      <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </button>
                                  </div>
                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{todo.description}</p>
                                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 items-center">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{todo.lifeArea}</span>
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}>{todo.priority}</span>
                                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{todo.status}</span>
                                    {todo.targetDate && (
                                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
                                        <CalendarIcon className="inline-block h-3 w-3 mr-1" />
                                        {typeof todo.targetDate === 'string' ? new Date(todo.targetDate).toLocaleDateString() : todo.targetDate.toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-3">
              {filteredTodos.length === 0 ? (
                <Card className="p-6 sm:p-8 text-center">
                  <p className="text-muted-foreground">No tasks match your filters</p>
                </Card>
              ) : (
                <div className="grid gap-3 sm:gap-4">
                  {filteredTodos.map((todo) => (
                    <Card key={todo.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground text-sm sm:text-base line-clamp-1">{todo.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">{todo.description}</p>
                          <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 items-center">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{todo.lifeArea}</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}>{todo.priority}</span>
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{todo.status}</span>
                            {todo.targetDate && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded flex items-center gap-1">
                                <CalendarIcon className="inline-block h-3 w-3 mr-1" />
                                {typeof todo.targetDate === 'string' ? new Date(todo.targetDate).toLocaleDateString() : todo.targetDate.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Select value={todo.status} onValueChange={(value) => handleUpdateStatus(todo.id, value)}>
                            <SelectTrigger className="w-24 sm:w-32 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {statuses.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTodo(todo);
                              setIsCreateDialogOpen(true);
                            }}
                            className="flex-shrink-0 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTodo(todo.id)} className="flex-shrink-0 text-[#DA7756] hover:text-[#C96B4D] hover:bg-[#DA7756]/10">
                            <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Ghost Card while dragging */}
      {dragState?.isDragging && draggingTodo && (
        <div style={ghostStyle}>
          <Card className="bg-white p-2 sm:p-3 border-2 border-purple-400">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-foreground flex-1 line-clamp-2">{draggingTodo.title}</p>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{draggingTodo.lifeArea}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(draggingTodo.priority)}`}>{draggingTodo.priority}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      <CreateToDoDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setEditingTodo(null);
        }}
        initialData={editingTodo}
        onSubmit={(todo) => {
          if (editingTodo) {
            handleUpdateTodo(todo);
          } else {
            handleCreateTodo(todo);
          }
        }}
      />
    </div>
  );
};

export default Todos;