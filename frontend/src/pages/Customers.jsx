import { useState, useEffect } from "react";
import { Search, Plus, Phone, Mail, MapPin, Trash2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API}/customers`);
      setCustomers(res.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error("Name and phone are required");
      return;
    }

    try {
      await axios.post(`${API}/customers`, newCustomer);
      toast.success("Customer added!");
      setNewCustomer({ name: "", phone: "", email: "", address: "" });
      setDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to add customer");
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await axios.delete(`${API}/customers/${customerId}`);
      toast.success("Customer deleted");
      fetchCustomers();
    } catch (error) {
      toast.error("Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4" data-testid="customers-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
          Customers
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="add-customer-btn"
              className="h-10 bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
                New Customer
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm uppercase tracking-wider text-muted-foreground">Name *</Label>
                <Input
                  data-testid="new-customer-name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Customer name"
                  className="h-12 bg-slate-800 border-2 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm uppercase tracking-wider text-muted-foreground">Phone *</Label>
                <Input
                  data-testid="new-customer-phone"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="h-12 bg-slate-800 border-2 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input
                  data-testid="new-customer-email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="h-12 bg-slate-800 border-2 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm uppercase tracking-wider text-muted-foreground">Address</Label>
                <Input
                  data-testid="new-customer-address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street, City, State ZIP"
                  className="h-12 bg-slate-800 border-2 border-slate-600"
                />
              </div>
              <Button
                data-testid="save-customer-btn"
                onClick={handleCreateCustomer}
                className="w-full h-12 bg-accent text-accent-foreground font-bold"
                style={{ boxShadow: '0 4px 0 0 rgba(251, 191, 36, 0.5)' }}
              >
                Save Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          data-testid="search-customers"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 bg-slate-800 border-2 border-slate-600"
        />
      </div>

      {/* Customers List */}
      <div className="space-y-3" data-testid="customers-list">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No customers found</p>
            <Button
              data-testid="add-first-customer-btn"
              onClick={() => setDialogOpen(true)}
              className="mt-4 bg-primary text-primary-foreground"
            >
              Add Your First Customer
            </Button>
          </div>
        ) : (
          filteredCustomers.map(customer => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onDelete={handleDeleteCustomer}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CustomerCard({ customer, onDelete }) {
  return (
    <div
      data-testid={`customer-card-${customer.id}`}
      className="bg-card border-2 border-border rounded-lg p-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            {customer.name}
          </h3>
          <div className="space-y-1 mt-2">
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Phone className="w-4 h-4" />
              <span className="font-mono text-sm">{customer.phone}</span>
            </a>
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm truncate">{customer.email}</span>
              </a>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{customer.address}</span>
              </div>
            )}
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Customer?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete {customer.name} from your contacts.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-600">Cancel</AlertDialogCancel>
              <AlertDialogAction
                data-testid={`confirm-delete-customer-${customer.id}`}
                onClick={() => onDelete(customer.id)}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
