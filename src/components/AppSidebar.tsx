import {
  LayoutDashboard,
  BookOpen,
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
  Heart,
  LineChart,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
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
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Daily Journal", url: "/daily-journal", icon: BookOpen },
  { title: "Weekly Journal", url: "/weekly-journal", icon: Notebook },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Vision & Values", url: "/vision-values", icon: Eye },
  { title: "Bucket List", url: "/bucket-list", icon: MapPin },
  { title: "Goals & Habits", url: "/goals-habits", icon: Target },
  { title: "To Do's", url: "/todos", icon: CheckSquare },
  { title: "People", url: "/people", icon: Users },
  { title: "For Family", url: "/for-family", icon: Heart },
  { title: "KRA", url: "/kra", icon: BarChart3 },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Achievements", url: "/achievements", icon: Trophy },
  { title: "Learn", url: "/learn", icon: GraduationCap },
  { title: "Help & Tutorial", url: "/help", icon: HelpCircle },
  { title: "Leaderboard", url: "/leaderboard", icon: Medal },
];

export function AppSidebar() {
  const { setOpenMobile, openMobile, state, toggleSidebar, isMobile } =
    useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      {/* ── Mobile/Tablet trigger button — fixed top-left, only shows below md ── */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 z-50 md:hidden flex items-center justify-center h-8 w-8 rounded-md bg-background border border-border shadow-sm hover:bg-accent transition-colors"
        aria-label="Open sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      <Sidebar
        collapsible="icon"
        className="border-r border-sidebar-border flex flex-col"
      >
        <SidebarContent
          className="pt-[56px] w-full flex-1 overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ overflowY: "auto" }}
        >
          {/* Toggle button — only desktop */}
          <div
            className={`hidden md:flex h-9 shrink-0 items-center border-b border-sidebar-border mb-1 ${
              isCollapsed ? "justify-center px-2" : "justify-end px-3"
            }`}
          >
            <button
              onClick={toggleSidebar}
              className="flex h-6 w-6 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              title="Toggle sidebar"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          <SidebarGroup className="py-1">
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/" || item.url === "/dashboard"}
                        onClick={() => setOpenMobile(false)}
                        className={`flex items-center w-full rounded-lg py-2.5 text-sidebar-foreground transition-all hover:bg-sidebar-accent overflow-hidden ${
                          isCollapsed && !isMobile
                            ? "justify-center px-0"
                            : "px-3 gap-3"
                        }`}
                        activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {(!isCollapsed || isMobile) && (
                          <span className="truncate text-sm">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </>
  );
}
