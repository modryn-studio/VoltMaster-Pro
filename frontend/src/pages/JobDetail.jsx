import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Phone, MapPin, ArrowLeft, FileDown, Trash2, Calendar, Check, Clock, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STATUSES = ["Quoted", "Scheduled", "In Progress", "Complete"];

const statusConfig = {
  Quoted: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/50", icon: FileDown },
  Scheduled: { color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/50", icon: Calendar },
  "In Progress": { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/50", icon: Play },
  Complete: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/50", icon: CheckCircle },
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchJob();
    fetchInvoices();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await axios.get(`${API}/jobs/${id}`);
      setJob(res.data);
    } catch (error) {
      toast.error("Failed to load job");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API}/invoices`);
      setInvoices(res.data.filter(inv => inv.job_id === id));
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.put(`${API}/jobs/${id}`, { status: newStatus });
      setJob(prev => ({ ...prev, status: newStatus }));
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/jobs/${id}`);
      toast.success("Job deleted");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const handleGeneratePDF = () => {
    toast.success("Quote PDF generated! (Mock)");
  };

  const handleCreateInvoice = async () => {
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      
      await axios.post(`${API}/invoices`, {
        job_id: id,
        customer_id: job.customer_id,
        customer_name: job.customer_name,
        amount: job.quote_total,
        due_date: dueDate.toISOString().split('T')[0]
      });
      toast.success("Invoice created!");
      fetchInvoices();
    } catch (error) {
      toast.error("Failed to create invoice");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!job) return null;

  const currentStatusIndex = STATUSES.indexOf(job.status);

  return (
    <div className="p-4 space-y-4" data-testid="job-detail-page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          data-testid="back-btn"
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {job.customer_name}
          </h1>
          <p className="text-sm text-muted-foreground">{job.job_type}</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive">
              <Trash2 className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the job and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-600">Cancel</AlertDialogCancel>
              <AlertDialogAction
                data-testid="confirm-delete-btn"
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Contact Info */}
      <div className="bg-card border-2 border-border rounded-lg p-4 space-y-3">
        {job.customer_address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <span className="text-foreground">{job.customer_address}</span>
          </div>
        )}
        <a
          href={`tel:${job.customer_phone}`}
          data-testid="call-customer-btn"
          className="flex items-center gap-3 text-primary hover:underline"
        >
          <Phone className="w-5 h-5" />
          <span className="font-mono">{job.customer_phone}</span>
        </a>
      </div>

      {/* Status Timeline */}
      <div className="bg-card border-2 border-border rounded-lg p-4" data-testid="status-timeline">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm uppercase tracking-wider text-muted-foreground">Status</span>
          <Select value={job.status} onValueChange={handleStatusChange}>
            <SelectTrigger data-testid="status-select" className="w-40 h-9 bg-slate-800 border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          {STATUSES.map((status, index) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const isActive = index <= currentStatusIndex;
            const isCurrent = status === job.status;
            
            return (
              <div key={status} className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {index > 0 && (
                    <div className={cn(
                      "flex-1 h-1 -mr-1",
                      index <= currentStatusIndex ? "bg-primary" : "bg-slate-700"
                    )} />
                  )}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10",
                    isActive ? `${config.bg} ${config.border}` : "bg-slate-800 border-slate-700",
                    isCurrent && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}>
                    <Icon className={cn("w-5 h-5", isActive ? config.color : "text-slate-500")} />
                  </div>
                  {index < STATUSES.length - 1 && (
                    <div className={cn(
                      "flex-1 h-1 -ml-1",
                      index < currentStatusIndex ? "bg-primary" : "bg-slate-700"
                    )} />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-2 text-center",
                  isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"
                )}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 bg-slate-800 h-12">
          <TabsTrigger data-testid="tab-overview" value="overview" className="h-10">Overview</TabsTrigger>
          <TabsTrigger data-testid="tab-materials" value="materials" className="h-10">Materials</TabsTrigger>
          <TabsTrigger data-testid="tab-photos" value="photos" className="h-10">Photos</TabsTrigger>
          <TabsTrigger data-testid="tab-invoices" value="invoices" className="h-10">Invoices</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4" data-testid="tab-content-overview">
          <div className="bg-card border-2 border-border rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Materials</span>
              <span className="font-mono">${job.materials_total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Labor ({job.labor_hours}hrs × ${job.labor_rate}/hr)</span>
              <span className="font-mono">${job.labor_total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Markup ({job.markup_percent}%)</span>
              <span className="font-mono">
                ${((job.quote_total || 0) - (job.materials_total || 0) - (job.labor_total || 0)).toFixed(2)}
              </span>
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider">Quote Total</span>
                <span className="text-2xl font-bold text-primary font-mono" data-testid="job-total">
                  ${job.quote_total?.toFixed(2) || '0.00'}
                </span>
              </div>
            </div>
          </div>

          {job.notes && (
            <div className="bg-slate-800 rounded-lg p-4">
              <span className="text-sm uppercase tracking-wider text-muted-foreground">Notes</span>
              <p className="mt-2 text-foreground">{job.notes}</p>
            </div>
          )}

          <Button
            data-testid="generate-pdf-detail-btn"
            onClick={handleGeneratePDF}
            className="w-full h-12 bg-primary text-primary-foreground"
            style={{ boxShadow: '0 4px 0 0 rgba(14, 165, 233, 0.5)' }}
          >
            <FileDown className="w-5 h-5 mr-2" />
            Generate Quote PDF
          </Button>
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-3" data-testid="tab-content-materials">
          {job.materials?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No materials added</div>
          ) : (
            job.materials?.map((material, index) => (
              <div key={material.id || index} className="bg-slate-800 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground">{material.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {material.quantity} × ${material.unit_cost?.toFixed(2)}
                    </p>
                  </div>
                  <span className="font-mono text-primary font-bold">
                    ${material.line_total?.toFixed(2) || (material.quantity * material.unit_cost).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
          <div className="bg-card border-2 border-primary/50 rounded-lg p-3 flex justify-between items-center">
            <span className="font-bold uppercase tracking-wider">Materials Total</span>
            <span className="text-xl font-bold text-primary font-mono">
              ${job.materials_total?.toFixed(2) || '0.00'}
            </span>
          </div>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4" data-testid="tab-content-photos">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No photos uploaded</p>
            <p className="text-sm text-slate-500 mt-1">(Mock - photos would appear here)</p>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4" data-testid="tab-content-invoices">
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No invoices created</p>
              <Button
                data-testid="create-invoice-btn"
                onClick={handleCreateInvoice}
                className="bg-accent text-accent-foreground"
              >
                Create Invoice
              </Button>
            </div>
          ) : (
            <>
              {invoices.map(invoice => (
                <div key={invoice.id} className="bg-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono text-sm text-muted-foreground">INV-{invoice.id.slice(0, 8)}</p>
                      <p className="text-lg font-bold text-primary font-mono">${invoice.amount?.toFixed(2)}</p>
                    </div>
                    <Badge className={cn(
                      "px-2 py-1 text-xs font-bold uppercase",
                      invoice.status === "Paid" ? "bg-green-500/10 text-green-400 border-green-500/50" :
                      invoice.status === "Overdue" ? "bg-red-500/10 text-red-400 border-red-500/50" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/50"
                    )}>
                      {invoice.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Due: {invoice.due_date}</p>
                </div>
              ))}
              <Button
                data-testid="create-another-invoice-btn"
                onClick={handleCreateInvoice}
                variant="outline"
                className="w-full h-12 border-2 border-slate-600"
              >
                Create Another Invoice
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Camera({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );
}
