import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider } from "@/contexts/DataContext";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import Money from "./pages/Money";
import Clients from "./pages/Clients";
import Stats from "./pages/Stats";
import AddTask from "./pages/AddTask";
import AddMoney from "./pages/AddMoney";
import AddClient from "./pages/AddClient";
import EditTask from "./pages/EditTask";
import EditMoney from "./pages/EditMoney";
import UnpaidTasks from "./pages/UnpaidTasks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DataProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/new" element={<AddTask />} />
            <Route path="/tasks/:id/edit" element={<EditTask />} />
            <Route path="/tasks/unpaid" element={<UnpaidTasks />} />
            <Route path="/money" element={<Money />} />
            <Route path="/money/new" element={<AddMoney />} />
            <Route path="/money/:id/edit" element={<EditMoney />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/new" element={<AddClient />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
