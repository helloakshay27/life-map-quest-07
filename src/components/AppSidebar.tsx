import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Eye,
  MapPin,
  Target,
  CheckSquare,
  Users,
  BarChart3,
  Trophy,
  GraduationCap,
  HelpCircle,
  Medal,
  Calendar,
  Notebook,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Daily Journal", url: "/daily-journal", icon: BookOpen },
  { title: "Weekly Journal", url: "/weekly-journal", icon: Notebook },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Vision & Values", url: "/vision-values", icon: Eye },
  { title: "Bucket List", url: "/bucket-list", icon: MapPin },
  { title: "Goals & Habits", url: "/goals-habits", icon: Target },
  { title: "To Do's", url: "/todos", icon: CheckSquare },
  { title: "People", url: "/people", icon: Users },
  { title: "KRA", url: "/kra", icon: BarChart3 },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Achievements", url: "/achievements", icon: Trophy },
  { title: "Learn", url: "/learn", icon: GraduationCap },
  { title: "Help & Tutorial", url: "/help", icon: HelpCircle },
  { title: "Leaderboard", url: "/leaderboard", icon: Medal },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-5 text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
