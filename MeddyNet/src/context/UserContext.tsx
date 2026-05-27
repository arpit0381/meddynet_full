"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { currentUser as initialUser, savedAddresses as initialAddresses, UserProfile, Address } from "@/data/user";
import apiClient from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "booking" | "report" | "reminder" | "offer";
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
}

interface UserContextType {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  addresses: Address[];
  setAddresses: (addresses: Address[]) => void;
  notifications: {
    whatsapp: boolean;
    bookingUpdates: boolean;
    medicalReminders: boolean;
    offers: boolean;
    securityAlerts: boolean;
  };
  setNotifications: (notifications: UserContextType["notifications"]) => void;
  notificationItems: NotificationItem[];
  setNotificationItems: (items: NotificationItem[]) => void;
  updateUser: (newData: Partial<UserProfile>) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  refreshNotifications: () => void;
  isLoadingProfile: boolean;
  isLoadingNotifications: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Map backend notification type to frontend type
const mapNotificationType = (type: string): "booking" | "report" | "reminder" | "offer" => {
  switch (type) {
    case "booking": return "booking";
    case "report": return "report";
    case "reminder": return "reminder";
    case "offer": return "offer";
    default: return "reminder";
  }
};

// Map backend notification to action label/href
const getNotificationAction = (type: string, metadata: Record<string, string>) => {
  switch (type) {
    case "booking":
      return {
        actionLabel: "View Booking",
        actionHref: metadata?.booking_id ? `/dashboard/bookings/${metadata.booking_id}` : "/dashboard/bookings"
      };
    case "report":
      return {
        actionLabel: "View Report",
        actionHref: metadata?.report_id ? `/dashboard/reports/${metadata.report_id}` : "/dashboard/reports"
      };
    default:
      return {};
  }
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notifications, setNotifications] = useState({
    whatsapp: false,
    bookingUpdates: true,
    medicalReminders: true,
    offers: false,
    securityAlerts: true,
  });
  const [notificationItems, setNotificationItems] = useState<NotificationItem[]>([]);

  // Fetch user profile from backend
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const { data } = await apiClient.get("/users/me");
        if (data) {
          const realName = data.name || '';
          const initials = realName ? realName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : '';
          setUser(prev => ({
            ...prev,
            name: realName || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            profile_image_url: data.profile_image_url || prev.profile_image_url,
            bloodGroup: data.blood_group || prev.bloodGroup,
            age: data.age || prev.age,
            pan_card: data.pan_card || prev.pan_card,
            wallet_balance: data.wallet_balance ?? prev.wallet_balance,
            avatar: initials || prev.avatar,
            memberSince: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : prev.memberSince,
          }));
          
          if (data.preferences && Object.keys(data.preferences).length > 0) {
              setNotifications(prev => ({ ...prev, ...data.preferences }));
          }
          if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
              setAddresses(data.addresses);
          }
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        // Fall back to localStorage
        const storedUser = localStorage.getItem("meddynet_user");
        if (storedUser) {
          Promise.resolve().then(() => setUser(JSON.parse(storedUser) as UserProfile));
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated]);

  // Fetch notifications from backend
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingNotifications(true);
    try {
      const { data } = await apiClient.get("/notifications");
      const items: NotificationItem[] = (data || []).map((n: { id: string; title: string; message: string; created_at: string; type: string; is_read: boolean; metadata: Record<string, string> }) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        timestamp: n.created_at || new Date().toISOString(),
        type: mapNotificationType(n.type),
        read: n.is_read,
        ...getNotificationAction(n.type, n.metadata),
      }));
      setNotificationItems(items);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      // Fall back to localStorage cache
      const cached = localStorage.getItem("meddynet_notification_items");
      if (cached) {
        Promise.resolve().then(() => setNotificationItems(JSON.parse(cached)));
      }
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  // Load preferences from localStorage
  useEffect(() => {
    const storedAddresses = localStorage.getItem("meddynet_addresses");
    const storedNotifications = localStorage.getItem("meddynet_notifications");

    Promise.resolve().then(() => {
      if (storedAddresses) setAddresses(JSON.parse(storedAddresses) as Address[]);
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications) as UserContextType["notifications"]);
    });
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem("meddynet_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("meddynet_addresses", JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem("meddynet_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("meddynet_notification_items", JSON.stringify(notificationItems));
  }, [notificationItems]);

  const updateUser = async (newData: Partial<UserProfile>) => {
    // Update local state immediately
    setUser(prev => ({ ...prev, ...newData }));
    
    // Sync to backend with correct field mapping
    try {
      const updatePayload: Record<string, string | undefined> = {
        name: newData.name,
        email: newData.email,
        phone: newData.phone,
        blood_group: newData.bloodGroup,
        age: newData.age?.toString(),
        pan_card: newData.pan_card
      };

      // Clean undefined values
      Object.keys(updatePayload).forEach(key => 
          updatePayload[key] === undefined && delete updatePayload[key]
      );

      await apiClient.patch("/users/me", updatePayload);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const markAllNotificationsRead = async () => {
    // Optimistic update
    setNotificationItems(prev => prev.map(item => ({ ...item, read: true })));
    try {
      await apiClient.patch("/notifications/read-all");
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const markNotificationRead = async (id: string) => {
    // Optimistic update
    setNotificationItems(prev => prev.map(item => item.id === id ? { ...item, read: true } : item));
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const deleteNotification = (id: string) => {
    setNotificationItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      addresses, 
      setAddresses, 
      notifications, 
      setNotifications,
      notificationItems,
      setNotificationItems,
      updateUser,
      markAllNotificationsRead,
      markNotificationRead,
      deleteNotification,
      refreshNotifications,
      isLoadingProfile,
      isLoadingNotifications,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
