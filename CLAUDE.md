# Scheduler App — Project Context

## Purpose

A mobile app for a store manager to schedule employees on a weekly basis. The manager can view the week at a glance, add and edit shifts for any day, and manage the employee roster. All data is stored locally on the device.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81.5 via Expo 54 (managed workflow) |
| Navigation | Expo Router 6 (file-based, stack navigator) |
| Database | expo-sqlite 16 — local SQLite on-device |
| Language | TypeScript 5.9.2, strict mode |
| React | React 19.1.0 |

Run with `npx expo start`. No backend — fully offline, single-device.

## Project Structure

```
app/
  _layout.tsx          # Root stack navigator (no header)
  index.tsx            # Main screen — all app state lives here
components/
  WeekView.tsx         # Renders 7 DayColumns in a horizontal ScrollView
  DayColumn.tsx        # One column per day — lists ShiftCards, tap to add
  ShiftCard.tsx        # Single shift display card (color-coded by role)
  ShiftDrawer.tsx      # Slide-up modal for creating / editing a shift
  EmployeesModal.tsx   # Slide-up modal for managing the employee roster
db/
  database.ts          # SQLite init + all queries (employees & shifts tables)
App.tsx                # Unused boilerplate — entry point is app/index.tsx
index.ts               # registerRootComponent(App) — Expo entry registration
app.json               # Expo config (name, plugins, new architecture on)
```

## Data Model

### Employee
```typescript
{ id: number; name: string; role: 'tech' | 'manager' }
```

### Shift
```typescript
{
  id: number;
  employee_id: number;
  employee_name: string;   // joined from employees table on read
  role: string;
  date: string;            // YYYY-MM-DD
  start_time: string;      // HH:MM
  end_time: string;        // HH:MM
}
```

### SQLite Tables (scheduler.db)

**employees**
- id INTEGER PRIMARY KEY AUTOINCREMENT
- name TEXT NOT NULL
- role TEXT DEFAULT 'tech'

**shifts**
- id INTEGER PRIMARY KEY AUTOINCREMENT
- employee_id INTEGER NOT NULL
- date TEXT NOT NULL
- start_time TEXT NOT NULL
- end_time TEXT NOT NULL

Deleting an employee cascades and removes all their shifts.

## Database API (db/database.ts)

| Function | Description |
|---|---|
| `initDatabase()` | Creates tables if they don't exist — called on app mount |
| `getEmployees()` | All employees sorted by name |
| `addEmployee(name, role)` | Insert new employee |
| `deleteEmployee(id)` | Delete employee + their shifts |
| `getShiftsForWeek(weekStart)` | 7-day window joined with employees |
| `addShift(employee_id, date, start_time, end_time)` | Create shift |
| `updateShift(id, employee_id, start_time, end_time)` | Edit shift |
| `deleteShift(id)` | Remove shift |

## UI Flow

1. App opens to the current week's grid (Mon–Sun columns, horizontally scrollable).
2. Header shows the week date range, total shift count for the week, and a "Staff" button.
3. Prev / Today / Next buttons navigate between weeks.
4. Tap any day column → **ShiftDrawer** slides up to create a new shift.
5. Tap an existing shift card → **ShiftDrawer** slides up pre-filled to edit or delete.
6. Tap "Staff" → **EmployeesModal** slides up to add or remove employees.

## Roles & Color Coding

- `tech` — blue (`#007aff`)
- `manager` — green (`#34c759`)

Roles are currently hardcoded to these two values.

## Design System

All styling uses React Native StyleSheet (no external UI library). Palette:

| Token | Value | Usage |
|---|---|---|
| Primary | `#007aff` | Tech role, interactive buttons |
| Green | `#34c759` | Manager role, add/confirm actions |
| Destructive | `#ff3b30` | Delete actions |
| Text | `#1d1d1f` | Primary text |
| Secondary text | `#6e6e73` | Labels, placeholders |
| Background | `#f5f5f7` | App background |
| Surface | `#ffffff` | Cards, modals |

## Known Gaps / Planned Work

- **No time picker** — times are typed as raw text (HH:MM). Needs a proper time picker component.
- **No input validation** — no format check on times, no end-after-start enforcement.
- **No conflict detection** — an employee can be double-booked on the same day.
- **No user feedback** — saves and deletes are silent (no toasts, no loading states).
- **App.tsx is dead code** — can be deleted; Expo Router owns the entry point.
- **No data export** — no way to share or print the schedule (PDF/share would be useful).
- **Single location** — no multi-store or multi-manager support needed now.
