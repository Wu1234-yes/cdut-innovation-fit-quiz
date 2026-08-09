# Background Fit And Media Continuity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore semantically appropriate journey backgrounds and make image/video transitions feel continuous on slow mobile networks.

**Architecture:** Keep background selection in the existing content maps. Add a small image buffering hook inside the film reel so the displayed project changes only after the requested image is decoded. Extend the existing cinematic backdrop state to preserve a played frame during transient stalls, while StationShell prefetches only the next station video.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Playwright, Vite.

---

### Task 1: Lock The Background Mapping

**Files:**
- Create: `src/voyage/content/journey.test.ts`
- Modify: `src/voyage/content/journey.ts`
- Modify: `src/voyage/content/cinematicAssets.ts`
- Test: `src/voyage/content/cinematicAssets.test.ts`

- [ ] Write tests asserting experiment uses `observation-forest`, progress uses `map-black-hole`, expression uses `expression-triptych`, and the egg uses `future-reply` rather than the myth asset.
- [ ] Run `pnpm test src/voyage/content/journey.test.ts src/voyage/content/cinematicAssets.test.ts` and verify the new assertions fail.
- [ ] Change only the corresponding desktop, mobile, and poster paths.
- [ ] Run the focused tests and verify they pass.

### Task 2: Buffer Projection Image Changes

**Files:**
- Create: `src/voyage/components/CinematicFilmReel.test.tsx`
- Modify: `src/voyage/components/CinematicFilmReel.tsx`

- [ ] Write a test that rerenders with a new `activeIndex` and asserts the old projection remains until the target image emits `load` and finishes `decode`.
- [ ] Run `pnpm test src/voyage/components/CinematicFilmReel.test.tsx` and verify the projection changes too early.
- [ ] Add a cancellable image preload effect and render `displayIndex` instead of `activeIndex`.
- [ ] Run the focused test and verify rapid index changes cannot promote a stale request.

### Task 3: Preserve Immediate Motion Feedback

**Files:**
- Modify: `src/voyage/components/CinematicBackdrop.test.tsx`
- Modify: `src/voyage/components/CinematicBackdrop.tsx`
- Modify: `src/voyage/styles/new-voyage.css`

- [ ] Write a test that marks a video as playing, dispatches `stalled`, and asserts the backdrop remains ready.
- [ ] Run `pnpm test src/voyage/components/CinematicBackdrop.test.tsx` and verify it fails.
- [ ] Track whether a first frame has played and ignore transient stalls after that point.
- [ ] Add a reduced-motion-safe poster drift animation that stops being visible after the video fades in.
- [ ] Run the focused test and verify it passes.

### Task 4: Prefetch Only The Next Station

**Files:**
- Modify: `src/voyage/components/StationShell.test.tsx`
- Modify: `src/voyage/components/StationShell.tsx`

- [ ] Write a test asserting experiment prefetches only collaboration's active-viewport video and the last station adds no prefetch.
- [ ] Run `pnpm test src/voyage/components/StationShell.test.tsx` and verify it fails.
- [ ] Add one `<link rel="prefetch" as="video">` for the next station and remove it on unmount or station change.
- [ ] Run the focused test and verify it passes.

### Task 5: Validate And Deploy

**Files:**
- Modify: `tests/e2e/responsive.spec.ts`

- [ ] Add a browser regression test that delays the next projection image and verifies the current image remains visible until replacement.
- [ ] Run `pnpm lint`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.
- [ ] Inspect mobile and desktop screenshots for all five stations, the screening room, and the egg.
- [ ] Sync changed files back to `D:/工作/科创部门适配测评-新生试航版`.
- [ ] Commit, push `main`, wait for the custom domain bundle hash to update, and verify the official site on an emulated phone.
