import { useState, useMemo } from "react";
import {
  BookOpen,
  FileText,
  HelpCircle,
  MessageCircle,
  Users,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Search,
  Video,
  Download,
  Play,
  Clock,
  Calendar,
  Star,
  CheckCircle,
  ArrowRight,
  Mail,
  MessageSquare,
  Phone,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  image: string;
  category: "tutorial" | "guide" | "faq";
}

interface GuideSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  content: {
    heading: string;
    description?: string;
    items?: string[];
    subSections?: {
      title: string;
      items: string[];
    }[];
  }[];
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: FAQItem[];
}

const tutorials: Tutorial[] = [
  {
    id: "1",
    title: "How to set Priorities (English)",
    description: "How to select what to prioritize using the Wheel of Life and Eisenhower Matrix.",
    duration: "5 min",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    category: "tutorial",
  },
  {
    id: "2",
    title: "How to set Priorities (Hindi)",
    description: "How to select what to prioritize using the Wheel of Life and Eisenhower Matrix.",
    duration: "5 min",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    category: "tutorial",
  },
  {
    id: "3",
    title: "Setting up your Vision Board",
    description: "In this session, we talked about how you can manifest your entire 2026 using an interesting...",
    duration: "60 min",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    category: "tutorial",
  },
  {
    id: "4",
    title: "Getting started with Life Compass & Weekly Creation",
    description: "Here we discuss how to get started with the Life Compass app, how to fill daily and weekly...",
    duration: "90 min",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
    category: "tutorial",
  },
];

