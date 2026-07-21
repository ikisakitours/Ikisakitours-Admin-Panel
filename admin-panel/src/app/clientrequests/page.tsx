import RequestCard, { ClientRequestProps } from "./components/requestcard";

const mockRequests: ClientRequestProps[] = [
  {
    id: "req_1",
    requestType: "full_package",
    clientName: "David Miller",
    email: "david.m@example.com",
    phone: "+1 (555) 019-2834",
    placesToVisit: ["Ella Rock", "Nine Arch Bridge", "Mirissa Beach"],
    travelDates: "Aug 12 - Aug 18, 2026",
    groupSize: 4,
    additionalNotes: "We need an SUV with air conditioning. Prefer an English-speaking guide.",
    status: "pending",
  },
  {
    id: "req_2",
    requestType: "guide_only",
    clientName: "Sophia Martinez",
    email: "sophia.m@example.com",
    phone: "+44 7700 900077",
    placesToVisit: ["Sigiriya Fortress", "Dambulla Cave Temple"],
    travelDates: "Sep 01 - Sep 03, 2026",
    groupSize: 2,
    additionalNotes: "Interested mainly in ancient history and culture.",
    status: "contacted",
  },
  {
    id: "req_3",
    requestType: "vehicle_only",
    clientName: "Liam Wilson",
    email: "liam.w@example.com",
    phone: "+61 491 570 156",
    placesToVisit: ["Kandy City", "Nuwara Eliya Tea Estate"],
    travelDates: "Oct 10 - Oct 14, 2026",
    groupSize: 6,
    status: "completed",
  },
];

export default function clientrequests(){
    return(
        <div className="min-h-screen bg-slate-100/40 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800">Client Inquiries & Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage custom tour requests submitted by visitors on the main application.
          </p>
        </div>

        <div>
          {mockRequests.map((req) => (
            <RequestCard key={req.id} {...req} />
          ))}
        </div>
      </div>
    </div>
    );
}