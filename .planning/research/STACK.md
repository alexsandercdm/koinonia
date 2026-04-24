# Technology Stack — v1.1 Frontend CRUD Additions

**Project:** Koinonia  
**Researched:** 2026-04-22  
**Scope:** NEW additions only for v1.1 CRUD screens. Existing stack is NOT re-listed unless an integration note is required.

---

## Already Covered — No Action Required

| Capability | Library | Note |
|---|---|---|
| Forms + validation | react-hook-form ^7.51 + @hookform/resolvers + zod ^3.22 | Use `zodResolver` from `@hookform/resolvers/zod`. Shared schemas from `packages/shared` flow directly into resolver. No change needed. |
| Data tables | @tanstack/react-table ^8 | Sufficient for participant list, event list, inscription list. No AG-Grid or MUI DataGrid. |
| Modal / dialog | @radix-ui/react-dialog ^1.0.5 | Already installed. Create/edit forms open in Dialog. |
| Drawer / sheet | sheet.tsx in /ui | Already built from Radix. Use for mobile slide-over panels. |
| PDF export | html2canvas ^1.4.1 + jspdf ^2.5.1 | Already installed. Capture the visual accommodation map canvas → jsPDF. No replacement needed. |
| Charts / financials | recharts ^2.12 | Already installed. |
| Icons | lucide-react ^0.363 | Already installed. |
| Toast | @radix-ui/react-toast ^1.1.5 | Already installed. Sufficient — skip sonner unless this proves painful. |
| Routing | react-router-dom ^6.22 | **Observation:** PROJECT.md says "TanStack" but package.json has react-router-dom. The installed dep is authoritative. Do NOT add TanStack Router in v1.1 — it's scope creep. |

---

## Gaps — New Installs Required

### 1. Date Picker

**Install:** `@radix-ui/react-popover ^1.1.15` + `react-day-picker ^9.14.0` + `date-fns ^4.1.0`

```bash
pnpm add react-day-picker date-fns @radix-ui/react-popover
```

**Why:** Events and inscriptions require date fields (start/end, payment date). react-day-picker 9.x is the shadcn-compatible standard, pairs natively with date-fns for locale/formatting, and handles touch targets correctly on mobile (>=48px by default with its CSS). date-fns (not dayjs) because react-day-picker's TS types and locale system integrate with date-fns directly.

**Integration:** Wrap inside a shadcn-style `<DatePicker>` component that composes `Popover` + `DayPicker` + RHF `Controller`. Store values as ISO strings to align with backend Zod schemas.

---

### 2. Brazilian Input Masks (CPF, Phone, CEP, Currency)

**Install:** `react-imask ^7.6.1`

```bash
pnpm add react-imask
```

**Why:** Participant forms require CPF (000.000.000-00), phone ((00) 00000-0000), CEP (00000-000), and currency (R$ 1.234,56). react-imask is the most maintained mask library for React with TypeScript support. It integrates with RHF via `Controller`. Avoid react-number-format for non-numeric masks (it handles only numbers); avoid @react-input/mask (less adoption).

**Integration:** Create a `<MaskedInput>` wrapper using `IMaskInput` + RHF `Controller`. Define mask patterns once in `packages/shared/masks.ts` so API and UI stay aligned on format.

---

### 3. File Upload UX (Payment Receipts)

**Install:** `react-dropzone ^15.0.0`

```bash
pnpm add react-dropzone
```

**Why:** Inscription payment flow requires uploading receipt images/PDFs. react-dropzone provides the drop zone UX (drag + click + mobile tap) without a backend upload library — files are passed to RHF as `FileList` then POSTed via `multipart/form-data` fetch. No tus/uppy needed; receipts are small one-off uploads.

**Integration:** Create a `<FileUpload>` component using `useDropzone`. Accept `image/*,application/pdf`. Store the `File` object in RHF state, upload on form submit via a dedicated `/api/inscricoes/:id/comprovante` endpoint (to be built in API phase).

**Constraint note:** Do NOT install a full upload SDK (tus-js-client, uppy, S3 SDK). Self-hosted constraint means the backend handles storage locally. Simple fetch + FormData is sufficient.

---

### 4. Missing Radix UI Primitives

These are needed for form controls not yet in /ui. Install all together:

```bash
pnpm add @radix-ui/react-checkbox @radix-ui/react-radio-group @radix-ui/react-tabs @radix-ui/react-scroll-area
```

| Primitive | Version | Use Case |
|---|---|---|
| @radix-ui/react-checkbox | ^1.3.3 | Health data flags (allergies, restrictions checkboxes) |
| @radix-ui/react-radio-group | ^1.3.8 | Gender selection, payment method selection |
| @radix-ui/react-tabs | ^1.1.13 | Participant detail view (Personal / Health / History tabs) |
| @radix-ui/react-scroll-area | ^1.1.x | Visual accommodation map scroll container |

Note: `@radix-ui/react-popover ^1.1.15` is already listed under Date Picker above.

---

### 5. Offline Grace — Query Persistence

**Install:** `@tanstack/react-query-persist-client ^5.99.2` + `@tanstack/query-sync-storage-persister`

```bash
pnpm add @tanstack/react-query-persist-client @tanstack/query-sync-storage-persister
```

**Why:** PROJECT.md constraint: "TanStack Query deve reter cache por tempo estendido (conexão instável na chácara)." Default staleTime/gcTime is not enough for offline grace. The persist-client serializes the query cache to localStorage and rehydrates on mount, so the app shows stale data rather than error screens when the connection drops.

**Integration:** Configure in `main.tsx` by wrapping `QueryClient` with `PersistQueryClientProvider`. Set `gcTime: 1000 * 60 * 60 * 24` (24h) and `staleTime: 1000 * 60 * 5` (5min). Only persist queries tagged with `['participantes']`, `['eventos']`, `['inscricoes']` — not mutations or auth queries.

---

## What NOT to Add

| Category | Excluded | Reason |
|---|---|---|
| UI frameworks | MUI, Chakra, Mantine | Fight Radix + shadcn pattern; bloat Tailwind build |
| Tables | AG-Grid, MUI DataGrid | TanStack Table is sufficient; both are heavy |
| Forms | Formik, react-final-form | react-hook-form already present |
| HTTP | axios | fetch() is sufficient with Better Auth cookies |
| Dates | dayjs | date-fns already chosen (react-day-picker integration) |
| Upload | tus-js-client, uppy, AWS SDK | Self-hosted; simple FormData fetch is enough |
| Toast | sonner | Radix Toast already installed; add only if DX proves painful |
| Router | @tanstack/router | react-router-dom is installed and working; migration is v1.2+ concern |

---

## Summary — Net New Packages

```bash
pnpm add \
  react-day-picker \
  date-fns \
  @radix-ui/react-popover \
  react-imask \
  react-dropzone \
  @radix-ui/react-checkbox \
  @radix-ui/react-radio-group \
  @radix-ui/react-tabs \
  @radix-ui/react-scroll-area \
  @tanstack/react-query-persist-client \
  @tanstack/query-sync-storage-persister
```

Estimated bundle delta: ~85 KB gzipped (date-fns is tree-shaken; react-day-picker ~30 KB; react-dropzone ~12 KB; react-imask ~18 KB; Radix primitives ~3-5 KB each; persist-client ~8 KB).

---

## Sources

- npm registry versions verified 2026-04-22
- react-day-picker: https://daypicker.dev/
- react-imask: https://imask.js.org/
- react-dropzone: https://react-dropzone.js.org/
- TanStack Query persistence: https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient
- shadcn/ui component patterns: https://ui.shadcn.com/docs/components
