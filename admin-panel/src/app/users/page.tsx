'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import UserCard from "./components/UserCard";
import { UsersService, User } from "@/services/users.service";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await UsersService.getAll();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch registered users');
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) {
    return (
      <main className="w-full py-8 px-4 sm:px-6">
        <div className="p-4 text-slate-500 text-sm">Loading registered users...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full py-8 px-4 sm:px-6">
        <div className="p-4 text-red-500 text-sm font-semibold">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered customer profiles and account details.
          </p>
        </div>
        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">
          Total Users: {users.length}
        </span>
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </main>
  );
}