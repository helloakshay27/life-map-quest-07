import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Play, Book, Video } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  frequency: string;
  schedule: string;
  participants: number;
  icon: string;
}

interface Recording {
  id: string;
  title: string;
  date: string;
  duration: string;
  description: string;
  thumbnail: string;
}

interface ReadingBook {
  id: string;
  title: string;
  author: string;
  progress: number;
  coverImage: string;
}

const upcomingEvents: Event[] = [
  {
    id: "1",
    title: "Join the AI Learners Group",
    description: "Learn to use the power of Artificial Intelligence to grow your business with daily learning in our whatsapp group",
    frequency: "Weekly",
    schedule: "Everyday",
    participants: 48,
    icon: "📅",
  },
  {
    id: "2",
    title: "Weekly Creation Meeting",
    description: "Join our weekly community session to connect, learn, and grow together. Share your wins, challenges, and insights from the week.",
    frequency: "Weekly",
    schedule: "Every Sunday",
    participants: 1234,
    icon: "📅",
  },
];

const pastRecordings: Recording[] = [
  {
    id: "1",
    title: "15-minute exercise at Home",
    date: "Feb 15, 2026",
    duration: "25 min",
    description: "In just 15 minutes, you can get back into shape, no matter where you are: home, office, hotel, or...",
    thumbnail: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop",
  },
  {
    id: "2",
    title: "Morning Motivation",
    date: "Jan 30, 2026",
    duration: "45 min",
    description: "Start your day with this amazing motivational video from Sandeep Maheshwari.",
    thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
  },
  {
    id: "3",
    title: "Ho'oponopono Guided Meditation",
    date: "Feb 15, 2026",
    duration: "16 min",
    description: "Learn this amazing Hawaiian meditation technique to handle any challenge you are facing in life.",
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop",
  },
  {
    id: "4",
    title: "Ho'oponopono Meditation for Deep Healing",
    date: "Feb 15, 2026",
    duration: "15 min",
    description: "Ho'oponopono is a simple, yet incredibly powerful practice that can create great change in your life.",
    thumbnail: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=250&fit=crop",
  },
  {
    id: "5",
    title: "Getting started with Life Compass & Weekly Creation",
    date: "Nov 23, 2025",
    duration: "90 min",
    description: "Getting started with Life Compass & Weekly Creation",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
  },
  {
    id: "6",
    title: "Create your week with Sandeep 16 Nov 2025",
    date: "Nov 16, 2025",
    duration: "60 min",
    description: "Amazing new ways to create your week with feedback from participants.",
    thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=250&fit=crop",
  },
  {
    id: "7",
    title: "The Life Compass App",
    date: "Nov 2, 2025",
    duration: "127 min",
    description: "We launching the Life Compass App to manage your entire life with one app.",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop",
  },
  {
    id: "8",
    title: "The Power of Now",
    date: "Oct 26, 2025",
    duration: "72 min",
    description: "Exploring the power of staying in the present moment.",
    thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=250&fit=crop",
  },
  {
    id: "9",
    title: "The Power of Discipline",
    date: "Oct 18, 2025",
    duration: "73 min",
    description: "Catch tomorrow and tie it with Unstoppable Success. This session connects the seminar...",
    thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop",
  },
];

const EventCard = ({ event }: { event: Event }) => (
  <Card className="p-6 hover:shadow-lg transition-shadow">
    <div className="flex items-start gap-4">
      <div className="text-4xl">{event.icon}</div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-foreground mb-2">{event.title}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded">
            {event.frequency}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {event.schedule}
          </span>
          <span className="inline-flex items-center gap-1">
            👥 {event.participants}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
        <div className="flex items-center gap-2">
          <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2">
            <Play className="w-4 h-4" />
            Join Now
          </button>
          <span className="text-sm text-muted-foreground">Participants: {event.participants}</span>
        </div>
      </div>
    </div>
  </Card>
);

const RecordingCard = ({ recording }: { recording: Recording }) => {
  const [isHovering, setIsHovering] = useState(false);

  const handlePlayClick = () => {
    alert(`Playing video: ${recording.title}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group">
      <div
        className="aspect-video overflow-hidden bg-muted relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          src={recording.thumbnail}
          alt={recording.title}
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
        <h3 className="font-semibold text-foreground text-sm mb-2">{recording.title}</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {recording.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {recording.duration}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{recording.description}</p>
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
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-heading text-foreground">Learn & Connect</h1>
        <p className="text-body-4 text-muted-foreground">Join sessions, watch recordings, and track your reading</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "events" | "movies" | "reading")}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "events" && (
        <div className="space-y-8">
          {/* Upcoming Events */}
          <div className="space-y-4">
            <h2 className="text-title-1 text-foreground">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>

          {/* Past Session Recordings */}
          <div className="space-y-4">
            <h2 className="text-title-1 text-foreground">Past Session Recordings</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pastRecordings.map((recording) => (
                <RecordingCard key={recording.id} recording={recording} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "movies" && (
        <div className="space-y-4">
          <h2 className="text-title-1 text-foreground">Movies & Books</h2>
          <p className="text-body-5 text-muted-foreground">
            Explore curated movies and books for personal growth
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pastRecordings.slice(0, 6).map((recording) => (
              <RecordingCard key={recording.id} recording={recording} />
            ))}
          </div>
        </div>
      )}

      {activeTab === "reading" && (
        <div className="space-y-4">
          <h2 className="text-title-1 text-foreground">Reading List</h2>
          <div className="bg-muted/50 rounded-lg p-12 text-center">
            <Book className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Books Yet</h3>
            <p className="text-body-5 text-muted-foreground mb-4">
              Start tracking your personal development reading journey
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
              Add Your First Book
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnAndConnect;
