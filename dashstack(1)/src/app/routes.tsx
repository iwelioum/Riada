import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { NotFound } from "./pages/NotFound";
import { Settings } from "./pages/Settings";

// Membership
import { MemberDetail } from "./pages/MemberDetail";
import { MembersList } from "./pages/MembersList";
import { ContractsList } from "./pages/ContractsList";
import { ContractDetail } from "./pages/ContractDetail";
import { Plans } from "./pages/Plans";

// Operations
import { Clubs } from "./pages/Clubs";
import { Courses } from "./pages/Courses";
import { Schedule } from "./pages/Schedule";
import { AccessControl } from "./pages/AccessControl";
import { Guests } from "./pages/Guests";

// Analytics
import { RiskAnalytics } from "./pages/analytics/RiskAnalytics";
import { FrequencyAnalytics } from "./pages/analytics/FrequencyAnalytics";
import { OptionsAnalytics } from "./pages/analytics/OptionsAnalytics";
import { HealthAnalytics } from "./pages/analytics/HealthAnalytics";

// Billing & Management
import { Invoices } from "./pages/billing/Invoices";
import { InvoiceDetail } from "./pages/billing/InvoiceDetail";
import { Employees } from "./pages/Employees";
import { ShiftsSchedule } from "./pages/ShiftsSchedule";
import { Equipment } from "./pages/Equipment";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/404",
    Component: NotFound,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },

      // Membership
      { path: "members", Component: MembersList },
      { path: "members/:id", Component: MemberDetail },
      { path: "contracts", Component: ContractsList },
      { path: "contracts/:id", Component: ContractDetail },
      { path: "subscriptions/plans", Component: Plans },

      // Operations
      { path: "clubs", Component: Clubs },
      { path: "courses", Component: Courses },
      { path: "courses/schedule", Component: Schedule },
      { path: "access-control", Component: AccessControl },
      { path: "guests", Component: Guests },

      // Employees & Shifts
      { path: "employees", Component: Employees },
      { path: "employees/schedule", Component: ShiftsSchedule },

      // Equipment
      { path: "equipment", Component: Equipment },

      // Analytics
      { path: "analytics/risk", Component: RiskAnalytics },
      { path: "analytics/frequency", Component: FrequencyAnalytics },
      { path: "analytics/options", Component: OptionsAnalytics },
      { path: "analytics/health", Component: HealthAnalytics },

      // Billing
      { path: "billing/invoices", Component: Invoices },
      { path: "billing/invoices/:id", Component: InvoiceDetail },

      // Settings
      { path: "settings", Component: Settings },

      { path: "*", Component: NotFound },
    ],
  },
]);
