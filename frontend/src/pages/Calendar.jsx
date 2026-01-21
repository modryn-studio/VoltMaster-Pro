import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const statusColors = {
  Quoted: "bg-blue-500/10 text-blue-400 border-blue-500/50",
  Scheduled: "bg-purple-500/10 text-purple-400 border-purple-500/50",
  "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/50",
  Complete: "bg-green-500/10 text-green-400 border-green-500/50",
};

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${API}/jobs`);
      setJobs(res.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getJobsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return jobs.filter(job => {
      if (job.scheduled_date) {
        return job.scheduled_date.split('T')[0] === dateStr;
      }
      // For demo: show jobs on their creation date if not scheduled
      return job.created_at?.split('T')[0] === dateStr;
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedDayJobs = getJobsForDate(selectedDate);

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="p-4 space-y-4" data-testid="calendar-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          data-testid="prev-month-btn"
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth(-1)}
          className="h-10 w-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <Button
          data-testid="next-month-btn"
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth(1)}
          className="h-10 w-10"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border-2 border-border rounded-lg overflow-hidden" data-testid="calendar-grid">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-slate-800">
          {DAYS.map(day => (
            <div key={day} className="p-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-14 bg-slate-900/50" />;
            }

            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const cellDateStr = cellDate.toISOString().split('T')[0];
            const isToday = cellDate.getTime() === today.getTime();
            const isSelected = cellDateStr === selectedDateStr;
            const dayJobs = getJobsForDate(cellDate);
            const hasJobs = dayJobs.length > 0;

            return (
              <button
                key={day}
                data-testid={`calendar-day-${day}`}
                onClick={() => setSelectedDate(cellDate)}
                className={cn(
                  "h-14 p-1 flex flex-col items-center justify-start border-t border-border transition-colors relative",
                  isSelected ? "bg-primary/20" : "hover:bg-slate-800",
                  isToday && "ring-2 ring-inset ring-primary"
                )}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isToday && "text-primary font-bold"
                )}>
                  {day}
                </span>
                {hasJobs && (
                  <div className="flex gap-0.5 mt-1">
                    {dayJobs.slice(0, 3).map((job, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          job.status === "Complete" ? "bg-green-400" :
                          job.status === "In Progress" ? "bg-amber-400" :
                          job.status === "Scheduled" ? "bg-purple-400" :
                          "bg-blue-400"
                        )}
                      />
                    ))}
                    {dayJobs.length > 3 && (
                      <span className="text-[8px] text-muted-foreground">+{dayJobs.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Jobs */}
      <div className="space-y-3">
        <h3 className="text-sm uppercase tracking-wider text-muted-foreground">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>

        {loading ? (
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        ) : selectedDayJobs.length === 0 ? (
          <div className="bg-slate-800/50 rounded-lg p-6 text-center">
            <p className="text-muted-foreground">No jobs scheduled</p>
          </div>
        ) : (
          selectedDayJobs.map(job => (
            <div
              key={job.id}
              data-testid={`calendar-job-${job.id}`}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="bg-card border-2 border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground truncate" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {job.customer_name}
                    </h4>
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                        statusColors[job.status]
                      )}
                    >
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{job.job_type}</p>
                  {job.customer_address && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{job.customer_address}</span>
                    </div>
                  )}
                </div>
                <span className="font-mono text-primary font-bold">
                  ${job.quote_total?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || 0}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
