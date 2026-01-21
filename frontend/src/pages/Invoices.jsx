import { useState, useEffect } from "react";
import { Search, FileText, DollarSign, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const filters = ["All", "Pending", "Paid", "Overdue"];

const statusConfig = {
  Pending: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/50", icon: Clock },
  Paid: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/50", icon: CheckCircle },
  Overdue: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/50", icon: AlertCircle },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0, overdue: 0 });

  useEffect(() => {
    fetchInvoices();
  }, [activeFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/invoices`, {
        params: { status: activeFilter !== "All" ? activeFilter : undefined }
      });
      setInvoices(res.data);
      
      // Calculate stats
      const allInvoices = activeFilter === "All" ? res.data : (await axios.get(`${API}/invoices`)).data;
      setStats({
        total: allInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        pending: allInvoices.filter(inv => inv.status === "Pending").reduce((sum, inv) => sum + inv.amount, 0),
        paid: allInvoices.filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0),
        overdue: allInvoices.filter(inv => inv.status === "Overdue").reduce((sum, inv) => sum + inv.amount, 0),
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === "Paid") {
        updateData.paid_date = new Date().toISOString().split('T')[0];
      }
      await axios.put(`${API}/invoices/${invoiceId}`, updateData);
      toast.success(`Invoice marked as ${newStatus}`);
      fetchInvoices();
    } catch (error) {
      toast.error("Failed to update invoice");
    }
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.id.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="p-4 space-y-4" data-testid="invoices-page">
      {/* Header */}
      <h2 className="text-2xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
        Invoices
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border-2 border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Collected</span>
          </div>
          <p className="text-xl font-bold text-green-400 font-mono" data-testid="stat-collected">
            {formatCurrency(stats.paid)}
          </p>
        </div>
        <div className="bg-card border-2 border-border rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Outstanding</span>
          </div>
          <p className="text-xl font-bold text-amber-400 font-mono" data-testid="stat-outstanding">
            {formatCurrency(stats.pending + stats.overdue)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          data-testid="search-invoices"
          placeholder="Search invoices..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 bg-slate-800 border-2 border-slate-600"
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2" data-testid="invoice-filters">
        {filters.map((filter) => (
          <Button
            key={filter}
            data-testid={`filter-invoice-${filter.toLowerCase()}`}
            variant="outline"
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "filter-chip h-10 px-4 rounded-full border-2 font-semibold uppercase tracking-wide text-sm whitespace-nowrap",
              activeFilter === filter
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent border-slate-600 text-slate-400 hover:border-slate-500"
            )}
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="space-y-3" data-testid="invoices-list">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No invoices found</p>
            <p className="text-sm text-slate-500 mt-1">Create invoices from job details</p>
          </div>
        ) : (
          filteredInvoices.map(invoice => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}

function InvoiceCard({ invoice, onStatusChange }) {
  const config = statusConfig[invoice.status];
  const Icon = config?.icon || Clock;
  
  const isOverdue = () => {
    if (invoice.status === "Paid") return false;
    const dueDate = new Date(invoice.due_date);
    return dueDate < new Date();
  };

  // Auto-mark as overdue
  useEffect(() => {
    if (invoice.status === "Pending" && isOverdue()) {
      onStatusChange(invoice.id, "Overdue");
    }
  }, []);

  return (
    <div
      data-testid={`invoice-card-${invoice.id}`}
      className="bg-card border-2 border-border rounded-lg p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">INV-{invoice.id.slice(0, 8).toUpperCase()}</span>
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                config?.bg, config?.color, config?.border
              )}
            >
              <Icon className="w-3 h-3 mr-1" />
              {invoice.status}
            </Badge>
          </div>
          <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {invoice.customer_name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Due: {new Date(invoice.due_date).toLocaleDateString()}
            {invoice.paid_date && ` • Paid: ${new Date(invoice.paid_date).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xl font-bold text-primary font-mono">
            ${invoice.amount?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || 0}
          </span>
          {invoice.status !== "Paid" && (
            <Select value={invoice.status} onValueChange={(val) => onStatusChange(invoice.id, val)}>
              <SelectTrigger data-testid={`invoice-status-${invoice.id}`} className="w-28 h-8 bg-slate-800 border-slate-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Mark Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}
