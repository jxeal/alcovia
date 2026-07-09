import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { Colors } from "@/constants/Colors";
import { createSession } from "@/src/services/student";

const SESSION_DURATION = 25 * 60; // 25 minutes

export default function FocusScreen() {
  const [secondsLeft, setSecondsLeft] = useState(SESSION_DURATION);
  const [running, setRunning] = useState(true);
  const [posting, setPosting] = useState(false);

  const startedAt = useRef(new Date());

  useEffect(() => {
    if (!running || posting) return;

    if (secondsLeft <= 0) {
      finishSession();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [running, secondsLeft]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");

    const secs = (totalSeconds % 60)
      .toString()
      .padStart(2, "0");

    return `${mins}:${secs}`;
  };

  async function finishSession() {
    if (posting) return;

    try {
      setPosting(true);

      const completedAt = new Date();

      const durationMs =
        completedAt.getTime() - startedAt.current.getTime();

      await createSession("stu_01", {
        type: "deep_focus",
        durationMs,
        timeline: [
          {
            type: "focus",
            durationMs,
            startedAt: startedAt.current.toISOString(),
          },
        ],
      });

      Alert.alert("🎉 Session Complete", "Great work!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err) {
      console.error(err);

      Alert.alert(
        "Error",
        "Couldn't save your session."
      );
    } finally {
      setPosting(false);
    }
  }

  function stopSession() {
    setRunning(false);

    Alert.alert(
      "Stop Session?",
      "This session won't be saved.",
      [
        {
          text: "Cancel",
          onPress: () => setRunning(true),
        },
        {
          text: "Stop",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Deep Focus</Text>

      <Text style={styles.timer}>
        {formatTime(secondsLeft)}
      </Text>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${
                ((SESSION_DURATION - secondsLeft) /
                  SESSION_DURATION) *
                100
              }%`,
            },
          ]}
        />
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          style={styles.pauseButton}
          onPress={() => setRunning((prev) => !prev)}
        >
          <Text style={styles.buttonText}>
            {running ? "Pause" : "Resume"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.stopButton}
          onPress={stopSession}
        >
          <Text style={styles.buttonText}>Stop</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 48,
  },

  timer: {
    fontSize: 72,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    marginBottom: 48,
  },

  progressContainer: {
    width: "100%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 60,
  },

  progressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 16,
  },

  pauseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    minWidth: 140,
    alignItems: "center",
  },

  stopButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    minWidth: 140,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});