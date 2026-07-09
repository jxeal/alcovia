import { Router } from "express";
import { getDb } from "../db";
import { studentExists } from "../utils/student";
import { decodeCursor, encodeCursor } from "../utils/cursor";
import crypto from "crypto";

const router = Router();

//    /students/id
router.get("/:id", (req, res) => {
  const db = getDb();

  const student = db
    .prepare(
      `
      SELECT
        id,
        name,
        initials,
        total_coins AS totalCoins,
        current_streak AS currentStreak,
        daily_goal AS dailyGoal,
        joined_at AS joinedAt
      FROM students
      WHERE id = ?
      `
    )
    .get(req.params.id);

  if (!student) {
    return res.status(404).json({
      error: "Student not found",
      code: "NOT_FOUND",
    });
  }

  res.json(student);
});

//    /students/id/achievements
router.get("/:id/achievements", (req, res) => {
  const db = getDb();

  if (!studentExists(req.params.id)) {
    return res.status(404).json({
      error: "Student not found",
      code: "NOT_FOUND",
    });
  }

  const achievements = db
    .prepare(
      `
      SELECT
        id,
        name,
        description,
        icon,
        unlocked_at AS unlockedAt,
        progress,
        target,
        current
      FROM achievements
      WHERE student_id = ?
      `
    )
    .all(req.params.id);

  res.json(achievements);
});

//    /students/id/stats
router.get("/:id/stats", (req, res) => {
  const db = getDb();

  if (!studentExists(req.params.id)) {
    return res.status(404).json({
      error: "Student not found",
      code: "NOT_FOUND",
    });
  }

  const filter = req.query.filter as string | undefined;
  const period = req.query.period ?? "week";

  if (period !== "week") {
    return res.status(400).json({
      error: "Invalid period",
      code: "INVALID_PERIOD",
    });
  }

  const student = db
    .prepare(
      `
    SELECT
      current_streak as streak,
      daily_goal as dailyGoal
    FROM students
    WHERE id = ?
  `
    )
    .get(req.params.id) as any;

  const total = db
    .prepare(
      `
    SELECT
      COUNT(*) as totalSessions,
      COALESCE(SUM(coins),0) as totalCoins
    FROM sessions
    WHERE student_id = ?
      AND status = 'completed'
  `
    )
    .get(req.params.id) as any;

  const todayCompleted = db
    .prepare(
      `
    SELECT COUNT(*) as todayCompleted
    FROM sessions
    WHERE student_id = ?
      AND status='completed'
      AND date(datetime(started_at/1000,'unixepoch'))
        = date('now')
  `
    )
    .get(req.params.id) as any;

  const week = db
    .prepare(
      `
    SELECT
      strftime('%w', datetime(started_at/1000,'unixepoch')) as day,
      COUNT(*) as count
    FROM sessions
    WHERE student_id = ?
      AND status='completed'
    GROUP BY day
  `
    )
    .all(req.params.id) as any[];

  const map = {
    "1": "mon",
    "2": "tue",
    "3": "wed",
    "4": "thu",
    "5": "fri",
    "6": "sat",
    "0": "sun",
  };

  const sessionsPerDay = Object.values(map).map((day) => ({
    day,
    count: 0,
  }));

  week.forEach((d) => {
    const idx = sessionsPerDay.findIndex(
      (x) => x.day === map[d.day as keyof typeof map]
    );
    if (idx !== -1) sessionsPerDay[idx].count = d.count;
  });

  res.json({
    ...total,
    streak: student.streak,
    dailyGoal: student.dailyGoal,
    todayCompleted: todayCompleted.todayCompleted,
    sessionsPerDay,
  });
});

//    /students/id/sessions
router.get("/:id/sessions", (req, res) => {
  const db = getDb();

  if (!studentExists(req.params.id)) {
    return res.status(404).json({
      error: "Student not found",
      code: "NOT_FOUND",
    });
  }

  const limit = Number(req.query.limit ?? 10);

  if (isNaN(limit) || limit <= 0 || limit > 50) {
    return res.status(400).json({
      error: "Invalid limit",
      code: "INVALID_LIMIT",
    });
  }

  let query = `
    SELECT
      id,
      student_id as studentId,
      type,
      duration_ms as durationMs,
      coins,
      status,
      started_at as startedAt,
      completed_at as completedAt
    FROM sessions
    WHERE student_id = ?
  `;

  const params: any[] = [req.params.id];

  const filter = req.query.filter as string | undefined;

  switch (filter) {
    case "today":
      query += `
        AND date(datetime(started_at/1000,'unixepoch'))
            = date('now')
        `;
      break;

    case "week":
      query += `
        AND date(datetime(started_at/1000,'unixepoch'))
            >= date('now','-6 days')
        `;
      break;

    case "month":
      query += `
        AND strftime('%Y-%m', datetime(started_at/1000,'unixepoch'))
            = strftime('%Y-%m','now')
        `;
      break;

    case undefined:
      break;

    default:
      return res.status(400).json({
        error: "Invalid filter",
        code: "INVALID_FILTER",
      });
  }

  if (req.query.cursor) {
    let decoded;

    try {
      decoded = decodeCursor(req.query.cursor as string);
    } catch {
      return res.status(400).json({
        error: "Invalid cursor",
        code: "INVALID_CURSOR",
      });
    }

    const cursor = db
      .prepare("SELECT started_at FROM sessions WHERE id=?")
      .get(decoded.id) as any;

    if (!cursor) {
      return res.status(400).json({
        error: "Invalid cursor",
        code: "INVALID_CURSOR",
      });
    }

    query += " AND started_at < ?";
    params.push(cursor.started_at);
  }

  query += `
    ORDER BY started_at DESC
    LIMIT ?
  `;

  params.push(limit + 1);

  const rows = db.prepare(query).all(...params) as any[];

  const hasMore = rows.length > limit;

  if (hasMore) rows.pop();

  res.json({
    data: rows,
    cursor: hasMore ? encodeCursor(rows[rows.length - 1].id) : null,
    hasMore,
  });
});

