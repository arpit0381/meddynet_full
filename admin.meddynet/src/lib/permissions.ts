// RBAC Permission Configuration for MeddyNet Admin

export type AdminRole = "superadmin" | "operations" | "finance" | "support" | "content";

export interface AdminPermissions {
  routes: string[];
  actions: string[];
}

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  superadmin: {
    routes: ["*"], // All routes
    actions: [
      "can_delete_user", "can_ban_user", "can_verify_lab", "can_reject_lab", "can_delete_lab",
      "can_approve_payout", "can_hold_payout", "can_reject_payout", "can_process_batch_payout",
      "can_delete_booking", "can_issue_refund", "can_approve_refund", "can_reject_refund",
      "can_delete_ticket", "can_close_ticket", "can_assign_ticket",
      "can_create_coupon", "can_delete_coupon", "can_pause_coupon",
      "can_publish_review", "can_flag_review", "can_remove_review",
      "can_create_api_key", "can_revoke_api_key",
      "can_manage_roles", "can_view_audit_log", "can_clear_audit_log",
      "can_export_data", "can_manage_settings", "can_manage_ip_allowlist",
      "can_send_notification", "can_delete_notification",
      "can_publish_blog", "can_delete_blog",
      "can_manage_cities", "can_manage_zones",
    ],
  },
  operations: {
    routes: [
      "/admin/overview", "/admin/users", "/admin/labs", "/admin/bookings",
      "/admin/technicians", "/admin/support", "/admin/notifications", "/admin/analytics",
      "/admin/cities", "/admin/onboarding", "/admin/reviews",
    ],
    actions: [
      "can_ban_user", "can_verify_lab", "can_reject_lab",
      "can_delete_booking", "can_issue_refund",
      "can_close_ticket", "can_assign_ticket",
      "can_publish_review", "can_flag_review",
      "can_manage_cities", "can_manage_zones",
    ],
  },
  finance: {
    routes: [
      "/admin/overview", "/admin/financials", "/admin/subscriptions",
      "/admin/refunds", "/admin/coupons", "/admin/data-export",
    ],
    actions: [
      "can_approve_payout", "can_hold_payout", "can_reject_payout", "can_process_batch_payout",
      "can_approve_refund", "can_reject_refund",
      "can_create_coupon", "can_delete_coupon", "can_pause_coupon",
      "can_export_data",
    ],
  },
  support: {
    routes: [
      "/admin/overview", "/admin/support", "/admin/users", "/admin/bookings",
      "/admin/refunds", "/admin/reviews",
    ],
    actions: [
      "can_close_ticket", "can_assign_ticket",
      "can_issue_refund",
      "can_flag_review",
    ],
  },
  content: {
    routes: [
      "/admin/overview", "/admin/blog", "/admin/notifications", "/admin/feedback",
    ],
    actions: [
      "can_publish_blog", "can_delete_blog",
      "can_send_notification", "can_delete_notification",
    ],
  },
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: "Super Admin",
  operations: "Operations",
  finance: "Finance",
  support: "Support",
  content: "Content",
};

export const ROLE_COLORS: Record<AdminRole, string> = {
  superadmin: "bg-purple-100 text-purple-700 border border-purple-200",
  operations: "bg-blue-100 text-blue-700 border border-blue-200",
  finance: "bg-green-100 text-green-700 border border-green-200",
  support: "bg-orange-100 text-orange-700 border border-orange-200",
  content: "bg-pink-100 text-pink-700 border border-pink-200",
};

export function hasPermission(role: AdminRole, action: string): boolean {
  if (role === "superadmin") return true;
  return ROLE_PERMISSIONS[role].actions.includes(action);
}

export function canAccessRoute(role: AdminRole, route: string): boolean {
  if (role === "superadmin") return true;
  return ROLE_PERMISSIONS[role].routes.some(r => route.startsWith(r));
}
