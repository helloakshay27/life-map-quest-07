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

// Pallette-matched icons based on screenshots
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
  const { setOpenMobile, state, toggleSidebar, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <>
      {/* ── Mobile Trigger button — Terracotta/Cream colors ── */}
      <button
        onClick={toggleSidebar}
        // Background white, Tan border, muted olive default text, Terracotta text on cream hover
        className="fixed bottom-4 left-4 z-50 md:hidden flex items-center justify-center h-8 w-8 rounded-md bg-white border border-[#D6B99D] shadow-sm text-[#888780] hover:bg-[#FEF4EE] hover:text-[#DA7756] transition-colors outline-none"
        aria-label="Open sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      <Sidebar
        collapsible="icon"
        // White background, Tan right border
        className="border-r border-[#D6B99D] bg-white flex flex-col"
      >
        <SidebarContent
          // Content background white, hiding scrollbar
          className="pt-[56px] w-full flex-1 overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-white"
          style={{ overflowY: "auto" }}
        >
          {/* Toggle button — desktop header. White bg, Tan border bottom. */}
          <div
            className={`hidden md:flex h-9 shrink-0 items-center border-b border-[#D6B99D] bg-white mb-1 ${
              isCollapsed ? "justify-center px-2" : "justify-end px-3"
            }`}
          >
            <button
              onClick={toggleSidebar}
              // Icon muted olive gray, Cream background hover, Terracotta text hover
              className="flex h-6 w-6 items-center justify-center rounded-md text-[#888780] hover:bg-[#FEF4EE] hover:text-[#DA7756] transition-colors outline-none"
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
                        // Refined item base styling: Font medium, Charcoal foreground, Cream hover background.
                        // Icons use nesting arbitrary selector [&_svg]:text-color for default state.
                        className={`flex items-center w-full rounded-lg py-2.5 transition-all overflow-hidden font-medium text-[#2C2C2A] hover:bg-[#FEF4EE] [&_svg]:text-[#888780] hover:[&_svg]:text-[#DA7756] outline-none ${
                          isCollapsed && !isMobile
                            ? "justify-center px-0"
                            : "px-3 gap-3"
                        }`}
                        // Refined active styling: Terracotta background, White text, White icon via arbitrary active nesting.
                        activeClassName="bg-[#DA7756] text-white hover:bg-[#DA7756]/90 [&_svg]:text-white shadow-sm"
                      >
                        {/* Icon conditional color handled by NavLink specificity arbitrary variants */}
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