//    /students/id/sessions/sessionId
router.get("/:id/sessions/:sessionId", (req, res) => {
  const db = getDb();

  if (!studentExists(req.params.id)) {
    return res.status(404).json({
      error: "Student not found",
      code: "NOT_FOUND",
    });
  }

  const session = db
    .prepare(
      `
    SELECT
      id,
      student_id as studentId,
      type,
      duration_ms as durationMs,
      coins,
      status,
      datetime(started_at/1000,'unixepoch') || '.000Z' as startedAt,
      CASE
        WHEN completed_at IS NULL THEN NULL
        ELSE datetime(completed_at/1000,'unixepoch') || '.000Z'
      END as completedAt
    FROM sessions
    WHERE id = ?
      AND student_id = ?
  `
    )
    .get(req.params.sessionId, req.params.id) as any;

  if (!session) {
    return res.status(404).json({
      error: "Session not found",
      code: "NOT_FOUND",
    });
  }

  const timeline = db
    .prepare(
      `
    SELECT
      type,
      duration_ms as durationMs,
      started_at as startedAt
    FROM session_timeline
    WHERE session_id = ?
    ORDER BY started_at
  `
    )
    .all(req.params.sessionId);

  res.json({
    ...session,
    timeline,
  });
});

//POST /students/id/sessions
router.post("/:id/sessions", (req, res) => {
  const db = getDb();

  if (!studentExists(req.params.id)) {
    return res.status(404).json({
      error: "Student not found",
      code: "NOT_FOUND",
    });
  }

  const { type, durationMs, timeline } = req.body;

  if (
    !type ||
    !["deep_focus", "quick_sprint", "pomodoro"].includes(type)
  ) {
    return res.status(400).json({
      error: "Invalid session type",
      code: "INVALID_TYPE",
    });
  }

  if (
    typeof durationMs !== "number" ||
    durationMs <= 0
  ) {
    return res.status(400).json({
      error: "Invalid duration",
      code: "INVALID_DURATION",
    });
  }

  if (!Array.isArray(timeline) || timeline.length === 0) {
    return res.status(400).json({
      error: "Timeline is required",
      code: "INVALID_TIMELINE",
    });
  }

  const sessionId = `ses_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

  const startedAt = new Date(timeline[0].startedAt).getTime();
  const completedAt = startedAt + durationMs;

  // Feel free to tweak this formula
  const coins = Math.round(durationMs / 30000);

  const insertSession = db.prepare(`
      INSERT INTO sessions
      (
        id,
        student_id,
        type,
        duration_ms,
        coins,
        status,
        started_at,
        completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertTimeline = db.prepare(`
      INSERT INTO session_timeline
      (
        session_id,
        type,
        duration_ms,
        started_at
      )
      VALUES (?, ?, ?, ?)
  `);

  const updateCoins = db.prepare(`
      UPDATE students
      SET total_coins = total_coins + ?
      WHERE id = ?
  `);

  const transaction = db.transaction(() => {
    insertSession.run(
      sessionId,
      req.params.id,
      type,
      durationMs,
      coins,
      "completed",
      startedAt,
      completedAt
    );

    for (const item of timeline) {
      insertTimeline.run(
        sessionId,
        item.type,
        item.durationMs,
        item.startedAt
      );
    }

    updateCoins.run(coins, req.params.id);
  });

  try {
    transaction();
  } catch {
    return res.status(500).json({
      error: "Failed to create session",
      code: "CREATE_FAILED",
    });
  }

  res.status(201).json({
    id: sessionId,
    studentId: req.params.id,
    type,
    durationMs,
    coins,
    status: "completed",
    startedAt: new Date(startedAt).toISOString(),
    completedAt: new Date(completedAt).toISOString(),
    timeline,
  });
});

export default router;
