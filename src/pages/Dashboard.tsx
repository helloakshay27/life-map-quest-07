import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Target, CheckSquare, Trophy } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  const quickStats = [
    { label: "Journal Entries", value: "12", icon: BookOpen, color: "journal-section-green" },
    { label: "Active Goals", value: "5", icon: Target, color: "journal-section-orange" },
    { label: "To Do's", value: "8", icon: CheckSquare, color: "journal-section-blue" },
    { label: "Achievements", value: "3", icon: Trophy, color: "journal-section-yellow" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-heading text-foreground">Welcome back, {user?.name?.split(" ")[0]}!</h1>
        <p className="text-body-4 text-muted-foreground">Here's your life compass overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-6 text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-title-1 text-foreground">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