const faqCategories: FAQCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    color: "bg-blue-500",
    items: [
      {
        id: "1",
        question: "How do I get started with Life Compass?",
        answer: "Begin by setting up your profile, defining your core values, and creating your vision statement. Then start with daily journaling to establish the habit. We recommend spending 10-15 minutes daily to journal and reflect on your progress.",
      },
      {
        id: "2",
        question: "Is there a free trial available?",
        answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required to get started.",
      },
      {
        id: "3",
        question: "How long does it take to set up my account?",
        answer: "It takes about 5-10 minutes to create your account and complete your initial profile setup. You can start journaling immediately.",
      },
      {
        id: "4",
        question: "Can I use Life Compass on mobile?",
        answer: "Yes, Life Compass is fully responsive and works seamlessly on both desktop and mobile devices.",
      },
    ],
  },
  {
    id: "daily-weekly",
    title: "Daily & Weekly Journals",
    icon: "📔",
    color: "bg-purple-500",
    items: [
      {
        id: "1",
        question: "What is the difference between daily and weekly journals?",
        answer: "Daily journals capture your daily reflections, gratitude, and progress. Weekly journals are for strategic reviews, identifying patterns, and planning your next week based on Quadrant 2 priorities.",
      },
      {
        id: "2",
        question: "What if I miss a day journaling?",
        answer: "Don't worry! You can fill in past entries anytime. Life Compass tracks your longest streak, so focus on consistency rather than perfection.",
      },
      {
        id: "3",
        question: "Can I export my journal entries?",
        answer: "Yes, you can export your journal entries as PDF or in other formats from your dashboard settings.",
      },
      {
        id: "4",
        question: "How long should my journal entries be?",
        answer: "There's no minimum or maximum length. Even 5-10 minutes of reflection is valuable. Quality matters more than quantity.",
      },
      {
        id: "5",
        question: "How does auto-import from daily journals work?",
        answer: "The auto-import feature automatically pulls insights from your daily journal entries when creating your weekly review, saving you time and ensuring consistency.",
      },
    ],
  },
  {
    id: "goals-progress",
    title: "Goals & Progress",
    icon: "🎯",
    color: "bg-orange-500",
    items: [
      {
        id: "1",
        question: "How many goals should I set?",
        answer: "We recommend starting with 5-10 goals across different life areas (career, health, relationships, finance, personal growth). Focus on quality over quantity.",
      },
      {
        id: "2",
        question: "What is a powerful goal structure?",
        answer: "A powerful goal should be specific, measurable, aligned with your values, have a clear target date, and be broken into milestones. Link it to your core values for better motivation.",
      },
      {
        id: "3",
        question: "How do I update goal progress?",
        answer: "You can update your progress percentage, add progress notes with dates, and mark milestones as complete. Review your goals weekly to ensure you're on track.",
      },
      {
        id: "4",
        question: "Should my goals be linked to anything?",
        answer: "Yes! Link your goals to your core values and KRAs when applicable. This creates alignment across your life and keeps you motivated.",
      },
      {
        id: "5",
        question: "How can I overcome limiting beliefs?",
        answer: "Use the Limiting Beliefs tool to identify beliefs, examine evidence for and against them, understand their impact, and create empowering reframes.",
      },
    ],
  },
  {
    id: "features-tools",
    title: "Features & Tools",
    icon: "✨",
    color: "bg-green-500",
    items: [
      {
        id: "1",
        question: "What is the Wheel of Life?",
        answer: "The Wheel of Life is a visual assessment tool that helps you evaluate balance across 8 life areas: career, finances, health, family, relationships, spirituality, fun, and personal growth.",
      },
      {
        id: "2",
        question: "How do I use the Vision Board?",
        answer: "Create your vision board by adding images, quotes, and goals that represent your ideal future. Display it on your dashboard or print it as a physical reminder.",
      },
      {
        id: "3",
        question: "What are KRAs and why do I need them?",
        answer: "KRAs (Key Result Areas) help you assess performance across critical dimensions. Business owners use 7 owner KRAs; team members use 7 different KRAs. They're rated 1-5 and tracked monthly or quarterly.",
      },
      {
        id: "4",
        question: "How does the habit tracker work?",
        answer: "Create habits with frequency, target days, and categories. Track completion daily, view your streak, and see completion patterns in analytics to identify correlations with energy levels.",
      },
      {
        id: "5",
        question: "What is the bucket list feature?",
        answer: "Your bucket list stores dreams and adventures you want to complete in your lifetime. Track progress, link to goals and values, and celebrate completions with badges.",
      },
      {
        id: "6",
        question: "Can I track relationships in the app?",
        answer: "Yes! Create relationship profiles with important dates, interests, and contact info. Log interactions, set contact reminders, and track relationship health ratings.",
      },
    ],
  },
  {
    id: "analytics-insights",
    title: "Analytics & Insights",
    icon: "📊",
    color: "bg-indigo-500",
    items: [
      {
        id: "1",
        question: "How does the alignment score work?",
        answer: "Your alignment score measures how well you're living your mission based on your daily actions, goal progress, and habit completion. Higher scores indicate better alignment.",
      },
      {
        id: "2",
        question: "How is my energy trend calculated?",
        answer: "The energy trend shows your 7-day average energy level from your daily journal entries. Use this to identify patterns and what impacts your energy.",
      },
      {
        id: "3",
        question: "What insights does AI provide?",
        answer: "Our AI identifies patterns that boost or drain your energy, correlates habits with outcomes, provides personalized recommendations, and celebrates your progress.",
      },
      {
        id: "4",
        question: "Can I compare data over time?",
        answer: "Yes, the analytics page shows line charts for energy and mood, radar charts for life balance, and progress tracking across all life areas.",
      },
    ],
  },
  {
    id: "best-practices",
    title: "Best Practices",
    icon: "💡",
    color: "bg-pink-500",
    items: [
      {
        id: "1",
        question: "What is Quadrant 2 planning?",
        answer: "Quadrant 2 includes important but not urgent tasks - the strategic priorities that drive long-term success. Block time for these during your weekly planning.",
      },
      {
        id: "2",
        question: "How can I build consistency with journaling?",
        answer: "Journal at the same time daily, use reminders, start small, share your commitment with an accountability partner, and focus on progress over perfection.",
      },
      {
        id: "3",
        question: "Should I connect with other users?",
        answer: "Yes! Join our community for support and motivation. Share your commitment, find accountability partners, and celebrate wins together.",
      },
      {
        id: "4",
        question: "How often should I review my progress?",
        answer: "Review daily entries each evening, complete weekly reviews every 7 days, monthly reviews for goals and bucket list, and quarterly reviews for major milestones.",
      },
      {
        id: "5",
        question: "What if I fail to maintain my habits?",
        answer: "Remember that growth isn't linear. Focus on progress, not perfection. When you slip, simply restart without judgment and identify what triggered the slip.",
      },
    ],
  },
  {
    id: "technical-account",
    title: "Technical & Account",
    icon: "⚙️",
    color: "bg-red-500",
    items: [
      {
        id: "1",
        question: "How secure is my data?",
        answer: "We use industry-standard encryption and security protocols to protect your data. Your privacy is our top priority.",
      },
      {
        id: "2",
        question: "Can I delete my account?",
        answer: "Yes, you can delete your account from your settings. All your data will be permanently removed.",
      },
      {
        id: "3",
        question: "How do I reset my password?",
        answer: "Click 'Forgot Password' on the login page and follow the instructions sent to your email.",
      },
      {
        id: "4",
        question: "Is there a backup system?",
        answer: "Yes, your data is automatically backed up regularly to ensure no data loss.",
      },
      {
        id: "5",
        question: "Do I need an internet connection?",
        answer: "Life Compass works best with an internet connection, but some features can work offline with our mobile app.",
      },
    ],
  },
  {
    id: "advanced-usage",
    title: "Advanced Usage",
    icon: "🔧",
    color: "bg-blue-600",
    items: [
      {
        id: "1",
        question: "Can I use different goals for different scenarios?",
        answer: "Yes, you can create multiple goal sets and switch between them. This is useful for different life scenarios or planning horizons.",
      },
      {
        id: "2",
        question: "How do I integrate with other apps or calendars?",
        answer: "We support integrations with popular calendar and productivity tools. Check settings for available integrations.",
      },
      {
        id: "3",
        question: "Can I customize the app layout?",
        answer: "Yes, you can customize your dashboard by choosing which widgets to display and rearranging them.",
      },
      {
        id: "4",
        question: "Is there an API for developers?",
        answer: "Yes, we offer an API for advanced users and developers. Check our documentation for details.",
      },
      {
        id: "5",
        question: "How do I use the coaching features?",
        answer: "Access live coaching sessions, masterclasses, and Q&A sessions from the Learn Hub. Past recordings are available for reference.",
      },
    ],
  },
];

