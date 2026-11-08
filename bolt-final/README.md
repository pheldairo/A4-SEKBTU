# Smart Campus Room Availability Checker

Single-page React + TypeScript app (Vite, Tailwind, Vitest). It lets a user
filter a small **fictional** room catalog by capacity and equipment, pick a
room and check whether a time slot is free. It only checks availability; it
never creates or stores a booking. No login, payments, live APIs or database.

## Requirements

- Node.js 18 or newer (tested in the bolt.new WebContainer, Node 24)
- npm

## Setup and run

```bash
npm install          # install dependencies
npm run dev          # start the dev server, then open the printed URL
```

Optional fixed clock for manual checks: open `/?now=09:00`
(without the parameter the real clock is used).

## Test and quality commands

```bash
npx vitest run                     # all 70 tests (5 files)
npx vitest run --reporter=verbose  # same, one line per test
npm run typecheck                  # tsc --noEmit -p tsconfig.app.json
npm run build                      # production build into dist/
```

Recorded outputs are in `evidence/` (`a4-01` baseline ... `a4-05` final).

## Project structure

```
src/
  lib/                     pure TypeScript, no React
    types.ts               Booking, Room, Equipment, AvailabilityResult ...
    time.ts                MINUTES_PER_DAY, formatTime, formatRange, parseTime
    clock.ts               nowMinutes() (+ ?now=HH:MM override)
    data.ts                fictional ROOMS catalog (5 rooms) + EQUIPMENT_OPTIONS
    availability.ts        AC1-AC5 rules: intervalsOverlap, checkAvailability
    filters.ts             F1/F2 rules: meetsCapacity, hasAllEquipment, filterRooms
    *.test.ts              Vitest unit/regression suites
  components/              presentation only (props in, JSX out)
    FilterPanel.tsx        attendees + equipment inputs
    RoomList.tsx           filtered room cards + empty state (F4)
    RoomCard.tsx           selected room details and bookings
    Timeline.tsx           day bar for the selected room
    ResultPanel.tsx        Available / Unavailable message
  App.tsx                  state + wiring (selection by id, filters, check)
  App.integration.test.tsx jsdom UI checks of the real <App>
```

## Rules

| ID  | Rule |
|-----|------|
| AC1 | whole minutes, 0 <= start < end <= 1440, start after "now" |
| AC2 | duration at most 120 minutes (120 ok, 121 rejected) |
| AC3 | a blocked room is never available |
| AC4 | overlaps rejected; touching endpoints allowed |
| AC5 | checking never changes booking data |
| AC6 | clear feedback on desktop and mobile |
| F1  | room capacity >= attendees |
| F2  | room has ALL selected equipment |
| F3  | blocked room never reported available (stays listed with a badge) |
| F4  | clear empty state when nothing matches |
| F5  | changing room/filters clears the old result; check uses the chosen room's bookings |
