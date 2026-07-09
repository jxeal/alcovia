import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";
import React, { useEffect, useState } from "react";
import { API_URL } from "@/src/api/client";
import { Pressable } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type TimelineItem = {
  type: string;
  durationMs: number;
  startedAt: string;
};

type SessionDetail = {
  id: string;
  studentId: string;
  type: string;
  durationMs: number;
  coins: number;
  status: string;
  startedAt: string;
  completedAt: string;
  timeline: TimelineItem[];
};

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    try {
      const res = await fetch(`${API_URL}/students/stu_01/sessions/${id}`);

      if (!res.ok) throw new Error("Failed to fetch session");

      const data = await res.json();
      setSession(data);
    } catch (e) {
      setError("Unable to load session.");
    } finally {
      setLoading(false);
    }
  }

  const formatType = (type: string) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    // Returns "5 min 30 sec" or "0 min 45 sec"
    return `${mins} min ${secs} sec`;
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString([], {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit", // Added seconds here
    });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* <Text style={styles.title}>{formatType(session.type)}</Text> */}
      {/* <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <Text style={styles.title}>{formatType(session.type)}</Text>
      </View> */}

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>{formatType(session.type)}</Text>

        {/* balances the back button */}
        <View style={{ width: 40 }} />
      </View>

      {/* <View style={styles.coinsCard}>
        <Text style={styles.coins}>+{session.coins} Coins</Text>
        <Text style={styles.status}>{session.status.toUpperCase()}</Text>
      </View> */}

      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroEmoji}>
            {session.type === "deep_focus"
              ? "🎯"
              : session.type === "quick_sprint"
              ? "⚡"
              : "🕛"}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.heroCoins}>+{session.coins} Coins</Text>

          <Text style={styles.heroStatus}>{session.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Row label="Duration" value={formatDuration(session.durationMs)} />
        <Row label="Started" value={formatDate(session.startedAt)} />
        <Row label="Completed" value={formatDate(session.completedAt)} />
        {/* Probably shouldn't show the session Id, so commented it out */}
        {/* <Row label="Session ID" value={session.id} /> */}
      </View>

      <Text style={styles.sectionTitle}>Timeline</Text>

      {session.timeline.map((item, index) => (
        <View key={index} style={styles.card}>
          <Row label="Activity" value={formatType(item.type)} />
          <Row label="Duration" value={formatDuration(item.durationMs)} />
          <Row label="Started" value={formatDate(item.startedAt)} />
        </View>
      ))}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 20,
  },

  coinsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },

  coins: {
    color: "#00B894",
    fontSize: 24,
    fontWeight: "700",
  },

  status: {
    marginTop: 6,
    color: Colors.textSecondary,
    fontSize: 14,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },

  label: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  value: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 22,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },

  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  heroEmoji: {
    fontSize: 28,
  },

  heroCoins: {
    fontSize: 28,
    fontWeight: "700",
    color: "#00B894",
  },

  heroStatus: {
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 1,
    color: Colors.textSecondary,
  },
});
