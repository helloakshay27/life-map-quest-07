import React, { useState } from 'react';
import { Target, Info, Plus, CheckCircle2, Circle } from 'lucide-react';

 function ReviewToDos({ initialTodos = [] }) {
  const [todos, setTodos] = useState(initialTodos);

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="relative w-full max-w-4xl p-6 md:p-8 rounded-2xl border border-[#a2a9f5] bg-[#f2f4ff] shadow-sm font-sans overflow-hidden">
      
      {/* Subtle top-right background glow matching the screenshot */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/50 rounded-full blur-3xl pointer-events-none" />

      {/* ==========================================
          HEADER
      ========================================== */}
      <div className="relative z-10 flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#6770f4] shadow-sm">
          <Target className="text-white w-5 h-5" strokeWidth={2.5} />
        </div>
        <h2 className="text-[18px] font-bold text-gray-900">
          Review To Do's & Goals
        </h2>
        <Info className="w-4 h-4 text-indigo-400 cursor-help" />
      </div>

      {/* ==========================================
          TO DO'S SECTION
      ========================================== */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-bold text-gray-800">To Do's</h3>
          
          <button 
            className="flex items-center gap-1.5 bg-[#5b64f0] hover:bg-[#4a53d3] text-white px-5 py-2 rounded-lg text-[14px] font-semibold transition-colors shadow-sm"
            onClick={() => {
              // Add a dummy task for testing
              setTodos([...todos, { id: Date.now(), text: "New priority task", completed: false }]);
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> Add
          </button>
        </div>

        {/* Dynamic Content Area */}
        {todos.length === 0 ? (
          /* EMPTY STATE (Exactly as seen in the screenshot) */
          <div className="w-full bg-white rounded-xl py-5 flex items-center justify-center shadow-sm">
            <span className="text-[14px] font-medium text-gray-500">
              No to-do's yet
            </span>
          </div>
        ) : (
          /* POPULATED STATE (If data is provided) */
          <div className="w-full bg-white rounded-xl shadow-sm divide-y divide-gray-100 overflow-hidden">
            {todos.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className="text-gray-400 hover:text-[#5b64f0] transition-colors"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#00a67e]" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <span className={`text-[15px] ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>
                  {todo.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default ReviewToDos;