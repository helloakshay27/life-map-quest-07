import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Eye, EyeOff, ArrowLeft, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface DragState {
  todoId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  cardWidth: number;
  cardHeight: number;
  isDragging: boolean;
}

const Todos = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [selectedArea, setSelectedArea] = useState("all-areas");
  const [selectedPriority, setSelectedPriority] = useState("all-priorities");
  const [selectedStatus, setSelectedStatus] = useState("all-statuses");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // ─── Drag State ─────────────────────────────────────────────────────────────
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Load todos
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const savedTodos = localStorage.getItem("user_todos");
        if (savedTodos) { setTodos(JSON.parse(savedTodos)); return; }
        try {
          const response = await fetchWithAuth("/todos", { method: "GET" });
          if (response.ok) {
            const data = await response.json();
            setTodos(data);
            localStorage.setItem("user_todos", JSON.stringify(data));
          }
        } catch { console.log("API unavailable, using local storage"); }
      } catch { console.log("Using local storage for todos"); }
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

  // ─── API Handlers (unchanged) ────────────────────────────────────────────────
  const handleCreateTodo = async (newTodo: TodoItem) => {
    try {
      try {
        const response = await fetchWithAuth("/todos", { method: "POST", body: JSON.stringify(newTodo) });
        if (response.ok) { const data = await response.json(); newTodo.id = data.id || newTodo.id; }
      } catch { console.log("API unavailable, saving locally"); }
      setTodos((prev) => { const updated = [...prev, newTodo]; localStorage.setItem("user_todos", JSON.stringify(updated)); return updated; });
    } catch (error) { console.error("Failed to create todo:", error); }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      try { await fetchWithAuth(`/todos/${id}`, { method: "DELETE" }); } catch { console.log("API unavailable, deleting locally"); }
      setTodos((prev) => { const updated = prev.filter((t) => t.id !== id); localStorage.setItem("user_todos", JSON.stringify(updated)); return updated; });
    } catch (error) { console.error("Failed to delete todo:", error); }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const updatedTodo = todos.find((t) => t.id === id);
      if (!updatedTodo) return;
      // Optimistic UI update first
      setTodos((prev) => {
        const newTodos = prev.map((t) => t.id === id ? { ...t, status: newStatus } : t);
        localStorage.setItem("user_todos", JSON.stringify(newTodos));
        return newTodos;
      });
      try {
        await fetchWithAuth(`/todos/${id}`, { method: "PUT", body: JSON.stringify({ ...updatedTodo, status: newStatus }) });
      } catch { console.log("API unavailable, updating locally"); }
    } catch (error) { console.error("Failed to update todo:", error); }
  };

  // ─── Pointer-Based Drag & Drop (works in iframes) ───────────────────────────
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
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragState({
      todoId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      cardWidth: rect.width,
      cardHeight: rect.height,
      isDragging: false,
    });
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const isDragging = dragState.isDragging || dist > 6;
    if (isDragging) {
      setDragState((prev) => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY, isDragging: true } : null);
      setHoveredStatus(getHoveredColumn(e.clientX, e.clientY));
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    }
  }, [dragState, getHoveredColumn]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState) return;
    if (dragState.isDragging) {
      const targetStatus = getHoveredColumn(e.clientX, e.clientY);
      const todo = todos.find((t) => t.id === dragState.todoId);
      if (targetStatus && todo && todo.status !== targetStatus) {
        handleUpdateStatus(dragState.todoId, targetStatus);
      }
    }
    setDragState(null);
    setHoveredStatus(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [dragState, todos, getHoveredColumn]);

  const handlePointerCancel = useCallback(() => {
    setDragState(null);
    setHoveredStatus(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const ghostStyle = dragState?.isDragging
    ? {
        position: "fixed" as const,
        left: dragState.currentX - dragState.cardWidth / 2,
        top: dragState.currentY - dragState.cardHeight / 2,
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
    <div className="animate-fade-in space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="flex items-center justify-center text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">To Do's</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your tasks and action items</p>
          </div>
        </div>
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />New To Do
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
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
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className="flex-1 sm:flex-none text-xs sm:text-sm">
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />List
          </Button>
          <Button variant={viewMode === "kanban" ? "default" : "outline"} size="sm" onClick={() => setViewMode("kanban")} className="flex-1 sm:flex-none text-xs sm:text-sm">
            Kanban
          </Button>
        </div>
      </div>

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

                {/* Drop Column */}
                <div
                  ref={(el) => { columnRefs.current[status.key] = el; }}
                  className={`
                    min-h-64 sm:min-h-80 lg:min-h-96 rounded-lg border-2 border-dashed p-3 sm:p-4
                    transition-all duration-150
                    ${isHovered ? status.hoverColor : status.color}
                    ${dragState?.isDragging && !isHovered ? "opacity-70" : ""}
                  `}
                >
                  {/* Animated drop indicator */}
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
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
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
                                <GripVertical className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                                <p className="text-sm sm:text-base font-medium text-foreground flex-1 line-clamp-2">{todo.title}</p>
                                <button
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={() => handleDeleteTodo(todo.id)}
                                  className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                                >
                                  <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{todo.description}</p>
                              <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{todo.lifeArea}</span>
                                <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}>{todo.priority}</span>
                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{todo.status}</span>
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
                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{todo.lifeArea}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${getPriorityColor(todo.priority)}`}>{todo.priority}</span>
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{todo.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={todo.status} onValueChange={(value) => handleUpdateStatus(todo.id, value)}>
                        <SelectTrigger className="w-24 sm:w-32 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteTodo(todo.id)} className="flex-shrink-0">
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
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateTodo}
      />
    </div>
  );
};

export default Todos;