import React from "react";
import { useEffect, useState } from "react";
import { StyleSheet, View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { getStudent, getStats } from "@/src/services/student";
import { Student, WeeklyStats } from "@/types/api";
import Greeting from "@/src/components/dashboard/Greeting";
import StatCard from "@/src/components/dashboard/StatCard";
import WeeklyChart from "@/src/components/dashboard/WeeklyChart";
import TodayProgress from "@/src/components/dashboard/ProgressCard";
import StartSessionButton from "@/src/components/dashboard/StartSessionButton";
import { router } from "expo-router";

export default function DashboardScreen() {
  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const [studentData, statsData] = await Promise.all([
        getStudent("stu_01"),
        getStats("stu_01"),
      ]);

      setStudent(studentData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  }

  async function onRefresh() {
    setRefreshing(true);

    await load();

    setRefreshing(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (!student || !stats) {
    return <SafeAreaView style={styles.container} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Greeting name={student.name} initials={student.initials} />

        <View style={styles.statsRow}>
          <StatCard
            icon="🎯"
            value={stats.totalSessions}
            label="Sessions"
            backgroundColor={Colors.primaryLight}
          />
          <StatCard
            icon="🪙"
            value={student.totalCoins}
            label="Coins"
            backgroundColor={Colors.successLight}
          />
          <StatCard
            icon="🔥"
            value={student.currentStreak}
            label="Day Streak"
            backgroundColor={Colors.amberLight}
          />
        </View>

        <WeeklyChart data={stats.sessionsPerDay} />

        <TodayProgress
          completed={stats.todayCompleted}
          goal={stats.dailyGoal}
        />

        <StartSessionButton
          onPress={() => {
            router.push("/focus");
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
});
