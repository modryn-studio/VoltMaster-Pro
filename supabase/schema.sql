-- VoltMaster Pro Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Users/Companies
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  company_name TEXT,
  license_number TEXT,
  labor_rate_per_hour DECIMAL(10, 2) DEFAULT 85.00,
  default_markup_percentage DECIMAL(5,2) DEFAULT 30.00,
  logo_url TEXT,
  subscription_tier TEXT DEFAULT 'base',
  subscription_status TEXT DEFAULT 'trial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_job_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'quoted',
  address TEXT,
  scope_of_work TEXT,
  estimated_hours DECIMAL(5,2),
  labor_cost DECIMAL(10,2),
  material_cost DECIMAL(10,2),
  markup_amount DECIMAL(10,2),
  quote_total DECIMAL(10,2),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Photos
CREATE TABLE job_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  analysis_status TEXT DEFAULT 'pending',
  ai_detected_items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity DECIMAL(10,2),
  unit TEXT,
  unit_cost DECIMAL(10,2),
  line_total DECIMAL(10,2),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft',
  sent_date TIMESTAMP WITH TIME ZONE,
  viewed_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  amount_due DECIMAL(10,2),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EV Analysis (Premium Feature)
CREATE TABLE ev_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  panel_capacity_amps INTEGER,
  current_load_amps DECIMAL(5,2),
  ev_load_requirement_amps DECIMAL(5,2),
  total_with_ev_amps DECIMAL(5,2),
  panel_upgrade_required BOOLEAN,
  recommended_breaker_size TEXT,
  recommended_wire_gauge TEXT,
  nec_calculation_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Templates
CREATE TABLE material_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  job_type TEXT,
  materials JSONB,
  estimated_hours DECIMAL(5,2),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ev_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_templates ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Users policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Customers policies
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (user_id = auth.uid());

-- Jobs policies
CREATE POLICY "Users can view own jobs" ON jobs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own jobs" ON jobs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (user_id = auth.uid());

-- Job Photos policies
CREATE POLICY "Users can view own job photos" ON job_photos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_photos.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own job photos" ON job_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_photos.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own job photos" ON job_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_photos.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own job photos" ON job_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_photos.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

-- Materials policies
CREATE POLICY "Users can view own materials" ON materials
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = materials.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own materials" ON materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = materials.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own materials" ON materials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = materials.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own materials" ON materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = materials.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = invoices.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = invoices.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = invoices.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = invoices.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

-- EV Analysis policies
CREATE POLICY "Users can view own ev analysis" ON ev_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = ev_analysis.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own ev analysis" ON ev_analysis
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = ev_analysis.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own ev analysis" ON ev_analysis
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = ev_analysis.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own ev analysis" ON ev_analysis
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = ev_analysis.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

-- Material Templates policies
CREATE POLICY "Users can view own templates" ON material_templates
  FOR SELECT USING (user_id = auth.uid() OR is_public = TRUE);

CREATE POLICY "Users can insert own templates" ON material_templates
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own templates" ON material_templates
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own templates" ON material_templates
  FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_job_photos_job_id ON job_photos(job_id);
CREATE INDEX idx_materials_job_id ON materials(job_id);
CREATE INDEX idx_invoices_job_id ON invoices(job_id);
CREATE INDEX idx_ev_analysis_job_id ON ev_analysis(job_id);
CREATE INDEX idx_material_templates_user_id ON material_templates(user_id);

-- =============================================
-- FUNCTIONS (HELPER UTILITIES)
-- =============================================

-- Function to automatically update customer total_spent
CREATE OR REPLACE FUNCTION update_customer_total_spent()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET 
    total_spent = (
      SELECT COALESCE(SUM(quote_total), 0)
      FROM jobs
      WHERE customer_id = NEW.customer_id
      AND status = 'complete'
    ),
    last_job_date = GREATEST(
      last_job_date,
      NEW.completed_date
    )
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update customer stats when job is completed
CREATE TRIGGER trigger_update_customer_total_spent
  AFTER INSERT OR UPDATE ON jobs
  FOR EACH ROW
  WHEN (NEW.status = 'complete' AND NEW.customer_id IS NOT NULL)
  EXECUTE FUNCTION update_customer_total_spent();
