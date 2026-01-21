import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, DollarSign, Briefcase, FileText, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusColors = {
  Quoted: "bg-blue-500/10 text-blue-400 border-blue-500/50",
  Scheduled: "bg-purple-500/10 text-purple-400 border-purple-500/50",
  "In Progress": "bg-amber-500/10 text-amber-400 border-amber-500/50",
  Complete: "bg-green-500/10 text-green-400 border-green-500/50",
};

const filters = ["All", "Quoted", "Active", "Complete"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ week_revenue: 0, active_jobs: 0, pending_quotes: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, statsRes] = await Promise.all([
        axios.get(`${API}/jobs`, { params: { status: activeFilter } }),
        axios.get(`${API}/stats`)
      ]);
      setJobs(jobsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.job_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-4 space-y-4" data-testid="dashboard">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          data-testid="search-input"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 bg-slate-800 border-2 border-slate-600 focus:border-primary text-lg"
        />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={DollarSign}
          label="This Week"
          value={formatCurrency(stats.week_revenue)}
          color="text-green-400"
          testId="stat-revenue"
        />
        <StatCard
          icon={Briefcase}
          label="Active Jobs"
          value={stats.active_jobs}
          color="text-primary"
          testId="stat-active"
        />
        <StatCard
          icon={FileText}
          label="Pending Quotes"
          value={stats.pending_quotes}
          color="text-amber-400"
          testId="stat-quotes"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2" data-testid="filter-chips">
        {filters.map((filter) => (
          <Button
            key={filter}
            data-testid={`filter-${filter.toLowerCase()}`}
            variant="outline"
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "filter-chip h-10 px-4 rounded-full border-2 font-semibold uppercase tracking-wide text-sm whitespace-nowrap touch-target",
              activeFilter === filter
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent border-slate-600 text-slate-400 hover:border-slate-500"
            )}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-3" data-testid="jobs-list">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No jobs found</p>
            <Button
              data-testid="create-first-job"
              onClick={() => navigate("/jobs/new")}
              className="mt-4 bg-primary text-primary-foreground"
            >
              Create Your First Job
            </Button>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onClick={() => navigate(`/jobs/${job.id}`)} />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, testId }) {
  return (
    <div
      data-testid={testId}
      className="bg-card border-2 border-border rounded-lg p-3 stat-card"
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-4 h-4", color)} strokeWidth={2.5} />
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn("text-xl font-bold mono-numbers", color)} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {value}
      </p>
    </div>
  );
}

function JobCard({ job, onClick }) {
  return (
    <div
      data-testid={`job-card-${job.id}`}
      onClick={onClick}
      className="job-card bg-card border-border rounded-lg p-4 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {job.customer_name}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{job.job_type}</p>
          {job.customer_address && (
            <p className="text-xs text-slate-500 truncate mt-1">{job.customer_address}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-1 text-xs font-bold uppercase tracking-wider border whitespace-nowrap",
              statusColors[job.status]
            )}
          >
            {job.status}
          </Badge>
          <span className="text-lg font-bold text-primary mono-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            ${job.quote_total?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
