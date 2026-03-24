import { useState, useMemo, FormEvent, useEffect } from "react";
import { CalendarDays, Calendar, ExternalLink, Info, Plus, Trash2, AlertTriangle, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

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

interface CalendarItem {
  id: string;
  name: string;
  embedUrl: string;
}

interface CreateCalendarPayload {
  user_calendar: {
    name: string;
    embed_url: string;
  };
}

interface CreateCalendarResponse {
  id: string;
  name: string;
  embed_url: string;
}

interface UpdateCalendarPayload {
  user_calendar: {
    name: string;
    embed_url: string;
  };
}

interface UpdateCalendarResponse {
  id: string;
  name: string;
  embed_url: string;
}

const extractEmbedUrl = (rawValue: string): string | null => {
  const value = rawValue.trim();
  if (!value) return null;

  const iframeMatch = value.match(/src=["']([^"']+)["']/i);
  const candidate = iframeMatch?.[1] ?? value;

  try {
    const url = new URL(candidate);

    if (url.hostname.includes("google.com") && url.pathname.includes("/calendar")) {
      if (url.pathname.includes("/embed")) return url.toString();
      if (url.pathname.endsWith("/render")) {
        url.pathname = "/calendar/embed";
        return url.toString();
      }
    }

    if (url.pathname.includes("/calendar/embed")) return url.toString();
  } catch {
    return null;
  }

  return null;
};

const getCalendarsApi = async (): Promise<CreateCalendarResponse[]> => {
  const response = await fetchWithAuth("/user_calendars", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};

const createCalendarApi = async (payload: CreateCalendarPayload): Promise<CreateCalendarResponse> => {
  const response = await fetchWithAuth("/user_calendars", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("API Error Response:", { status: response.status, errorData });
    throw new Error(errorData?.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};

const updateCalendarApi = async (id: string, payload: UpdateCalendarPayload): Promise<UpdateCalendarResponse> => {
  const response = await fetchWithAuth(`/user_calendars/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};

const deleteCalendarApi = async (id: string): Promise<void> => {
  const response = await fetchWithAuth(`/user_calendars/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message || `Request failed with status ${response.status}`);
  }
};

/** Figma dashboard: terracotta primary, ~8px radius, 8px×16px padding */
const figmaPrimaryButton =
  "!bg-[#D67455] !text-white shadow-sm hover:!bg-[#D67455]/92 active:!bg-[#D67455]/85 rounded-md px-4 py-2 h-auto min-h-9 font-medium border-0 [&_svg]:!text-white";

const CalendarPage = () => {
  const [calendars, setCalendars] = useState<CalendarItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [calendarName, setCalendarName] = useState("");
  const [calendarUrl, setCalendarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        // Load from localStorage first
        const savedCalendars = localStorage.getItem("user_calendars");
        if (savedCalendars) {
          setCalendars(JSON.parse(savedCalendars));
          setIsLoading(false);
          return;
        }

        // Try API call
        const data = await getCalendarsApi();
        setCalendars(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            embedUrl: item.embed_url,
          }))
        );
        localStorage.setItem("user_calendars", JSON.stringify(data.map((item) => ({
          id: item.id,
          name: item.name,
          embedUrl: item.embed_url,
        }))));
      } catch (error) {
        // Silently fail and use empty array if API fails
        console.log("Using local storage for calendars");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendars();
  }, []);

  const hasCalendars = useMemo(() => calendars.length > 0, [calendars.length]);

  const handleAddCalendar = async (event: FormEvent) => {
    event.preventDefault();

    const embedUrl = extractEmbedUrl(calendarUrl);
    if (!embedUrl) {
      toast({
        title: "Invalid calendar link",
        description: "Please paste a valid Google Calendar embed URL or iframe code.",
      });
      return;
    }

    const name = calendarName.trim() || `Calendar ${calendars.length + 1}`;

    const payload: CreateCalendarPayload = {
      user_calendar: {
        name,
        embed_url: embedUrl,
      },
    };

    setIsSubmitting(true);

    try {
      // Try API first, fallback to local storage
      let data;
      try {
        data = await createCalendarApi(payload);
      } catch (apiError) {
        // If API fails, work locally
        console.log("API unavailable, saving locally");
        data = {
          id: crypto.randomUUID(),
          name,
          embed_url: embedUrl,
        };
      }

      const newCalendar = {
        id: data?.id ?? crypto.randomUUID(),
        name: data?.name ?? name,
        embedUrl: data?.embed_url ?? embedUrl,
      };

      setCalendars((prev) => {
        const updated = [...prev, newCalendar];
        localStorage.setItem("user_calendars", JSON.stringify(updated));
        return updated;
      });

      setCalendarName("");
      setCalendarUrl("");
      setShowAddForm(false);

      toast({
        title: "Calendar added",
        description: "Your calendar has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to add calendar",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCalendar = async (id: string) => {
    try {
      // Try API first
      try {
        await deleteCalendarApi(id);
      } catch (apiError) {
        console.log("API unavailable, deleting locally");
      }

      setCalendars((prev) => {
        const updated = prev.filter((calendar) => calendar.id !== id);
        localStorage.setItem("user_calendars", JSON.stringify(updated));
        return updated;
      });

      toast({
        title: "Calendar deleted",
        description: "Your calendar has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete calendar",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditCalendar = (calendar: CalendarItem) => {
    setEditingId(calendar.id);
    setEditName(calendar.name);
    setEditUrl(calendar.embedUrl);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditUrl("");
  };

  const handleUpdateCalendar = async (event: FormEvent) => {
    event.preventDefault();

    const embedUrl = extractEmbedUrl(editUrl);
    if (!embedUrl) {
      toast({
        title: "Invalid calendar link",
        description: "Please paste a valid Google Calendar embed URL or iframe code.",
      });
      return;
    }

    const name = editName.trim() || `Calendar`;

    const payload: UpdateCalendarPayload = {
      user_calendar: {
        name,
        embed_url: embedUrl,
      },
    };

    setIsUpdating(true);

    try {
      // Try API first, fallback to local
      let data;
      try {
        data = await updateCalendarApi(editingId!, payload);
      } catch (apiError) {
        console.log("API unavailable, updating locally");
        data = {
          id: editingId!,
          name,
          embed_url: embedUrl,
        };
      }

      setCalendars((prev) => {
        const updated = prev.map((cal) =>
          cal.id === editingId
            ? { ...cal, name: data?.name ?? name, embedUrl: data?.embed_url ?? embedUrl }
            : cal
        );
        localStorage.setItem("user_calendars", JSON.stringify(updated));
        return updated;
      });

      handleCancelEdit();

      toast({
        title: "Calendar updated",
        description: "Your calendar has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update calendar",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="-m-2 md:-m-3 min-h-[calc(100vh-5rem)] animate-fade-in bg-[#F8F6F1] px-4 py-6 sm:px-6 lg:px-8"
      data-page="calendar"
    >
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
        <div className="mt-1 rounded-md bg-[#D67455]/12 p-2 text-[#D67455]">
          <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#333333]">My Calendars</h1>
          <p className="mt-1 text-sm sm:text-base text-[#666666]">View and manage your schedules</p>
        </div>
      </div>

      {!hasCalendars && (
        <Card className="rounded-xl border border-[#E0E0E0]/90 bg-white shadow-sm">
          <CardContent className="flex min-h-[150px] sm:min-h-[200px] flex-col items-center justify-center gap-2 text-center p-4 sm:p-6">
            {isLoading ? (
              <>
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/60 animate-spin" />
                <p className="text-base sm:text-lg font-medium text-muted-foreground">Loading calendars...</p>
              </>
            ) : (
              <>
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/60" />
                <p className="text-base sm:text-lg font-medium text-muted-foreground">No calendars added yet</p>
                <p className="text-sm text-muted-foreground">Add your first calendar below to get started</p>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-xl border border-[#E0E0E0]/90 bg-white shadow-sm">
        <CardHeader className="p-4 pb-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-[#333333]">
            <Info className="h-4 w-4 shrink-0 text-[#D67455] sm:h-5 sm:w-5" />
            How to Embed Your Google Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="rounded-lg border border-[#E0E0E0]/80 bg-[#FAFAFA] p-3 sm:p-4">
            <h3 className="mb-3 text-base sm:text-lg font-semibold text-[#333333]">Step-by-Step Instructions:</h3>
            <ol className="list-decimal space-y-2 pl-4 sm:pl-5 text-sm sm:text-base text-[#666666] marker:font-semibold marker:text-[#D67455]">
              <li className="break-words">
                Go to{" "}
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[#D67455] underline underline-offset-2 hover:text-[#D67455]/90"
                >
                  Google Calendar <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li className="break-words">Click on Settings gear icon (top right) and open Settings</li>
              <li className="break-words">In left sidebar, select your calendar under "Settings for my calendars"</li>
              <li className="break-words">Scroll to "Integrate calendar" section</li>
              <li className="break-words">Copy URL from "Embed code" (inside the iframe src attribute)</li>
              <li className="break-words">Paste URL below and click Add Calendar</li>
            </ol>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 !text-yellow-600" />
            <AlertTitle className="text-sm font-semibold text-yellow-800">Note</AlertTitle>
            <AlertDescription className="text-sm text-yellow-800">
              Your calendar must be set to "Public" or "Make available to public" in Google Calendar settings for the embed to work.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-[#E0E0E0]/90 bg-white shadow-sm">
        <CardHeader className="p-4 pb-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base sm:text-lg text-[#333333]">Manage Calendars</CardTitle>
            <Button
              size="sm"
              onClick={() => setShowAddForm((prev) => !prev)}
              className={`w-full sm:w-auto ${figmaPrimaryButton}`}
            >
              <Plus className="h-4 w-4" />
              Add Calendar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
          {showAddForm && (
            <form onSubmit={handleAddCalendar} className="grid gap-3 rounded-lg border border-[#E0E0E0]/80 bg-[#F2EFE9]/40 p-3 sm:p-4">
              <Input
                value={calendarName}
                onChange={(event) => setCalendarName(event.target.value)}
                placeholder="Calendar name (optional)"
                className="text-sm"
                disabled={isSubmitting}
              />
              <Input
                value={calendarUrl}
                onChange={(event) => setCalendarUrl(event.target.value)}
                placeholder="Paste Google Calendar embed URL or iframe code"
                required
                className="text-sm"
                disabled={isSubmitting}
              />
              <Button type="submit" className={`w-full sm:w-auto ${figmaPrimaryButton}`} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </form>
          )}

          {calendars.length === 0 ? (
            <div className="rounded-lg border border-[#E0E0E0]/60 bg-[#FAFAFA] py-8 text-center text-sm text-[#666666] sm:py-10 sm:text-base">
              No calendars added yet. Click "Add Calendar" to get started.
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {calendars.map((calendar) => (
                <Card key={calendar.id} className="overflow-hidden rounded-xl border border-[#E0E0E0]/90 bg-white shadow-sm">
                  <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-[#E0E0E0]/80 bg-[#FAFAFA] py-3 px-4">
                    <CardTitle className="mr-2 flex-1 truncate text-sm text-[#333333] sm:text-base">{calendar.name}</CardTitle>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditCalendar(calendar)}
                        aria-label={`Edit ${calendar.name}`}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCalendar(calendar.id)}
                        aria-label={`Remove ${calendar.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>

                  {editingId === calendar.id && (
                    <CardContent className="border-b border-[#E0E0E0]/80 bg-[#F8F6F1]/80 p-3 sm:p-4">
                      <form onSubmit={handleUpdateCalendar} className="grid gap-3">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Calendar name"
                          className="text-sm"
                          disabled={isUpdating}
                        />
                        <Input
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          placeholder="Paste Google Calendar embed URL or iframe code"
                          required
                          className="text-sm"
                          disabled={isUpdating}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button type="submit" size="sm" className={figmaPrimaryButton} disabled={isUpdating}>
                            {isUpdating ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              "Update"
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-md border-[#E0E0E0] bg-white text-[#333333] hover:bg-[#F2EFE9]"
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  )}

                  <CardContent className="p-0">
                    <iframe
                      src={calendar.embedUrl}
                      title={calendar.name}
                      className="h-[400px] sm:h-[500px] lg:h-[600px] w-full border-0"
                      loading="lazy"
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
