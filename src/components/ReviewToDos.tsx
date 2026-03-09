import React, { useState, useEffect } from 'react';
import { Target, Info, Plus, Trash2 } from 'lucide-react';
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
    headers: { ...getAuthHeaders(), ...options.headers },
  });
  return response;
};

const LIFE_AREA_IDS: Record<string, number> = {
  "Career": 1,
  "Health": 2,
  "Relationships": 3,
  "Personal Growth": 4,
  "Finance": 5,
};

function ReviewToDos() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [goals, setGoals] = useState<any[]>([]);

  // GET todos on mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await fetchWithAuth("/todos");
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.todos || data.data || []);
          const normalized: TodoItem[] = list.map((t: any) => ({
            id: String(t.id),
            title: t.title ?? "",
            description: t.description ?? "",
            lifeArea: t.life_area?.name ?? t.life_area ?? "",
            priority: t.priority ?? "medium",
            status: t.status ?? "not_started",
            targetDate: t.target_date ? new Date(t.target_date) : undefined,
            recurring: t.recurring ?? false,
            goalId: t.goal_id ? String(t.goal_id) : undefined,
          }));
          setTodos(normalized);
        }
      } catch (e) {
        console.error("Failed to fetch todos:", e);
      }
    };
    fetchTodos();
  }, []);

  // GET goals for dialog dropdown
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await fetchWithAuth("/goals");
        if (res.ok) {
          const data = await res.json();
          setGoals(Array.isArray(data) ? data : (data.goals || data.data || []));
        }
      } catch (e) {
        console.error("Failed to fetch goals:", e);
      }
    };
    fetchGoals();
  }, []);

  // POST new todo
  const handleCreateTodo = async (newTodo: TodoItem) => {
    setTodos((prev) => [...prev, newTodo]); // optimistic
    try {
      const payload = {
        todo: {
          title: newTodo.title,
          description: newTodo.description,
          life_area_id: LIFE_AREA_IDS[newTodo.lifeArea] ?? 1,
          priority: newTodo.priority.toLowerCase(),
          status: newTodo.status.toLowerCase().replace(/ /g, "_"),
          target_date: newTodo.targetDate
            ? new Date(newTodo.targetDate).toISOString().split("T")[0]
            : null,
          recurring: newTodo.recurring,
          goal_id: newTodo.goalId ? Number(newTodo.goalId) : null,
        },
      };
      const res = await fetchWithAuth("/todos", { method: "POST", body: JSON.stringify(payload) });
      if (res.ok) {
        const data = await res.json();
        const createdId = data.id ?? data.todo?.id;
        if (createdId) {
          setTodos((prev) => prev.map((t) => t.id === newTodo.id ? { ...t, id: String(createdId) } : t));
        }
      }
    } catch {
      console.log("API unavailable, saved locally");
    }
  };

  // DELETE todo
  const handleDeleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetchWithAuth(`/todos/${id}`, { method: "DELETE" });
    } catch {
      console.log("API unavailable, deleted locally");
    }
  };

  return (
    <div className="relative w-full max-w-4xl p-6 md:p-8 rounded-2xl border border-[#a2a9f5] bg-[#f2f4ff] shadow-sm font-sans overflow-hidden">
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/50 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#6770f4] shadow-sm">
          <Target className="text-white w-5 h-5" strokeWidth={2.5} />
        </div>
        <h2 className="text-[18px] font-bold text-gray-900">Review To Do's & Goals</h2>
        <Info className="w-4 h-4 text-indigo-400 cursor-help" />
      </div>

      {/* Todos Section */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-gray-800">To Do's</h3>
          <button
            className="flex items-center gap-1.5 bg-[#5b64f0] hover:bg-[#4a53d3] text-white px-5 py-2 rounded-lg text-[14px] font-semibold transition-colors shadow-sm"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> Add
          </button>
        </div>

        {todos.length === 0 ? (
          <div className="w-full bg-white rounded-xl py-5 flex items-center justify-center shadow-sm">
            <span className="text-[14px] font-medium text-gray-500">No to-do's yet</span>
          </div>
        ) : (
          <div className="w-full bg-white rounded-xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            {todos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                <span className="text-[15px] flex-1 text-gray-800 font-medium">{todo.title}</span>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors ml-2 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateToDoDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateTodo}
        availableGoals={goals}
      />
    </div>
  );
}

export default ReviewToDos;