const guideSections: GuideSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    color: "bg-blue-500",
    content: [
      {
        heading: "Welcome to Life Compass",
        description: "Life Compass is your personal growth companion designed to help you align daily actions with your deepest values and long-term vision. This comprehensive guide will walk you through every feature to help you make the most of your journey.",
        subSections: [
          {
            title: "Your Journey Begins",
            items: [
              "Start with your Vision - Define what truly matters to you",
              "Create your KRAs - Key Result Areas that guide your life",
              "Design your Goals & Habits - Transform vision into habits",
              "Begin Daily Journaling - Align every day with your progress",
              "Complete weekly reflections - See insights and strategic planning",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "vision-values",
    title: "Vision & Values",
    icon: "👁️",
    color: "bg-red-500",
    content: [
      {
        heading: "Core Values",
        description: "Your values are the foundation of everything in Life Compass. This guide your decisions, pursuits, and daily actions.",
        items: [
          "Define up to 10 core values with descriptions",
          "Prioritize values (10 to ranking)",
          "Link goals and habits to your core values",
          "Custom values to align with your priorities",
          "Track which values you're living in your daily journals",
        ],
      },
      {
        heading: "Life Mission",
        description: "Your mission statement defines your purpose - only you can stitch it all. This becomes your North Star for decision-making.",
        items: [
          "Write a powerful mission statement",
          "Update as you evolve",
        ],
      },
      {
        heading: "My Big Plan",
        items: [
          "Plan a bucket-list activity & align with future",
          "Set timelines and resource requirements",
          "Break it process, timelines & stretch plans",
          "Update progress weekly in strategic planning",
        ],
      },
      {
        heading: "Vision Statement",
        description: "Your vision is a picture of your ideal future. Where do you see yourself in 10 years? What will your life feel like?",
        items: [
          "Be specific and paint a vivid, heartfelt picture",
          "Refine based on feedback, insights, and plans",
          "Use this to guide decision-making",
          "Refer to your vision monthly to stay focused",
        ],
      },
      {
        heading: "Vision Board",
        description: "Visualize your dreams, goals, and ideal future. Visual reminders keep you motivated and focused.",
        items: [
          "Check inspiration on your dashboard or wall display",
          "Personalize with images, quotes, and goals",
        ],
      },
      {
        heading: "Affirmations",
        description: "Create positive statements that reinforce your identity and goals. Daily affirmations strengthen your mindset for success.",
        items: [
          "Write 5-10 powerful affirmations",
          "Include language like 'I am', 'I will', 'I create'",
          "Revisit weekly and update as needed",
          "Review positive statements in gratitude planning",
        ],
      },
      {
        heading: "Be-Do-Have Exercise",
        description: "This powerful framework helps you align who you want to be with the actions you take and results you achieve.",
        items: [
          "1. WHO will you need to be to achieve your goals",
          "2. DO: what actions will habits and behaviors show your life",
          "3. HAVE: what results & goals will align you with your success",
          "Use insights to guide daily journaling",
        ],
      },
    ],
  },
  {
    id: "daily-journal",
    title: "Daily Journal",
    icon: "📔",
    color: "bg-purple-500",
    content: [
      {
        heading: "Why Daily Journaling Matters",
        description: "Daily reflection is the heartbeat of personal growth. It helps with awareness, track progress, and keep you aligned with your mission.",
      },
      {
        heading: "Journaling Framework",
        items: [
          "Gratitude - Start with 3 things you're grateful for",
          "Intentions - Set 3 main priorities for the day",
          "Reflections - Capture wins, lessons, and insights",
          "To-Dos - Track tasks aligned with your goals",
          "Mood & Energy - Monitor your well-being and patterns",
        ],
      },
      {
        heading: "Tips for Consistent Journaling",
        items: [
          "Journal at the same time each day (morning or evening)",
          "Keep it simple - 5-10 minutes is enough",
          "Be honest and authentic in your reflections",
          "Review weekly patterns to spot insights",
          "Use prompts when you're stuck or need inspiration",
        ],
      },
    ],
  },
  {
    id: "weekly-journal",
    title: "Weekly Journal",
    icon: "📊",
    color: "bg-cyan-500",
    content: [
      {
        heading: "Strategic Weekly Review",
        description: "Weekly journaling is where daily data becomes strategic wisdom. Step back, see patterns, and plan intentionally.",
      },
      {
        heading: "Week at a Glance",
        items: [
          "Weekly Story - Narrative of your week, accomplishments, learnings, feelings",
          "Top Wins - Celebrate victories across all life areas",
          "Biggest Challenge - Identify obstacles and their root causes",
          "Balance Rating (1-10) - Overall life balance assessment",
        ],
      },
      {
        heading: "Reflecting on the Past",
        items: [
          "Value Most Lived - Which core value showed up most",
          "Mission Reflection - How your mission guided you",
          "Habit Summary - Overall habit completion review",
          "Bucket List Progress - Advancement toward dreams",
          "Key Insights - Major learnings and breakthroughs",
        ],
      },
      {
        heading: "Planning for the Future",
        items: [
          "Strategic Priorities (Quadrant 2) - Important but not urgent tasks for each life area",
          "Goals to Focus - Select 2-3 goals for concentrated effort",
          "Say NO To - What you'll decline to protect your priorities",
        ],
      },
      {
        heading: "Auto-Import Magic",
        description: "Click 'Import from Daily Journals' to automatically populate insights from your daily entries - saves time and ensures consistency.",
      },
    ],
  },
  {
    id: "goals-growth",
    title: "Goals & Growth",
    icon: "🎯",
    color: "bg-green-500",
    content: [
      {
        heading: "Goal Setting Framework",
        description: "Goals translate your vision into actionable objectives. Life Compass helps you set, track, and achieve meaningful goals.",
      },
      {
        heading: "Creating Powerful Goals",
        items: [
          "Title - Clear, specific goal statement",
          "Life Area - Career, Health, Relationships, Personal Growth, Finance",
          "Description - Detailed vision of success",
          "Status - Planning → Started → Progress → Completed",
          "Progress % - Visual tracking of completion",
          "Target Date - Deadline for achievement",
          "Linked Values - Connect to your core values",
        ],
      },
      {
        heading: "Milestones",
        items: [
          "Break large goals into smaller milestones with target dates",
          "Each milestone can have its own completion status",
          "Makes big goals less overwhelming",
          "Provides regular wins and motivation",
          "Helps identify if you're on track",
        ],
      },
      {
        heading: "Progress Notes",
        description: "Add dated notes to document progress, obstacles, and learnings. Creates a valuable record of your journey.",
      },
      {
        heading: "Limiting Beliefs",
        items: [
          "Identify beliefs that hold you back",
          "For each belief, examine evidence for/against",
          "Understand the impact of the belief",
          "Create empowering reframes",
          "Example: 'I'm not good enough' → 'I am constantly learning and growing'",
        ],
      },
      {
        heading: "Behavioral Patterns",
        items: [
          "1. Describe the recurring behavior",
          "2. Identify what triggers it",
          "3. Understand the underlying emotion/need",
          "4. Define the desired new behavior",
          "5. Create specific change strategies",
        ],
      },
    ],
  },
  {
    id: "bucket-list",
    title: "Bucket List",
    icon: "🌟",
    color: "bg-yellow-500",
    content: [
      {
        heading: "Your Dream List",
        description: "Bucket list items are experiences, achievements, or adventures you want to complete in your lifetime.",
      },
      {
        heading: "Item Details",
        items: [
          "Title - What you want to do/achieve",
          "Description - Why it matters and what it entails",
          "Category - Travel, Career, Personal, Adventure, Learning, etc.",
          "Status - Dreaming → Planning → In Progress → Completed",
          "Linked Goals - Connect to specific goals",
          "Linked Values - Tie to your core values",
        ],
      },
      {
        heading: "Progress Tracking",
        items: [
          "Add timestamped notes as you make progress",
          "When completed, record the completion date and reflect on the experience",
        ],
      },
      {
        heading: "Integration",
        items: [
          "Bucket list items appear in weekly journal reviews",
          "Track progress in daily journal entries",
          "See completion stats on dashboard",
          "Celebrate achievements with badges",
        ],
      },
    ],
  },
  {
    id: "people-relationships",
    title: "People & Relationships",
    icon: "👥",
    color: "bg-pink-500",
    content: [
      {
        heading: "Relationship Management",
        description: "Meaningful relationships require intentional effort. Life Compass helps you nurture important connections.",
      },
      {
        heading: "Person Profile",
        items: [
          "Basic Info - Name, photo, relationship type",
          "Importance Level - 1-5 star priority rating",
          "Key Dates - Birthday, anniversary, other important dates",
          "Interests & Preferences - Hobbies, likes, conversation topics",
          "Contact Info - Phone, email, social media",
          "Current Situation - What's happening in their life",
        ],
      },
      {
        heading: "Interaction History",
        items: [
          "Log every meaningful interaction - calls, meetings, gifts, messages",
          "Add follow-up reminders and notes",
        ],
      },
      {
        heading: "Relationship Health",
        items: [
          "Health Rating (1-5) - Current relationship strength",
          "Last Meaningful Interaction - Track time since deep connection",
          "Desired Contact Frequency - Set reminders",
          "Relationship Goals - What you want to build/improve",
          "Support Opportunities - How you can help them",
        ],
      },
      {
        heading: "Dashboard Reminders",
        description: "Upcoming birthdays, overdue check-ins, and relationship insights appear on your dashboard to prompt action.",
      },
    ],
  },
  {
    id: "habits",
    title: "Habits & Consistency",
    icon: "⚡",
    color: "bg-indigo-500",
    content: [
      {
        heading: "Habit Tracking System",
        description: "Habits are the building blocks of your ideal life. Consistent small actions compound into extraordinary results.",
      },
      {
        heading: "Creating Habits",
        items: [
          "Title - Clear habit name",
          "Description - What exactly you'll do",
          "Frequency - Daily, Weekly, or Custom days",
          "Target Days - Select specific days for weekly/custom",
          "Category - Health, Productivity, Mindfulness, etc.",
          "Linked Goals - Connect to relevant goals",
        ],
      },
      {
        heading: "Daily Tracking",
        items: [
          "Mark complete in Daily Journal tab",
          "Quick toggle in Dashboard Habit Card",
          "View completion calendar and streaks",
          "Add notes for specific days",
        ],
      },
      {
        heading: "Analytics",
        items: [
          "Completion rate percentage",
          "Current streak vs. best streak",
          "Weekly completion patterns",
          "Correlation with energy and alignment scores",
        ],
      },
      {
        heading: "Weekly Review",
        description: "Habit summary auto-imports into weekly journal, helping you spot patterns and adjust strategies.",
      },
    ],
  },
  {
    id: "kra",
    title: "KRA (Key Result Areas)",
    icon: "📈",
    color: "bg-orange-500",
    content: [
      {
        heading: "For Business Owners & Leaders",
        description: "KRA evaluations help you assess performance across critical business and leadership dimensions.",
      },
      {
        heading: "MD/Owner Evaluation (7 KRAs)",
        items: [
          "Vision & Strategy - Clarity and direction",
          "Systems & Processes - Operational efficiency",
          "Leadership & Team - People management",
          "Financial Health - Fiscal performance",
          "Growth & Sales Engine - Revenue generation",
          "Innovation & Technology - Adaptation",
          "Personal Growth & Delegation - Self-development",
        ],
      },
      {
        heading: "Team Member Evaluation (7 KRAs)",
        items: [
          "Goal Clarity & Alignment",
          "Ownership & Accountability",
          "Process Discipline",
          "Collaboration & Communication",
          "Learning & Innovation",
          "Client/Stakeholder Focus",
          "Reliability & Consistency",
        ],
      },
      {
        heading: "Scoring System",
        items: [
          "Each KRA is rated 1-5",
          "Total score (max 35) tracks improvement over time",
          "Complete monthly or quarterly",
          "Track trends in each area",
          "Identify strengths and weaknesses",
          "Set improvement targets",
        ],
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Insights",
    icon: "📉",
    color: "bg-teal-500",
    content: [
      {
        heading: "Data-Driven Growth",
        description: "Life Compass transforms your journal entries into actionable insights and trends.",
      },
      {
        heading: "Dashboard Metrics",
        items: [
          "Energy Trend - 7-day average energy levels",
          "Alignment Score - How well you're living your mission",
          "Journaling Streak - Consecutive days logged",
          "Active Goals - Progress across life areas",
          "Recent Achievements - Latest completions",
        ],
      },
      {
        heading: "Analytics Page",
        items: [
          "Energy & Mood Trends - Line charts over time",
          "Life Balance Radar - 5 life areas comparison",
          "Values Alignment - Which values you're living most",
          "Goal Progress - Visual tracking per area",
          "Habit Completion - Success rates and patterns",
          "Weekly Reflection Insights - Key themes",
        ],
      },
      {
        heading: "AI-Powered Insights",
        items: [
          "Pattern Recognition - Identify what boosts/drains energy",
          "Correlation Analysis - Connect habits to outcomes",
          "Personalized Recommendations - Actions based on your data",
          "Progress Celebrations - Recognize improvements",
        ],
      },
    ],
  },
  {
    id: "achievements",
    title: "Achievements & Gamification",
    icon: "🏆",
    color: "bg-violet-500",
    content: [
      {
        heading: "Badge System",
        description: "Earn badges for milestones and consistent effort. Gamification makes growth fun and motivating.",
      },
      {
        heading: "Badge Categories - Journaling",
        items: [
          "First Entry",
          "7-Day Streak",
          "30-Day Streak",
          "Perfect Week",
          "Monthly Champion",
          "Centurion (100 entries)",
        ],
      },
      {
        heading: "Badge Categories - Quality",
        items: [
          "Insight Seeker",
          "Gratitude Guru",
          "Alignment Ace",
          "Challenge Conqueror",
        ],
      },
      {
        heading: "Badge Categories - Planning",
        items: [
          "Strategic Master",
          "No-Saying Ninja",
          "Goal Aligner",
          "Value Champion",
        ],
      },
      {
        heading: "Badge Categories - Consistency",
        items: [
          "Weekly Warrior",
          "Habit Hero",
          "Reflection Regular",
        ],
      },
      {
        heading: "Leaderboard",
        items: [
          "Compete (friendly!) with other users",
          "Most Daily Entries",
          "Longest Streak",
          "Most Completed Goals",
          "Total Badges Earned",
          "Highest Alignment Scores",
        ],
      },
    ],
  },
  {
    id: "learn-hub",
    title: "Learn Hub",
    icon: "📚",
    color: "bg-sky-500",
    content: [
      {
        heading: "Video Tutorials",
        description: "Step-by-step video guides on using every feature effectively. Perfect for visual learners.",
      },
      {
        heading: "Events & Sessions",
        items: [
          "Join live coaching sessions, accountability groups, and community workshops",
          "Weekly group calls",
          "Monthly masterclasses",
          "Q&A sessions",
          "Access to past recordings",
        ],
      },
      {
        heading: "Reading List",
        items: [
          "Track personal development books you want to read or are currently reading",
          "Progress percentage tracking",
          "Target completion dates",
          "Rating and notes",
          "Categories for organization",
        ],
      },
    ],
  },
  {
    id: "tips-success",
    title: "Tips for Success",
    icon: "💡",
    color: "bg-lime-500",
    content: [
      {
        heading: "Daily Practices",
        items: [
          "Journal at the same time daily - build the habit",
          "Complete your journal before bed - process the day",
          "Review tomorrow's priorities first thing in morning",
          "Track at least 3 things that went well every day",
        ],
      },
      {
        heading: "Weekly Practices",
        items: [
          "Block 30-60 minutes for your weekly review",
          "Review your mission and values weekly",
          "Plan your week based on strategic priorities (Quadrant 2)",
          "Celebrate wins before diving into challenges",
        ],
      },
      {
        heading: "Monthly Practices",
        items: [
          "Review all goals and update progress",
          "Assess which goals need more focus",
          "Update your bucket list with new dreams",
          "Connect with key relationships",
          "Complete KRA evaluation if relevant",
        ],
      },
      {
        heading: "Making It Stick",
        items: [
          "Start small - daily journal only at first",
          "Use reminders and notifications",
          "Share your commitment with accountability partner",
          "Focus on progress, not perfection",
          "Review your data weekly to see growth",
          "Join the community for support and motivation",
        ],
      },
    ],
  },
  {
    id: "need-help",
    title: "Need Help?",
    icon: "❓",
    color: "bg-red-600",
    content: [
      {
        heading: "Still have questions?",
        description: "Check out our FAQ section or reach out to support.",
        items: [
          "Visit our FAQ section for quick answers",
          "Contact our support team for personalized assistance",
          "Join our community forum to connect with other users",
          "Watch video tutorials for step-by-step guidance",
          "Attend live Q&A sessions with our team",
        ],
      },
    ],
  },
];

const TutorialCard = ({ tutorial }: { tutorial: Tutorial }) => {
  const [isHovering, setIsHovering] = useState(false);

  const handlePlayClick = () => {
    alert(`Playing video: ${tutorial.title}`);
    // You can replace this with actual video playback logic
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div
        className="aspect-video overflow-hidden bg-muted relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={tutorial.image}
          alt={tutorial.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Play Button Overlay */}
        <button
          onClick={handlePlayClick}
          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-all duration-300 ${
            isHovering ? "opacity-100 bg-black/50" : "opacity-0"
          } hover:bg-black/60`}
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg">
            <Play className="w-8 h-8 text-blue-600 fill-blue-600 ml-1" />
          </div>
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            Tutorial
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {tutorial.duration}
          </span>
        </div>
        <h3 className="font-semibold text-foreground text-sm mb-2">{tutorial.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{tutorial.description}</p>
      </div>
    </Card>
  );
};

const GuideSection = ({ section }: { section: GuideSection }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${section.color} text-white p-4 rounded-lg flex items-center justify-between hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{section.icon}</span>
          <h2 className="text-lg font-semibold">{section.title}</h2>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Section Content */}
      {isOpen && (
        <div className="space-y-6 pl-4">
          {section.content.map((item, idx) => (
            <div key={idx} className="space-y-3">
              <div>
                <h3 className="text-base font-semibold text-foreground">{item.heading}</h3>
                {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
              </div>

              {item.items && (
                <ul className="space-y-2 ml-4">
                  {item.items.map((listItem, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-blue-500 font-bold mt-0.5">•</span>
                      <span>{listItem}</span>
                    </li>
                  ))}
                </ul>
              )}

              {item.subSections && (
                <div className="space-y-4 ml-4">
                  {item.subSections.map((sub, subIdx) => (
                    <div key={subIdx}>
                      <h4 className="font-semibold text-foreground text-sm mb-2">{sub.title}</h4>
                      <ol className="space-y-1 ml-4">
                        {sub.items.map((subItem, i) => (
                          <li key={i} className="text-sm text-foreground flex items-start gap-2">
                            <span className="text-blue-500 font-bold">{i + 1}.</span>
                            <span>{subItem}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const FAQCategorySection = ({ category }: { category: FAQCategory }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Category Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full ${category.color} text-white p-4 rounded-lg flex items-center justify-between hover:opacity-90 transition-opacity`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <h2 className="text-lg font-semibold">{category.title}</h2>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* FAQ Items */}
      {isOpen && (
        <div className="space-y-3 pl-4">
          {category.items.map((item) => (
            <div key={item.id} className="border border-border rounded-lg">
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full p-4 flex items-start justify-between gap-3 hover:bg-muted transition-colors"
              >
                <h3 className="text-sm font-medium text-foreground text-left">{item.question}</h3>
                <ChevronRight
                  className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
                    expandedItems.has(item.id) ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* Answer */}
              {expandedItems.has(item.id) && (
                <div className="px-4 pb-4 border-t border-border bg-muted/50">
                  <p className="text-sm text-muted-foreground">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HelpAndResources = () => {
  const [activeTab, setActiveTab] = useState<"tutorial" | "guide" | "faq">("tutorial");

  const tabs = [
    { id: "tutorial", label: "Tutorial", icon: BookOpen },
    { id: "guide", label: "Guide", icon: FileText },
    { id: "faq", label: "FAQ", icon: HelpCircle },
  ];

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl text-foreground">Help & Resources</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">Learn how to use Life Compass effectively</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-2 sm:gap-6 lg:gap-8 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "tutorial" | "guide" | "faq")}
                className={`flex items-center gap-1 sm:gap-2 py-3 px-3 sm:px-4 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="font-medium hidden xs:inline sm:inline">{tab.label}</span>
                <span className="font-medium xs:hidden sm:hidden">{tab.label.charAt(0)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "tutorial" && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl text-foreground">App Tutorials</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">Learn how to use Life Compass effectively</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {tutorials.map((tutorial) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "guide" && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl text-foreground">Complete App Guide</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">Your comprehensive guide to mastering Life Compass and accelerating your personal growth journey</p>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {guideSections.map((section) => (
              <GuideSection key={section.id} section={section} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "faq" && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl text-foreground">Frequently Asked Questions</h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">Find answers to common questions about Life Compass</p>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {faqCategories.map((category) => (
              <FAQCategorySection key={category.id} category={category} />
            ))}
          </div>

          {/* Still Have Questions Section */}
          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 sm:p-6 lg:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4">
              <div className="text-3xl sm:text-4xl">❓</div>
              <h2 className="text-xl sm:text-2xl font-bold text-center sm:text-left">Still Have Questions?</h2>
            </div>
            <p className="text-base sm:text-lg mb-6 opacity-90 text-center sm:text-left">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button className="bg-white text-blue-600 px-4 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-left">
                📧 Email Support
                <div className="text-sm opacity-75">support@lifecompass.com</div>
              </button>
              <button className="bg-white/20 border-2 border-white px-4 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors text-left">
                💬 Live Chat
                <div className="text-sm opacity-75">Chat with us Monday-Friday 9am-5pm EST</div>
              </button>
              <button className="bg-white/20 border-2 border-white px-4 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors text-left">
                🎯 Schedule a Call
                <div className="text-sm opacity-75">Book a 30-min consultation with our team</div>
              </button>
              <button className="bg-white/20 border-2 border-white px-4 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors text-left">
                🤝 Community Forum
                <div className="text-sm opacity-75">Connect with other Life Compass users</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpAndResources;
