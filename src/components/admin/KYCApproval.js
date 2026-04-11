import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { FileText, CheckCircle, XCircle } from "lucide-react";

const MOCK_APPLICATIONS = [
  {
    id: "APP-9281",
    name: "Raju Mechanic",
    type: "Independent Mechanic",
    submitted: "2 hours ago",
    status: "Pending",
    documents: ["Aadhaar", "Driving License", "Skill Certificate"]
  },
  {
    id: "APP-9275",
    name: "Speedy Garage",
    type: "Garage Enterprise",
    submitted: "5 hours ago",
    status: "Pending",
    documents: ["GST Registration", "Shop Establishment Act", "Owner ID"]
  },
  {
    id: "APP-9260",
    name: "Vikram Motors",
    type: "Garage Enterprise",
    submitted: "1 day ago",
    status: "Pending",
    documents: ["GST Registration", "Owner ID"]
  }
];

export function KYCApproval() {
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);

  const handleApprove = (id) => {
    setApplications(applications.filter(app => app.id !== id));
    // simulate backend approval
  };

  const handleReject = (id) => {
    setApplications(applications.filter(app => app.id !== id));
    // simulate backend rejection
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.length === 0 ? (
        <div className="col-span-full py-12 text-center text-white/50">
          <FileText size={48} className="mx-auto mb-4 opacity-20" />
          <p>No pending KYC applications.</p>
        </div>
      ) : (
        applications.map((app) => (
          <GlassCard key={app.id} className="p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{app.name}</h3>
                <p className="text-xs text-emerald-400">{app.type}</p>
              </div>
              <Badge variant="warning">{app.status}</Badge>
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-white/40 mb-2">Submitted {app.submitted}</p>
              <p className="text-sm text-white/80 font-medium mb-1">Attached Documents:</p>
              <ul className="text-sm text-white/60 space-y-1">
                {app.documents.map((doc, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <FileText size={12} className="text-emerald-500/70" /> {doc}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
              <Button 
                variant="outline" 
                className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                onClick={() => handleReject(app.id)}
              >
                <XCircle size={16} className="mr-2" /> Reject
              </Button>
              <Button 
                className="bg-emerald-500 hover:bg-emerald-400 text-black"
                onClick={() => handleApprove(app.id)}
              >
                <CheckCircle size={16} className="mr-2" /> Approve
              </Button>
            </div>
          </GlassCard>
        ))
      )}
    </div>
  );
}
