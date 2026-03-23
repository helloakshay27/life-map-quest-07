import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Play, Book, Video } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  frequency: string;
  schedule: string;
  time: string;
  participants: number;
  password: string;
}

interface Recording {
  id: string;
  title: string;
  date: string;
  duration: string;
  description: string;
  thumbnail: string;
}

const upcomingEvents: Event[] = [
  {
    id: "1",
    title: "Join the AI Learners Group",
    description: "Learn to use the power of Artificial Intelligence to grow your business with daily learning in our whatsapp group.",
    frequency: "Weekly",
    schedule: "Everyday",
    time: "NA",
    participants: 48,
    password: "NA",
  },
  {
    id: "2",
    title: "Weekly Creation Meeting",
    description: "Join our weekly community session to connect, learn, and grow together. Share your wins, challenges, and insights from the week.",
    frequency: "Weekly",
    schedule: "Every Sunday",
    time: "8:30 AM - 10:00 AM EST",
    participants: 1234,
    password: "1234",
  },
];

const pastRecordings: Recording[] = [
  { id: "1", title: "15-minute exercise at Home", date: "Feb 15, 2026", duration: "25 min", description: "In just 15 minutes, you can get back into shape, no matter where you are: home, office, hotel, or...", thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop" },
  { id: "2", title: "Morning Motivation", date: "Jan 30, 2026", duration: "45 min", description: "Start your day with this amazing motivational video from Sandeep Maheshwari.", thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop" },
  { id: "3", title: "Ho'oponopono Guided Meditation", date: "Feb 15, 2026", duration: "16 min", description: "Learn this amazing Hawaiian meditation technique to handle any challenge you are facing in life.", thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop" },
  { id: "4", title: "Ho'oponopono Meditation for Deep Healing", date: "Feb 15, 2026", duration: "15 min", description: "Ho'oponopono is a simple, yet incredibly powerful practice.", thumbnail: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=250&fit=crop" },
  { id: "5", title: "Getting started with Life Compass & Weekly Creation", date: "Nov 23, 2025", duration: "90 min", description: "Getting started with Life Compass & Weekly Creation", thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop" },
  { id: "6", title: "Create your week with Sandeep 16 Nov 2025", date: "Nov 16, 2025", duration: "60 min", description: "Amazing new ways to create your week with feedback from participants.", thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=250&fit=crop" },
  { id: "7", title: "The Life Compass App", date: "Nov 2, 2025", duration: "127 min", description: "We launching the Life Compass App to manage your entire life with one app.", thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop" },
  { id: "8", title: "The Power of Now", date: "Oct 26, 2025", duration: "72 min", description: "Exploring the power of staying in the present moment.", thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop" },
  { id: "9", title: "The Power of Discipline", date: "Oct 18, 2025", duration: "73 min", description: "Catch tomorrow and tie it with Unstoppable Success.", thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop" },
];

/** Figma dashboard: terracotta primary, ~8px radius, 8px×16px padding */
const figmaPrimaryButton =
  "bg-[#D67455] text-white shadow-sm hover:bg-[#D67455]/92 active:bg-[#D67455]/85 rounded-md px-4 py-2 font-medium border-0 [&_svg]:text-white";

const EventCard = ({ event }: { event: Event }) => (
  <Card className="rounded-xl border border-[#E0E0E0]/90 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
    {/* Top: Icon + Title + Meta */}
    <div className="mb-4 flex items-start gap-3 sm:gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D67455] shadow-md sm:h-14 sm:w-14">
        <Calendar className="h-6 w-6 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="mb-2 text-base font-semibold leading-tight text-[#333333] sm:text-lg">{event.title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#D67455]/12 px-2.5 py-0.5 text-xs font-semibold text-[#D67455]">
            {event.frequency}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#E0E0E0]/80 px-2.5 py-0.5 text-xs text-[#333333]">
            <Calendar className="h-3 w-3" /> {event.schedule}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[#E0E0E0]/80 px-2.5 py-0.5 text-xs text-[#333333]">
            <Clock className="h-3 w-3" /> {event.time}
          </span>
        </div>
      </div>
    </div>

    <p className="mb-4 text-sm leading-relaxed text-[#666666]">{event.description}</p>

    {/* Action Row: stacks on mobile */}
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm sm:text-base ${figmaPrimaryButton}`}
      >
        <Video className="h-4 w-4" />
        Join Now
      </button>
      <div className="flex items-center justify-center whitespace-nowrap rounded-md border border-[#E0E0E0]/80 bg-[#FAFAFA] px-4 py-2.5 text-sm font-medium text-[#333333]">
        Password: <span className="ml-1 font-bold">{event.password}</span>
      </div>
    </div>
  </Card>
);

const RecordingCard = ({ recording }: { recording: Recording }) => {
  const [isHovering, setIsHovering] = useState(false);
  return (
    <Card className="group cursor-pointer overflow-hidden rounded-xl border border-[#E0E0E0]/90 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div
        className="relative aspect-video overflow-hidden bg-[#F2EFE9]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={recording.thumbnail}
          alt={recording.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-all duration-300 ${isHovering ? "opacity-100" : "opacity-0"}`}
          aria-label={`Play ${recording.title}`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
            <Play className="ml-1 h-6 w-6 fill-[#D67455] text-[#D67455]" />
          </div>
        </button>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-[#333333]">{recording.title}</h3>
        <div className="mb-2 flex items-center gap-3 text-xs text-[#666666]">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {recording.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {recording.duration}
          </span>
        </div>
        <p className="line-clamp-2 text-xs text-[#666666]">{recording.description}</p>
      </div>
    </Card>
  );
};

const LearnAndConnect = () => {
  const [activeTab, setActiveTab] = useState<"events" | "movies" | "reading">("events");
  const tabs = [
    { id: "events", label: "Events", icon: Calendar },
    { id: "movies", label: "Movies & Books", icon: Video },
    { id: "reading", label: "Reading List (0)", icon: Book },
  ];

  return (
    <div
      className="-m-2 md:-m-3 min-h-[calc(100vh-5rem)] animate-fade-in bg-[#F8F6F1] px-4 py-6 sm:px-6 lg:px-8"
      data-page="learn-connect"
    >
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#333333] sm:text-3xl">Learn & Connect</h1>
        <p className="mt-1 text-sm text-[#666666] sm:text-base">Join sessions, watch recordings, and track your reading</p>
      </div>

      {/* Tabs — Figma-style pill segment */}
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1 rounded-full border border-[#E0E0E0]/70 bg-[#F2EFE9] p-1 sm:min-w-0 sm:inline-flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as "events" | "movies" | "reading")}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-[#333333] shadow-sm"
                    : "text-[#666666] hover:text-[#333333]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "events" && (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#333333] sm:text-xl">Upcoming Events</h2>
            {/* 1 col on mobile, 2 col on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {upcomingEvents.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#333333] sm:text-xl">Past Session Recordings</h2>
            {/* 1 → 2 → 3 col */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {pastRecordings.map((recording) => <RecordingCard key={recording.id} recording={recording} />)}
            </div>
          </div>
        </div>
      )}

      {activeTab === "movies" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#333333] sm:text-xl">Movies & Books</h2>
          <p className="text-sm text-[#666666]">Explore curated movies and books for personal growth</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {pastRecordings.slice(0, 6).map((recording) => <RecordingCard key={recording.id} recording={recording} />)}
          </div>
        </div>
      )}

      {activeTab === "reading" && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#333333] sm:text-xl">Reading List</h2>
          <div className="rounded-xl border border-[#E0E0E0]/80 bg-[#FAFAFA] p-8 text-center sm:p-12">
            <Book className="mx-auto mb-4 h-12 w-12 text-[#666666] sm:h-16 sm:w-16" />
            <h3 className="mb-2 text-base font-semibold text-[#333333] sm:text-lg">No Books Yet</h3>
            <p className="mb-4 text-sm text-[#666666]">Start tracking your personal development reading journey</p>
            <button type="button" className={`inline-flex items-center justify-center px-6 py-2.5 text-sm sm:text-base ${figmaPrimaryButton}`}>
              Add Your First Book
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default LearnAndConnect;