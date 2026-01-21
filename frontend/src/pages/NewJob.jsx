import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, Loader2, Plus, Minus, Trash2, FileDown, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const JOB_TYPES = [
  "Residential Service",
  "Panel Upgrade",
  "EV Charger",
  "Commercial"
];

export default function NewJob() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Photo/Type, 2: Materials, 3: Customer
  const [analyzing, setAnalyzing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [customers, setCustomers] = useState([]);
  
  const [formData, setFormData] = useState({
    job_type: "",
    customer_id: "",
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    materials: [],
    labor_hours: 0,
    labor_rate: 85,
    markup_percent: 20,
    notes: ""
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
    }
  };

  const handleScanJobSite = async () => {
    if (!formData.job_type) {
      toast.error("Please select a job type first");
      return;
    }
    
    setAnalyzing(true);
    try {
      // Mock AI analysis with animation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const res = await axios.post(`${API}/estimate`, {
        job_type: formData.job_type,
        photo_count: 3
      });
      
      setFormData(prev => ({
        ...prev,
        materials: res.data.materials,
        labor_hours: res.data.labor_hours
      }));
      setConfidence(res.data.confidence);
      setStep(2);
      toast.success("AI analysis complete!");
    } catch (error) {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address
      }));
    }
  };

  const updateMaterial = (index, field, value) => {
    setFormData(prev => {
      const newMaterials = [...prev.materials];
      newMaterials[index] = {
        ...newMaterials[index],
        [field]: field === 'quantity' || field === 'unit_cost' ? parseFloat(value) || 0 : value,
        line_total: field === 'quantity' 
          ? (parseFloat(value) || 0) * newMaterials[index].unit_cost
          : field === 'unit_cost'
            ? newMaterials[index].quantity * (parseFloat(value) || 0)
            : newMaterials[index].line_total
      };
      return { ...prev, materials: newMaterials };
    });
  };

  const removeMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { id: crypto.randomUUID(), name: "", quantity: 1, unit_cost: 0, line_total: 0 }]
    }));
  };

  const calculateTotals = () => {
    const materialsTotal = formData.materials.reduce((sum, m) => sum + (m.quantity * m.unit_cost), 0);
    const laborTotal = formData.labor_hours * formData.labor_rate;
    const subtotal = materialsTotal + laborTotal;
    const quoteTotal = subtotal * (1 + formData.markup_percent / 100);
    return { materialsTotal, laborTotal, subtotal, quoteTotal };
  };

  const handleSubmit = async () => {
    if (!formData.customer_name || !formData.customer_phone) {
      toast.error("Please fill in customer details");
      return;
    }

    try {
      const res = await axios.post(`${API}/jobs`, formData);
      toast.success("Job created successfully!");
      navigate(`/jobs/${res.data.id}`);
    } catch (error) {
      toast.error("Failed to create job");
    }
  };

  const handleGeneratePDF = async () => {
    toast.success("Quote PDF generated! (Mock)");
  };

  const totals = calculateTotals();

  return (
    <div className="p-4 space-y-6" data-testid="new-job-page">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}
            >
              {step > s ? <Check className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div className={cn("w-12 h-1 mx-1", step > s ? "bg-primary" : "bg-secondary")} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Photo/Type Selection */}
      {step === 1 && (
        <div className="space-y-6" data-testid="step-1">
          <div className="text-center">
            <h2 className="text-2xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              New Job Estimate
            </h2>
            <p className="text-muted-foreground mt-1">Select job type and scan site</p>
          </div>

          {/* Job Type Selector */}
          <div className="space-y-2">
            <Label className="text-sm uppercase tracking-wider text-muted-foreground">Job Type</Label>
            <Select value={formData.job_type} onValueChange={(v) => setFormData(prev => ({ ...prev, job_type: v }))}>
              <SelectTrigger data-testid="job-type-select" className="h-12 bg-slate-800 border-2 border-slate-600">
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scan/Upload Section */}
          <div className="space-y-4">
            {analyzing ? (
              <div className="relative bg-slate-800 rounded-lg p-8 text-center border-2 border-primary overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent scan-line h-1 bg-primary" />
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
                <p className="text-lg font-semibold text-foreground">Analyzing Job Site...</p>
                <p className="text-sm text-muted-foreground mt-2">AI is identifying materials and estimating labor</p>
              </div>
            ) : (
              <>
                <Button
                  data-testid="scan-job-site-btn"
                  onClick={handleScanJobSite}
                  disabled={!formData.job_type}
                  className="w-full h-32 bg-primary hover:bg-primary/90 text-primary-foreground flex flex-col gap-2 rounded-lg"
                  style={{ boxShadow: '0 4px 0 0 rgba(14, 165, 233, 0.5)' }}
                >
                  <Camera className="w-10 h-10" strokeWidth={2} />
                  <span className="text-lg font-bold uppercase tracking-wider">Scan Job Site</span>
                </Button>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">OR</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Button
                  data-testid="upload-photos-btn"
                  variant="outline"
                  onClick={handleScanJobSite}
                  disabled={!formData.job_type}
                  className="w-full h-16 border-2 border-slate-600 hover:border-primary flex gap-2"
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-semibold">Upload Photos</span>
                </Button>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-sm text-muted-foreground mb-2">
                    <Sparkles className="w-4 h-4 inline mr-1 text-accent" />
                    Tips for best results:
                  </p>
                  <ul className="text-xs text-slate-400 space-y-1 ml-5 list-disc">
                    <li>Take photos of electrical panels</li>
                    <li>Capture wire runs and conduit paths</li>
                    <li>Include fixture locations</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Materials & Labor */}
      {step === 2 && (
        <div className="space-y-4" data-testid="step-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              Material List
            </h2>
            {confidence > 0 && (
              <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/50">
                {Math.round(confidence * 100)}% confidence
              </span>
            )}
          </div>

          {/* Materials Table */}
          <div className="space-y-2" data-testid="materials-list">
            {formData.materials.map((material, index) => (
              <div key={material.id || index} className="bg-slate-800 rounded-lg p-3 material-row">
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    data-testid={`material-name-${index}`}
                    value={material.name}
                    onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                    placeholder="Item name"
                    className="flex-1 h-10 bg-slate-700 border-slate-600"
                  />
                  <Button
                    data-testid={`remove-material-${index}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMaterial(index)}
                    className="h-10 w-10 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMaterial(index, 'quantity', Math.max(1, material.quantity - 1))}
                      className="h-8 w-8 p-0 border-slate-600"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <Input
                      data-testid={`material-qty-${index}`}
                      type="number"
                      value={material.quantity}
                      onChange={(e) => updateMaterial(index, 'quantity', e.target.value)}
                      className="w-16 h-8 text-center bg-slate-700 border-slate-600 font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateMaterial(index, 'quantity', material.quantity + 1)}
                      className="h-8 w-8 p-0 border-slate-600"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <span className="text-muted-foreground">×</span>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      data-testid={`material-cost-${index}`}
                      type="number"
                      step="0.01"
                      value={material.unit_cost}
                      onChange={(e) => updateMaterial(index, 'unit_cost', e.target.value)}
                      className="w-24 h-8 pl-6 bg-slate-700 border-slate-600 font-mono"
                    />
                  </div>
                  <span className="text-muted-foreground">=</span>
                  <span className="font-mono text-primary font-bold min-w-[80px] text-right">
                    ${(material.quantity * material.unit_cost).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}

            <Button
              data-testid="add-material-btn"
              variant="outline"
              onClick={addMaterial}
              className="w-full h-12 border-2 border-dashed border-slate-600 hover:border-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Material
            </Button>
          </div>

          {/* Labor */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-3">
            <Label className="text-sm uppercase tracking-wider text-muted-foreground">Labor</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <span className="text-xs text-slate-400">Hours</span>
                <Input
                  data-testid="labor-hours-input"
                  type="number"
                  step="0.5"
                  value={formData.labor_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, labor_hours: parseFloat(e.target.value) || 0 }))}
                  className="h-10 bg-slate-700 border-slate-600 font-mono"
                />
              </div>
              <span className="text-muted-foreground mt-5">×</span>
              <div className="flex-1">
                <span className="text-xs text-slate-400">Rate/hr</span>
                <Input
                  data-testid="labor-rate-input"
                  type="number"
                  value={formData.labor_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, labor_rate: parseFloat(e.target.value) || 0 }))}
                  className="h-10 bg-slate-700 border-slate-600 font-mono"
                />
              </div>
              <span className="text-muted-foreground mt-5">=</span>
              <div className="flex-1">
                <span className="text-xs text-slate-400">Total</span>
                <div className="h-10 flex items-center font-mono text-primary font-bold text-lg">
                  ${totals.laborTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-card border-2 border-border rounded-lg p-4 space-y-2" data-testid="quote-totals">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Materials</span>
              <span className="font-mono">${totals.materialsTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Labor</span>
              <span className="font-mono">${totals.laborTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-muted-foreground">Markup</span>
              <div className="flex items-center gap-2">
                <Input
                  data-testid="markup-input"
                  type="number"
                  value={formData.markup_percent}
                  onChange={(e) => setFormData(prev => ({ ...prev, markup_percent: parseFloat(e.target.value) || 0 }))}
                  className="w-16 h-8 text-center bg-slate-700 border-slate-600 font-mono"
                />
                <span>%</span>
              </div>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase tracking-wider">Quote Total</span>
                <span className="text-2xl font-bold text-primary font-mono" data-testid="quote-total">
                  ${totals.quoteTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 h-12 border-2 border-slate-600"
            >
              Back
            </Button>
            <Button
              data-testid="continue-to-customer-btn"
              onClick={() => setStep(3)}
              className="flex-1 h-12 bg-primary text-primary-foreground"
              style={{ boxShadow: '0 4px 0 0 rgba(14, 165, 233, 0.5)' }}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Customer Details */}
      {step === 3 && (
        <div className="space-y-4" data-testid="step-3">
          <h2 className="text-xl font-bold uppercase tracking-tight" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
            Customer Details
          </h2>

          {/* Existing Customer Select */}
          {customers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm uppercase tracking-wider text-muted-foreground">Select Existing Customer</Label>
              <Select onValueChange={handleCustomerSelect}>
                <SelectTrigger data-testid="existing-customer-select" className="h-12 bg-slate-800 border-2 border-slate-600">
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-4 my-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">OR NEW</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </div>
          )}

          {/* Customer Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm uppercase tracking-wider text-muted-foreground">Name *</Label>
              <Input
                data-testid="customer-name-input"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                placeholder="Customer name"
                className="h-12 bg-slate-800 border-2 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm uppercase tracking-wider text-muted-foreground">Phone *</Label>
              <Input
                data-testid="customer-phone-input"
                value={formData.customer_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                placeholder="(555) 123-4567"
                className="h-12 bg-slate-800 border-2 border-slate-600"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm uppercase tracking-wider text-muted-foreground">Address</Label>
              <Textarea
                data-testid="customer-address-input"
                value={formData.customer_address}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_address: e.target.value }))}
                placeholder="Street address, City, State ZIP"
                className="bg-slate-800 border-2 border-slate-600 min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm uppercase tracking-wider text-muted-foreground">Notes</Label>
              <Textarea
                data-testid="job-notes-input"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                className="bg-slate-800 border-2 border-slate-600 min-h-[80px]"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Job Type</span>
              <span className="font-semibold">{formData.job_type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Quote Total</span>
              <span className="text-xl font-bold text-primary font-mono">${totals.quoteTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="flex-1 h-12 border-2 border-slate-600"
            >
              Back
            </Button>
            <Button
              data-testid="create-job-btn"
              onClick={handleSubmit}
              className="flex-1 h-12 bg-accent text-accent-foreground font-bold"
              style={{ boxShadow: '0 4px 0 0 rgba(251, 191, 36, 0.5)' }}
            >
              Create Job
            </Button>
          </div>

          <Button
            data-testid="generate-pdf-btn"
            variant="outline"
            onClick={handleGeneratePDF}
            className="w-full h-12 border-2 border-slate-600"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Generate Quote PDF
          </Button>
        </div>
      )}
    </div>
  );
}
