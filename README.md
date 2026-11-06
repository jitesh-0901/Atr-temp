# ATR — Enterprise Attendance Tracker (MVP V1.0)

> **High-Performance, Scalable Enterprise Attendance & Leave Governance UI**  
> Built with **React 18 + TypeScript + Tailwind CSS + React Router + Vite**.  
> Pure Frontend implementation with full client-side state machine, URL routing, and LocalStorage persistence.

---

## 🌟 Executive Overview & Specification Compliance

This implementation strictly adheres to the **Attendance Tracker (ATR) MVP Implementation Specification & Feature Evaluation Checklist (Version 1.0)**:

| Feature ID | Scope Requirement | Implementation Details |
| :--- | :--- | :--- |
| **F01** | **Authentication & Account Creation** | Admin-created employee accounts (`CreateEmployeeModal`), temporary passwords, login/logout, password reset request modal, and deactivated account login lock. |
| **F02** | **Role-Based Access Control** | Strictly partitioned two-role system: `ADMIN` and `USER` (Employee). Dedicated client-side route paths, view-level authorization guards, and quick role switcher. |
| **F03** | **Email Notifications** | Asynchronous email dispatch architecture for account creation, leave decisions, cancellations, corrections, direct edits, and auto-absence marking. Inspectable via the **Email Outbox Drawer**. |
| **F04** | **Multi-Session Attendance** | Multiple check-in / check-out cycles per day. Preserves earliest `first_check_in`, latest `last_check_out`, and calculates paired worked duration strictly from valid intervals. Live ticking session timer. |
| **F05** | **Attendance Logs & Ledger** | Employee views own logs; Admin filters organization attendance by employee, date range, and status. Expandable punch chronology. |
| **F06** | **Leave Requests & Workflow** | States: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`. Employees can cancel pending **and** approved leave. Admin approval/rejection with remarks. Leave quota balance cards. |
| **F07** | **Role-Specific Dashboards** | Employee dashboard with live work state, monthly metrics, and upcoming holidays. Admin dashboard with real-time aggregates, attendance breakdown chart, and review queues. |
| **F08** | **Profile Management** | Employees view profile and edit only permitted personal fields. Invariant administrative fields (ID, department, role) are protected. Profile placed at the bottom of the sidebar. |
| **F09** | **Holiday Management** | Working calendar schedule and holiday management. Enforces duplicate holiday date uniqueness check and active toggles. |
| **F10** | **Basic Settings** | Configurable organization timezone (`Asia/Kolkata IST`), attendance deadline (`10:30 AM`), weekly working days, and auto-absence rules. |
| **F11** | **Corrections & Audit Trail** | Employee correction requests with reasons; Admin review and transactional recalculation; Admin direct edits with mandatory justification; Immutable audit log (Table 7). |
| **F12** | **Absence Automation Engine** | Interactive simulator testing the Celery absence marking engine: skips holidays, non-working days, approved leaves, and checked-in staff; marks unrecorded staff absent and queues email alerts. |

---

## 🎨 Design, Dedicated Logo & Animation Engine

1. **Custom ATR Logo (`AtrLogo.tsx`)**:
   - Iconic biometric clock dial emblem with a verified timing punch arc and live pulse indicator.
   - Clean, geometric modern typography with **ATR V1.0** branding.
2. **Deep Concentrated Royal Blue**:
   - Concentrated Royal Sapphire (`#174BE8`) & Cobalt (`#1239C4`) applied across primary action buttons, active navigation pills, badges, and accents.
3. **Smooth Animation Suite**:
   - **Page Transitions**: Smooth fade & slide-up transitions (`animate-fade-in`, `animate-slide-up`).
   - **Card & Button Micro-Interactions**: Hover elevation lift, button active tap scale (`active:scale-[0.98]`), and glowing rings for active sessions (`animate-pulse-glow`).
   - **Modal & Drawer Transitions**: Backdrop smooth fade, dialog zoom-in scale (`animate-scale-in`), and email outbox slide-in (`animate-slide-left`).
4. **100% Fully Responsive**:
   - Fluid mobile navigation with a sliding drawer, mobile-optimized headers, responsive grid stat cards, and scrollable data tables.

---

## 🌐 Dedicated URL Routing

| Route | Page Component | Role Access |
| :--- | :--- | :--- |
| `/dashboard` | `DashboardPage` | Admin & Employee |
| `/attendance` | `AttendancePage` | Today's Live Punch & Sessions |
| `/attendance-logs`| `AttendanceLogsPage` | Ledger & History |
| `/leave` | `LeaveRequestsPage` | Leave Quota & Approvals |
| `/corrections` | `CorrectionsPage` | Correction Requests & Audit Trail |
| `/employees` | `EmployeesPage` | Admin Only Roster |
| `/holidays` | `HolidaysPage` | Calendar & Holiday Management |
| `/settings` | `SettingsPage` | Rules & Celery Absence Simulator |
| `/profile` | `ProfilePage` | Employee Profile & Settings |
| `/login` | `LoginPage` | Authentication & Demo Quick Login |

---

## 🚀 How to Run

```bash
# Start development server
npm run dev

# Or build and preview production bundle
npm run build
npm run preview
```
