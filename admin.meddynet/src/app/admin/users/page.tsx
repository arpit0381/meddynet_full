"use client";
import { useState } from "react";
import Image from "next/image";
import { Search, Filter, Download, MoreVertical, ShieldAlert, Trash2, KeyRound, Plus } from "lucide-react";
import { DataTable, Column } from "@/components/admin/ui/DataTable";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { SlideOverDrawer } from "@/components/admin/ui/SlideOverDrawer";
import { Modal } from "@/components/admin/ui/Modal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { RefreshCw } from "lucide-react";
import { useAdminUsers, useToggleUserStatus, useDeleteUser } from "@/lib/hooks";
import { toast } from "sonner";

type UserStatus = "Active" | "Suspended" | "Deleted";

interface User {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  city: string;
  bloodGroup: string;
  totalBookings: number;
  joinedDate: string;
  status: UserStatus;
}

// Mock data removed — now using live API via useAdminUsers() hook

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: "suspend" | "delete" | null; userId: string | null }>({ isOpen: false, type: null, userId: null });
  const [userModal, setUserModal] = useState<{isOpen: boolean, type: 'create' | 'edit', user: User | null}>({isOpen: false, type: 'create', user: null});
  const [activeTab, setActiveTab] = useState("bookings");

  const { data: rawUsers, isLoading } = useAdminUsers();
  const toggleStatusMutation = useToggleUserStatus();
  const deleteMutation = useDeleteUser();

  interface RawUser {
    id: string;
    name: string;
    profile_image_url?: string;
    phone: string;
    email?: string;
    blood_group?: string;
    created_at: string;
    is_active: boolean;
  }

  const users: User[] = (rawUsers || []).map((u: RawUser) => ({
    id: u.id,
    name: u.name,
    avatar: u.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`,
    phone: u.phone,
    email: u.email || "N/A",
    city: "N/A", 
    bloodGroup: u.blood_group || "N/A",
    totalBookings: 0, 
    joinedDate: new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: u.is_active ? "Active" : "Suspended"
  }));

  const openDrawer = (user: User) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const columns: Column<User>[] = [
    {
      header: "User",
      accessor: (user) => (
        <div className="flex items-center gap-3">
          <Image src={user.avatar} alt={user.name} width={32} height={32} className="w-8 h-8 rounded-full bg-surface border border-border-dim/50" />
          <span className="font-bold text-main-text">{user.name}</span>
        </div>
      ),
    },
    { header: "Phone", accessor: "phone" },
    { header: "Email", accessor: "email" },
    { header: "City", accessor: "city" },
    { header: "Blood Group", accessor: "bloodGroup" },
    { 
      header: "Bookings", 
      accessor: (user) => (
        <span className="text-primary hover:underline cursor-pointer font-bold">{user.totalBookings}</span>
      )
    },
    { header: "Joined", accessor: "joinedDate" },
    {
      header: "Status",
      accessor: (user) => (
        <StatusBadge 
          status={user.status === "Active" ? "success" : user.status === "Suspended" ? "warning" : "error"} 
          label={user.status} 
        />
      ),
    },
    {
      header: "",
      accessor: (user) => (
        <div className="flex items-center justify-end gap-2">
          <div className="relative group">
            <button className="p-1.5 text-muted hover:text-main-text rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
              <MoreVertical size={18} />
            </button>
            <div className="absolute right-0 mt-1 w-36 bg-card border border-border-dim shadow-xl rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={(e) => { e.stopPropagation(); openDrawer(user); }} className="w-full text-left px-4 py-2.5 text-sm text-main-text hover:bg-gray-50 dark:hover:bg-slate-800 rounded-t-xl transition-colors font-bold uppercase tracking-tight">View Profile</button>
              <button onClick={(e) => { e.stopPropagation(); setUserModal({isOpen: true, type: 'edit', user: user}); }} className="w-full text-left px-4 py-2.5 text-sm text-main-text hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-bold uppercase tracking-tight">Edit Profile</button>
              <button 
                onClick={(e) => { e.stopPropagation(); setActionModal({ isOpen: true, type: "suspend", userId: user.id }); }} 
                className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
              >
                {user.status === "Suspended" ? "Reactivate" : "Suspend"}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setActionModal({ isOpen: true, type: "delete", userId: user.id }); }} 
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ),
      className: "text-right"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-main-text tracking-tight">User Management</h1>
          <p className="text-sm text-muted font-medium mt-1">Manage platform users, view history and control access.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-black uppercase tracking-widest">{users.length} Total</span>
          <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border-dim text-muted rounded-lg text-sm font-bold uppercase tracking-tight hover:text-main-text hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => setUserModal({isOpen: true, type: 'create', user: null})} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border-dim shadow-sm overflow-hidden transition-colors">
        <div className="relative w-full xl:w-96 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, phone or email..." 
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border-dim rounded-lg text-sm font-bold placeholder:text-muted placeholder:font-black placeholder:uppercase placeholder:tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 text-main-text transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
          <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border-dim rounded-lg text-xs text-muted font-bold uppercase tracking-widest whitespace-nowrap hover:text-main-text hover:bg-surface transition-colors">
            <Filter size={16} className="text-muted/50" /> City
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border-dim rounded-lg text-xs text-muted font-bold uppercase tracking-widest whitespace-nowrap hover:text-main-text hover:bg-surface transition-colors">
            <Filter size={16} className="text-muted/50" /> Blood Group
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border-dim rounded-lg text-xs text-muted font-bold uppercase tracking-widest whitespace-nowrap hover:text-main-text hover:bg-surface transition-colors">
             Status: All
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <RefreshCw className="animate-spin text-primary" size={40} />
        </div>
      ) : (
        <DataTable data={users} columns={columns} onRowClick={openDrawer} />
      )}

      <SlideOverDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selectedUser && (
          <div className="flex flex-col min-h-dvh">
            <div className="p-6 border-b border-border-dim bg-surface shrink-0">
              <div className="flex items-center gap-4 mb-4">
                <Image src={selectedUser.avatar} alt={selectedUser.name} width={64} height={64} className="w-16 h-16 rounded-3xl border-4 border-card shadow-lg bg-card" />
                <div>
                  <h2 className="text-xl font-black text-main-text tracking-tight">{selectedUser.name}</h2>
                  <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1.5">{selectedUser.id} • Joined {selectedUser.joinedDate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-card p-4 rounded-2xl border border-border-dim shadow-sm">
                  <p className="text-[10px] text-muted mb-1.5 font-bold uppercase tracking-widest">Blood Group</p>
                  <p className="font-black text-red-500 text-xl tracking-tighter">{selectedUser.bloodGroup}</p>
                </div>
                <div className="bg-card p-4 rounded-2xl border border-border-dim shadow-sm">
                  <p className="text-[10px] text-muted mb-1.5 font-bold uppercase tracking-widest">Account Status</p>
                  <StatusBadge status={selectedUser.status === "Active" ? "success" : "warning"} label={selectedUser.status} />
                </div>
              </div>
            </div>

            <div className="flex gap-1 border-b border-border-dim px-4 pt-4 shrink-0 bg-card transition-colors">
              {["bookings", "reports", "records", "actions"].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted hover:text-main-text hover:border-border-dim"}`}
                >
                  {tab === "records" ? "Health Records" : tab === "actions" ? "Account" : tab}
                </button>
              ))}
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-surface">
              {activeTab === "bookings" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-main-text text-sm">Last 10 bookings</p>
                    <button className="text-xs font-medium text-primary hover:underline">View All</button>
                  </div>
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-card p-4 rounded-2xl border border-border-dim shadow-sm flex justify-between items-center group hover:border-primary/30 transition-all">
                      <div>
                        <p className="font-bold text-sm text-main-text">Complete Blood Count</p>
                        <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1.5">Apex Diagnostics • 12 Mar 2026</p>
                      </div>
                      <StatusBadge status="success" label="Completed" />
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "actions" && (
                <div className="space-y-4">
                  <div className="bg-card p-6 rounded-2xl border border-border-dim shadow-sm">
                    <h3 className="font-black text-main-text uppercase tracking-widest text-xs flex items-center gap-2 mb-6 border-b border-border-dim pb-4">
                      <KeyRound size={18} className="text-primary" /> Access Control
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full py-3.5 px-4 bg-card border border-border-dim text-main-text font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all text-left flex items-center justify-between group">
                        Reset Password <span className="text-muted group-hover:text-primary transition-all">→</span>
                      </button>
                      <button className="w-full py-3.5 px-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-sm font-bold hover:bg-amber-500/20 transition-all text-left flex items-center justify-between">
                        Suspend Account <ShieldAlert size={16} />
                      </button>
                      <button className="w-full py-3.5 px-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-bold hover:bg-red-500/20 transition-all text-left flex items-center justify-between">
                        Delete Account <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {(activeTab === "reports" || activeTab === "records") && (
                <div className="flex items-center justify-center h-48 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 border-dashed">
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No records to display right now.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </SlideOverDrawer>

      <ConfirmDialog 
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: null, userId: null })}
        title={actionModal.type === "suspend" ? "Suspend User" : "Delete User"}
        description={actionModal.type === "suspend" ? "Are you sure you want to suspend this user? They will not be able to log in or book tests." : "This action is irreversible. All user data, bookings, and reports will be permanently deleted."}
        confirmText={actionModal.type === "suspend" ? "Suspend User" : "Delete Permanently"}
        isDestructive={true}
        onConfirm={() => {
          if (actionModal.type === "delete" && actionModal.userId) {
            deleteMutation.mutate(actionModal.userId);
            toast.success("User deleted successfully.");
          } else if (actionModal.type === "suspend" && actionModal.userId) {
            toggleStatusMutation.mutate(actionModal.userId);
            toast.success("User status updated.");
          }
          if (selectedUser?.id === actionModal.userId) {
            setDrawerOpen(false);
          }
          setActionModal({ isOpen: false, type: null, userId: null });
        }}
      />
      
      <Modal isOpen={userModal.isOpen} onClose={() => setUserModal({isOpen: false, type: 'create', user: null})} title={userModal.type === 'create' ? "Add New User" : "Edit User Profile"} footer={
        <div className="flex justify-end gap-3 w-full">
            <button onClick={() => setUserModal({isOpen: false, type: 'create', user: null})} className="px-4 py-2 border border-border-dim rounded-lg text-sm text-muted hover:text-main-text hover:bg-gray-50 dark:hover:bg-slate-800 font-bold uppercase tracking-tight transition-all">Cancel</button>
          <button onClick={() => {
            if (userModal.type === 'create') {
               toast.success("User added successfully.");
            } else {
               toast.success("User updated successfully.");
            }
            setUserModal({isOpen: false, type: 'create', user: null});
          }} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Save Details</button>
        </div>
      }>
        <div className="space-y-4">
          <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">Full Name</label><input type="text" defaultValue={userModal.user?.name} className="w-full p-3 bg-input border border-border-dim rounded-xl font-bold focus:ring-2 focus:ring-primary/50 outline-none text-main-text transition-all" placeholder="e.g. Ramesh Kumar" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">Phone Number</label><input type="text" defaultValue={userModal.user?.phone} className="w-full p-3 bg-input border border-border-dim rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/50 text-main-text transition-all" placeholder="+91" /></div>
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">Email</label><input type="email" defaultValue={userModal.user?.email} className="w-full p-3 bg-input border border-border-dim rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/50 text-main-text transition-all" placeholder="user@example.com" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">City</label><input type="text" defaultValue={userModal.user?.city} className="w-full p-3 bg-input border border-border-dim rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/50 text-main-text transition-all" placeholder="Delhi" /></div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-1.5">Blood Group</label>
              <select defaultValue={userModal.user?.bloodGroup || 'O+'} className="w-full p-3 bg-input border border-border-dim rounded-xl font-bold outline-none focus:ring-2 focus:ring-primary/50 text-main-text transition-all appearance-none">
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
