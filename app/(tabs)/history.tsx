import React, { useState, useEffect } from "react";
import { FlatList, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import FilterPills, {
  HistoryFilter,
} from "@/src/components/history/FilterPills";
import SessionCard from "@/src/components/history/SessionCard";
import { getSessions } from "@/src/services/student";
import { Session } from "@/types/api";
import { router } from "expo-router";

export default function HistoryScreen() {
  const [selected, setSelected] = useState<HistoryFilter>("week");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [selected]);

  async function loadSessions() {
    try {
      setLoading(true);
      setError("");

      const response = await getSessions(
        "stu_01",
        selected === "all" ? undefined : selected
      );

      setCursor(null);
      setHasMore(true);

      setSessions(response.data);
      setCursor(response.cursor);
      setHasMore(response.hasMore);
    } catch (err) {
      console.error(err);
      setError("Couldn't load sessions.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!hasMore) return;

    if (loadingMore) return;

    if (!cursor) return;

    try {
      setLoadingMore(true);

      const response = await getSessions(
        "stu_01",
        selected === "all" ? "all" : selected,
        cursor
      );

      setSessions((prev) => [...prev, ...response.data]);

      setCursor(response.cursor);

      setHasMore(response.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text
          style={{
            marginTop: 40,
            textAlign: "center",
          }}
        >
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>History</Text>

        <FilterPills selected={selected} onSelect={setSelected} />

        <Text style={styles.footer}>{error}</Text>
      </SafeAreaView>
    );
  }



  // if (sessions.length === 0) {
  //   return (
  //     <SafeAreaView style={styles.container}>
  //       <Text style={styles.title}>History</Text>

  //       <FilterPills selected={selected} onSelect={setSelected} />

  //       <Text style={styles.footer}>No sessions yet.</Text>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      {/* <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>History</Text>

        <FilterPills selected={selected} onSelect={setSelected} />

        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} onPress={() => {}} />
        ))}

        <Text style={styles.footer}>Scroll for more</Text>
      </ScrollView> */}

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onPress={() =>
              router.push({
                pathname: "/session/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>History</Text>

            <FilterPills selected={selected} onSelect={setSelected} />
          </>
        }
        ListFooterComponent={
          loadingMore ? (
            <Text style={styles.footer}>Loading...</Text>
          ) : hasMore ? (
            <Text style={styles.footer}>Scroll for more</Text>
          ) : (
            <Text style={styles.footer}>You're all caught up!</Text>
          )
        }
        contentContainerStyle={styles.content}
        refreshing={loading}
        onRefresh={loadSessions}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginTop: 4,
    marginBottom: 16,
  },

  footer: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },
});
