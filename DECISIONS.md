# Decisions

For each non-obvious choice you made, explain **why** (not what). Honest assessment of tradeoffs matters more than sounding impressive.

## State Management

What approach did you use for data fetching and state? Why that over the alternatives?

*   **Approach:** I used standard React Native component state (`useState`, `useEffect`) combined with simple promise-based API service calls wrapped in clean helper functions (`getStudent`, `getSessions`, etc. in `src/services/student.ts`).
*   **Why over alternatives (Redux, Zustand, React Query):**
    *   *Reduced Complexity & Boilerplate:* For an application of this scale, setting up a state manager like Redux or Zustand adds unnecessary files, actions, and boilerplate code without offering real architectural value.
    *   *Single Source of Truth:* Each screen (Dashboard, History, Achievements, Session Detail) owns its state. Fetching the latest data directly on screen mount or pull-to-refresh ensures students always see accurate, up-to-date coin balances and streaks.
    *   *Avoided Stale Cache Pitfalls:* Libraries like React Query carry a risk of stale data if caching keys are not perfectly invalidated. Because posting a new completed focus session triggers downstream mutations on multiple tables (incrementing coins, extending streak, updating stats), simple on-demand fetching bypasses complex cache-synchronization bugs.

## API Integration

How did you handle the date format inconsistency between the sessions list (epoch ms) and session detail (ISO string) endpoints? Why that approach?

*   **Approach:** I leveraged the native flexibility of the JavaScript `Date` constructor, which seamlessly parses both Unix epoch timestamps (numbers) and ISO 8601 strings.
    *   In the history screen's `SessionCard.tsx`, the epoch timestamp is passed directly: `new Date(session.startedAt)`.
    *   In the session detail screen `[id].tsx`, the ISO 8601 string is passed: `new Date(session.startedAt)`.
*   **Why:** Normalizing both formats to native JS `Date` objects at the consumption layer is clean, simple, and requires zero extra lines of defensive mapping logic. It avoids unnecessary server-side date conversions or importing heavy third-party date manipulation libraries like `moment` or `dayjs`.

## Pagination

How did you implement cursor-based pagination? What happens when the user scrolls past the last page?

*   **Approach:** 
    *   *Server-side:* Implemented cursor-based pagination in the `GET /students/:id/sessions` route. The client sends a Base64-encoded opaque cursor containing the last-seen session's ID. The server decodes it, fetches its `started_at` timestamp from the database, and queries the next set of records where `started_at < cursor_timestamp`, sorted by `started_at DESC`. It requests `limit + 1` rows to determine if a next page exists (`hasMore`), popping the extra row and encoding its ID as the new cursor.
    *   *Client-side:* Integrated the standard React Native `<FlatList>` component using its `onEndReached` prop to trigger `loadMore()`.
*   **When scrolling past the last page:** Once `hasMore` becomes `false`, the client stops requesting further pages. The list footer (`ListFooterComponent`) displays a friendly message: `"You're all caught up!"` and hides any loading activity indicators.

## Edge Cases

What does the app show when the API is down? When there are 0 sessions? When a request takes 10 seconds?

*   **API Down:** Catch blocks on all fetch calls set a localized `error` state. The UI gracefully transitions to show friendly, non-blocking error banners (e.g., `"Couldn't load sessions."` in History or `"Unable to load session."` on Detail) instead of crashing.
*   **0 Sessions:** If a student has zero sessions, the list displays a clean empty state indicating `"You're all caught up!"` or `"No sessions yet."` inside the History feed, ensuring the screen is never blank.
*   **10-Second Slow Request:** To prevent UI freezing, screens render standard `ActivityIndicator` during the active state loading transition, providing visual feedback that an operation is in progress. 

## Session Detail

What did you put on this screen and why? What data felt useful vs noise?

*   **Content Choice:**
    *   *Hero Visual Card:* Displays a large, colorful emoji corresponding to the session type, the total coins earned (`+50 Coins`), and a uppercase status badge (`COMPLETED`).
    *   *Summary Details:* Shows structured rows for total duration ("45 min 0 sec"), started time, and completion time.
    *   *Chronological Timeline:* Renders each individual focus and break lap (e.g., Focus, Break, Focus) with duration and timestamp.
*   **Useful vs. Noise:**
    *   *Useful:* Interval breakdown, total coins, and duration are highly encouraging and informative for a student reflecting on their study habits.
    *   *Noise:* Raw internal database keys like `studentId` or `sessionId` are completely hidden as they are meaningless to end-users and clutter the interface.

## What's Weak

What is the weakest part of your implementation? If you had 2 more days, what would you fix first?

*   **Weakest Part:** *Lack of Offline Synchronization/Caching.* Since the app has no offline cache layer (like AsyncStorage or SQLite/Room on the mobile side), opening the app without an internet connection results in empty error screens.
*   **What to Fix First (with 2 more days):**
    1.  *Offline Caching:* Add a local cache utilizing WatermelonDB or AsyncStorage to store the student's profile, stats, and history locally, enabling instant boot and offline usability.
    2.  *Haptic/Audio Feedback:* Build haptic feedback and sound alarms for the Focus Timer when transitions occur (e.g., focus session ending or break starting), which is critical for physical Pomodoro users who aren't looking at their screens.
    3. *Final Touches:* No app is completely bug free, so I would also spend some time to check the app thoroughly, and fix some remaining bugs, and make the process smoother for the end user (students). 

## What Breaks at Scale

If this app had 10,000 concurrent users hitting your API, what breaks first? What would you change?

*   **What Breaks First:** *Express SQLite Database Locking.* SQLite is designed for lightweight or local file access. Under high concurrent write loads (e.g., 10,000 users finishing focus sessions simultaneously), SQLite's write-lock serialization will cause severe lock contention, resulting in database-busy errors and API timeouts.
*   **What to Change:**
    1.  *Database Migration:* Migrate from SQLite to a highly concurrent distributed database like PostgreSQL (with connection pooling) or Google Cloud Spanner.
    2.  *Caching Layer:* Add Redis to cache user profiles, stats, and achievements, bypassing database hits for frequent read operations.
    3.  *Asynchronous Background Workers:* Offload streak calculations and achievement unlocking from the critical request-response thread using a message broker like RabbitMQ or BullMQ.

---

## (Bonus) Achievements Screen

You had no design for this screen. Walk through your decisions: layout choice, locked vs unlocked treatment, progress visualization.

*   **Layout Choice:** Formulated a clean vertical scroll view that starts with a prominent top Progress Summary Card indicating `"Unlocked: X / Y"` with an encouraging horizontal progress bar.
*   **Locked vs. Unlocked:** Unlocked achievements are rendered in high-contrast vibrant colors. Locked achievements use greyscale filters (opacity styling) and a lock icon to make unlocking milestones feel rewarding.
*   **Progress Visualization:** Displays numerical progress beneath locked milestones (e.g., `17 / 30`) with a thin linear progress bar so students can easily gauge their proximity to completion.

## (Bonus) Focus Timer

This screen had no design spec at all. How did you decide what to build? What did you intentionally leave out?

*   **Decisions on What to Build:** Designed a minimalist, distraction-free interface centering a large countdown timer (`MM:SS`) with a progress indicator. Implemented an active Pomodoro state machine that automates focusing and resting cycles.
*   **Intentionally Left Out:** Omitted manual custom timing settings (custom input fields) to keep the interaction flow quick and friction-free, choosing instead to rely strictly on pre-defined academic presets (Sprint, Deep Focus, Pomodoro).
