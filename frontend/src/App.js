import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import NewJob from "@/pages/NewJob";
import JobDetail from "@/pages/JobDetail";
import Customers from "@/pages/Customers";
import Calendar from "@/pages/Calendar";
import Invoices from "@/pages/Invoices";

function App() {
  return (
    <div className="App min-h-screen bg-background">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs/new" element={<NewJob />} />
            <Route path="jobs/:id" element={<JobDetail />} />
            <Route path="customers" element={<Customers />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="invoices" element={<Invoices />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
