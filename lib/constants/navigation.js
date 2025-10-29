import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  ShoppingCart,
  Receipt,
  CreditCard,
  Clock,
  BarChart3,
  Settings,
  UserPlus,
} from "lucide-react";

export const navigationItems = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "staff"],
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        title: "Products",
        href: "/dashboard/products",
        icon: Package,
        roles: ["admin", "staff"],
      },
      {
        title: "Suppliers",
        href: "/dashboard/suppliers",
        icon: Truck,
        roles: ["admin", "staff"],
      },
    ],
  },
  {
    title: "Sales & Purchases",
    items: [
      {
        title: "Purchases",
        href: "/dashboard/purchases",
        icon: ShoppingCart,
        roles: ["admin", "staff"],
      },
      {
        title: "Customer Billing",
        href: "/dashboard/sales",
        icon: Receipt,
        roles: ["admin", "staff"],
      },
      {
        title: "Customers",
        href: "/dashboard/customers",
        icon: Users,
        roles: ["admin", "staff"],
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        title: "Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
        roles: ["admin", "staff"],
      },
      {
        title: "Due Invoices",
        href: "/dashboard/due-invoices",
        icon: Clock,
        roles: ["admin", "staff"],
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Reports",
        href: "/dashboard/reports",
        icon: BarChart3,
        roles: ["admin"], // Admin only
        badge: "Admin",
      },
      {
        title: "Create User",
        href: "/dashboard/admin/create-user",
        icon: UserPlus,
        roles: ["admin"], // Admin only
        badge: "Admin",
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        roles: ["admin"], // Admin only
        badge: "Admin",
      },
    ],
  },
];

export function getNavigationForRole(role) {
  return navigationItems
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}
