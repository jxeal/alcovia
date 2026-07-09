import React, { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";
import { createSession } from "@/src/services/student";
import { TimelineEntry, SessionType } from "@/types/api";

const BREAK_DURATION = 5 * 60;

export default function TimerScreen() {
  const params = useLocalSearchParams();
  const sessionType = params.type as SessionType;
  const title = (params.title as string) || "Focus Session";
  const TOTAL_DURATION = Number(params.duration);
  const BREAK_EVERY = Number(params.breakEvery);

  // UI State
  const [running, setRunning] = useState(true);
  const [posting, setPosting] = useState(false);
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_DURATION);
  const [elapsedFocus, setElapsedFocus] = useState(0);
  const [lapNumber, setLapNumber] = useState(1);
  const [timelineDisplay, setTimelineDisplay] = useState<TimelineEntry[]>([]);

  // Logic Refs (The "Source of Truth")
  const secondsLeftRef = useRef(TOTAL_DURATION);
  const focusSinceLastBreakRef = useRef(0);
  const currentLapSecondsRef = useRef(0);
  const pausedFocusTimeLeftRef = useRef(TOTAL_DURATION);
  const timeline = useRef<TimelineEntry[]>([]);
  const currentLapStartedAt = useRef(new Date());

  function format(seconds: number) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  function saveLapToTimeline(type: "focus" | "break", durationSeconds: number) {
    if (durationSeconds <= 0) return;
    const entry: TimelineEntry = {
      type,
      durationMs: durationSeconds * 1000,
      startedAt: currentLapStartedAt.current.toISOString(),
    };
    timeline.current.push(entry);
    setTimelineDisplay([...timeline.current]); // Sync UI
    currentLapStartedAt.current = new Date();
    currentLapSecondsRef.current = 0;
  }

  const takeBreak = () => {
    if (mode === "break") return;
    // 1. Save focus lap
    saveLapToTimeline("focus", currentLapSecondsRef.current);
    // 2. Remember where we were in the focus timer
    pausedFocusTimeLeftRef.current = secondsLeftRef.current;
    // 3. Switch to break
    focusSinceLastBreakRef.current = 0;
    secondsLeftRef.current = BREAK_DURATION;
    setSecondsLeft(BREAK_DURATION);
    setMode("break");
    setLapNumber(n => n + 1);
  };

  const resumeFocus = () => {
    if (mode === "focus") return;
    // 1. Save break lap
    saveLapToTimeline("break", BREAK_DURATION - secondsLeftRef.current);
    // 2. Restore focus timer
    secondsLeftRef.current = pausedFocusTimeLeftRef.current;
    setSecondsLeft(pausedFocusTimeLeftRef.current);
    setMode("focus");
    setLapNumber(n => n + 1);
  };

  const finishSession = async () => {
    if (posting) return;
    setRunning(false);

    // Save final lap
    if (mode === "focus") {
      saveLapToTimeline("focus", currentLapSecondsRef.current);
    } else {
      saveLapToTimeline("break", BREAK_DURATION - secondsLeftRef.current);
    }

    try {
      setPosting(true);
      const totalDurationMs = timeline.current.reduce((sum, lap) => sum + lap.durationMs, 0);

      await createSession("stu_01", {
        type: sessionType,
        durationMs: totalDurationMs,
        timeline: timeline.current,
      });

      Alert.alert("🎉 Session Complete", "Great job!", [{ text: "OK", onPress: () => router.replace("/") }]);
    } catch (e) {
      Alert.alert("Error", "Couldn't save session.");
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    if (!running || posting) return;

    const interval = setInterval(() => {
      // Tick Down
      secondsLeftRef.current -= 1;
      setSecondsLeft(secondsLeftRef.current);

      if (mode === "focus") {
        currentLapSecondsRef.current += 1;
        focusSinceLastBreakRef.current += 1;
        setElapsedFocus(prev => prev + 1);

        // Check for Auto-Break
        if (BREAK_EVERY > 0 && focusSinceLastBreakRef.current >= BREAK_EVERY) {
          takeBreak();
        }
        // Check for Session End
        if (secondsLeftRef.current <= 0) {
          finishSession();
        }
      } else {
        // Break Mode - check if break is over
        if (secondsLeftRef.current <= 0) {
          resumeFocus();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [running, mode, posting]);

  const progress = ((TOTAL_DURATION - (mode === 'focus' ? secondsLeft : pausedFocusTimeLeftRef.current)) / TOTAL_DURATION) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.badges}>
        <View style={[styles.badge, mode === 'break' && { backgroundColor: Colors.amber }]}>
          <Text style={[styles.badgeText, mode === 'break' && { color: '#FFF' }]}>{mode.toUpperCase()}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Lap {lapNumber}</Text>
        </View>
      </View>

      <Text style={styles.timer}>{format(secondsLeft)}</Text>
      <Text style={styles.elapsed}>Focus Time: {format(elapsedFocus)}</Text>

      <View style={styles.progressContainer}>
        <View style={[styles.progress, { width: `${Math.max(0, Math.min(100, progress))}%` }]} />
      </View>

      <Text style={styles.timelineTitle}>Timeline</Text>
      <View style={styles.timeline}>
        <ScrollView>
          {timelineDisplay.length === 0 ? (
            <Text style={styles.empty}>No completed laps yet</Text>
          ) : (
            timelineDisplay.map((lap, index) => (
              <View key={index} style={styles.timelineRow}>
                <Text style={styles.timelineType}>{lap.type.toUpperCase()}</Text>
                <Text style={styles.timelineTime}>{Math.floor(lap.durationMs / 1000)}s</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.primary} onPress={() => setRunning(!running)}>
          <Text style={styles.buttonText}>{running ? "Pause" : "Resume"}</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={mode === "focus" ? takeBreak : resumeFocus}>
          <Text style={styles.buttonText}>{mode === "focus" ? "Break" : "Focus"}</Text>
        </Pressable>
      </View>

      <View style={styles.row}>
        <Pressable style={styles.finish} onPress={finishSession}>
          <Text style={styles.buttonText}>Finish</Text>
        </Pressable>
        <Pressable style={styles.stop} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Quit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.text, textAlign: "center", marginTop: 12 },
  badges: { flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 18, marginBottom: 30 },
  badge: { backgroundColor: Colors.primaryLight, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  badgeText: { color: Colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 12 },
  timer: { marginTop: 8, fontSize: 64, textAlign: "center", color: Colors.primary, fontFamily: "Inter_700Bold" },
  elapsed: { marginTop: 10, marginBottom: 24, textAlign: "center", color: Colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 14 },
  progressContainer: { height: 12, width: "100%", backgroundColor: "#E5E7EB", borderRadius: 999, overflow: "hidden", marginBottom: 30 },
  progress: { height: "100%", backgroundColor: Colors.primary },
  timelineTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.text, marginBottom: 12 },
  timeline: { flex: 1, backgroundColor: "#FFF", borderRadius: 16, padding: 16, marginBottom: 24 },
  empty: { textAlign: "center", color: Colors.textSecondary, fontFamily: "Inter_400Regular", marginTop: 16 },
  timelineRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F1F1F1" },
  timelineType: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: Colors.text },
  timelineTime: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Inter_500Medium" },
  row: { flexDirection: "row", gap: 12, marginBottom: 12 },
  primary: { flex: 1, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  secondary: { flex: 1, backgroundColor: Colors.amber, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  finish: { flex: 1, backgroundColor: Colors.success, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  stop: { flex: 1, backgroundColor: "#EF4444", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  buttonText: { color: "#FFF", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});