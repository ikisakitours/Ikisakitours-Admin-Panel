import UserCard, { UserData } from "./components/UserCard";


// Example Mock Data
const MOCK_USERS: UserData[] = [
  {
    id: "usr_01",
    name: "Alex Morgan",
    email: "alex.m@example.com",
    role: "Admin",
    passwordHash: "p@ssword123",
    createdAt: "Jan 2026",
  },
  {
    id: "usr_02",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    role: "Tour Operator",
    passwordHash: "securePass#99",
    createdAt: "Feb 2026",
  },
];

export default function UsersPage() {
  return (
    <main className="w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          User Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered operators and administrator system credentials.
        </p>
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_USERS.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </main>
  );
}