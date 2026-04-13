"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";

type UserRole = {
  id: string;
  user_id: string;
  email?: string;
  role: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>("");

  useEffect(() => {
    checkAdmin();
    fetchUsers();
  }, []);

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (data?.role !== "admin") {
      router.push("/admin/dashboard");
    }
    setCurrentUserRole(data?.role || "");
  }

  async function fetchUsers() {
    setLoading(true);
    // Get all auth users (requires admin access via Supabase)
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error(authError);
      alert("Failed to fetch users. Make sure you have admin privileges.");
      setLoading(false);
      return;
    }
    // Get roles from user_roles
    const { data: roles } = await supabase.from("user_roles").select("*");
    const merged = authUsers.map(user => ({
      id: user.id,
      user_id: user.id,
      email: user.email,
      role: roles?.find(r => r.user_id === user.id)?.role || "staff"
    }));
    setUsers(merged);
    setLoading(false);
  }

  async function updateRole(userId: string, newRole: string) {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: newRole }, { onConflict: "user_id" });
    if (error) alert("Failed to update role: " + error.message);
    else fetchUsers();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600">Manage staff roles (admin or staff).</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{user.email}</p>
                    <p className="text-sm text-gray-500">ID: {user.id.slice(0,8)}...</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.user_id, e.target.value)}
                      className="border rounded px-3 py-1"
                    >
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}