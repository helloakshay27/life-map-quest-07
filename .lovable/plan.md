

## Plan: Daily Journal Page Enhancements

### Issues Identified

1. **Layout width**: `max-w-2xl` on `DailyJournal.tsx` constrains content to ~672px instead of using full available width
2. **Modal buttons use primary (red)**: Dialog action buttons in `CreateToDoDialog` and `AddAchievementDialog` use `bg-primary` which is red -- need to switch to black (`bg-secondary`)
3. **Dropdowns not searchable**: The Select dropdowns in `CreateToDoDialog` (Life Area, Priority, Status) use Radix Select which doesn't support search -- need to replace with Command-based (combobox) searchable dropdown
4. **Sidebar close/trigger placement**: `SidebarTrigger` is in the header but needs verification that it works correctly and is always accessible
5. **No reusable searchable select component**: Need to create a `SearchableSelect` component for reuse across the project

### Changes

#### 1. Create reusable `SearchableSelect` component
**New file: `src/components/ui/searchable-select.tsx`**
- Built on top of existing `Popover` + `Command` (cmdk) components
- Props: `options`, `value`, `onValueChange`, `placeholder`, `searchPlaceholder`, `label`
- Renders a trigger button that opens a popover with a search input and filterable list
- Will be used in `CreateToDoDialog` and available project-wide

#### 2. Fix modal button colors -- use black instead of red
**Files: `CreateToDoDialog.tsx`, `AddAchievementDialog.tsx`**
- Change action buttons from `<Button>` (default=primary/red) to `<Button variant="secondary">` which maps to `bg-secondary` (black, `0 0% 10%`)
- Dialog title text: change from `text-primary` (red) to `text-foreground` (black)

#### 3. Replace Select dropdowns with SearchableSelect in CreateToDoDialog
**File: `CreateToDoDialog.tsx`**
- Replace all 3 `<Select>` instances (Life Area, Priority, Status) with the new `<SearchableSelect>` component
- Remove `@radix-ui/react-select` imports, add `SearchableSelect` import

#### 4. Fix layout width to 100%
**File: `DailyJournal.tsx`**
- Change `className="mx-auto max-w-2xl animate-fade-in"` to `className="w-full animate-fade-in"` so the journal uses full available width within the layout

#### 5. Verify sidebar trigger placement
**File: `AppLayout.tsx`**
- The `SidebarTrigger` is already in `AppHeader`. The current layout structure has header on top, then flex row with sidebar + main. This is correct. No change needed unless the trigger icon is misplaced -- the current implementation looks correct per the shadcn sidebar pattern.

### Component Reuse Summary
- `SearchableSelect` -- new reusable component, used immediately in `CreateToDoDialog`, available for all future dropdowns
- Button variant `secondary` (black) -- consistent pattern for modal CTAs throughout the app

