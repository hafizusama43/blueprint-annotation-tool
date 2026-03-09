# Blueprint Annotation Canvas (Frontend)

This project implements the core frontend interaction loop for a quantity takeoff workflow:
- open blueprint pages,
- calibrate scale,
- draw linear and area annotations,
- and view measurement results in real time.

## Setup

### Prerequisites
- Node.js 18+ (recommended 20+)
- npm 9+
- Backend API running and reachable

### Environment
Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Update this URL to match your backend host/port.

### Run (single command flow)

```bash
npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture Overview

### Stack
- Next.js App Router + TypeScript
- react-konva for canvas rendering and interaction
- Redux Toolkit + RTK Query for global state and API state
- Tailwind CSS + shadcn/ui for UI

### Component structure
- `app/dashboard/[folderName]/[fileId]/page.tsx`
  - Route entry for file viewer.
- `app/dashboard/[folderName]/[fileId]/file-client.tsx`
  - Fetches file/pages and composes the main layout.
- `app/dashboard/[folderName]/[fileId]/image-slider.tsx`
  - Virtualized page thumbnails with current-page switching.
- `app/dashboard/[folderName]/[fileId]/canvas-stage.tsx`
  - Core annotation canvas:
    - pan/zoom,
    - scale calibration,
    - linear and area drawing,
    - on-canvas labels/measurements.
- `app/dashboard/[folderName]/[fileId]/annotations-panel.tsx`
  - Shape list, selection, rename, delete, and totals.

### State management decisions
State is centralized with Redux Toolkit because multiple UI regions (canvas, panel, slider, toolbar) need synchronized shared data.

- `store/features/blueprint/blueprintSlice.tsx`
  - Tracks `currentPageIndex`.
- `store/features/shapes/shapesSlice.ts`
  - Stores shapes by page, selected shape, label updates, delete actions.
- `store/features/calibration/calibrationSlice.ts`
  - Stores per-page calibration ratio, calibration line, and unit metadata.
- `store/features/blueprint/blueprintsApi.ts`
  - RTK Query endpoints for backend file/page loading.

RTK Query is used to reduce custom request/caching boilerplate and keep async data flow consistent.

## Known Limitations / Trade-offs

- Annotation and calibration data are currently frontend-state based; backend persistence is a next step.
- Shape editing is create/select/rename/delete only (no vertex drag/edit yet).
- Unit handling is ratio-based with user-provided labels; advanced unit conversion/normalization is not yet added.
- Performance optimization is practical but not exhaustive (future options: worker-based computation, viewport culling, tiled rendering for extremely large images).
- Viewer consumes processed page images from backend; client-side PDF parsing/upload processing is not in this frontend scope.

## What This Submission Demonstrates

The delivered frontend covers the assignment’s core interaction goals:
1) smooth navigation in blueprint pages,  
2) accurate calibration workflow,  
3) linear/area measurement tools,  
4) annotation management with clear visual feedback.
