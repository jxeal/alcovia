import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { SessionType } from "@/types/api";

type SessionPreset = {
  id: SessionType;
  title: string;
  subtitle: string;
  minutes: number;
  breakEvery?: number;
  emoji: string;
};

const PRESETS: SessionPreset[] = [
  {
    id: "quick_sprint",
    title: "Quick Sprint",
    subtitle: "15 min • No breaks",
    minutes: 15,
    emoji: "⚡",
  },
  {
    id: "deep_focus",
    title: "Deep Focus",
    subtitle: "60 min • Maximum concentration",
    minutes: 60,
    emoji: "🧠",
  },
  {
    id: "pomodoro",
    title: "Pomodoro",
    subtitle: "45 min • 5 min break every 25 min",
    minutes: 45,
    breakEvery: 25,
    emoji: "🍅",
  },
  {
    id: "pomodoro", // Note: type logic handles this as a pomodoro session
    title: "Pomodoro+",
    subtitle: "90 min • 5 min break every 25 min",
    minutes: 90,
    breakEvery: 25,
    emoji: "🚀",
  },
];

export default function FocusSetupScreen() {
  const [selected, setSelected] = useState(1);
  const session = useMemo(() => PRESETS[selected], [selected]);

  function startSession() {
    router.push({
      pathname: "/focus/timer",
      params: {
        type: session.id,
        title: session.title,
        duration: session.minutes * 60,
        breakEvery: (session.breakEvery ?? 0) * 60,
      },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Choose Session</Text>
        <Text style={styles.subheading}>Pick the type of focus session you'd like to start.</Text>

        {PRESETS.map((item, index) => {
          const active = index === selected;
          return (
            <Pressable key={index} onPress={() => setSelected(index)} style={[styles.card, active && styles.cardActive]}>
              <View style={styles.icon}><Text style={styles.iconText}>{item.emoji}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, active && styles.titleActive]}>{item.title}</Text>
                <Text style={[styles.subtitle, active && styles.subtitleActive]}>{item.subtitle}</Text>
              </View>
              <View style={[styles.radio, active && styles.radioActive]} />
            </Pressable>
          );
        })}

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Selected Session</Text>
          <Text style={styles.summaryTitle}>{session.title}</Text>
          <Text style={styles.summaryDesc}>
            {session.minutes} minutes
            {session.breakEvery ? ` • 5 min break every ${session.breakEvery} min` : " • No breaks"}
          </Text>
        </View>

        <Pressable style={styles.button} onPress={startSession}>
          <Text style={styles.buttonText}>Start Session</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 28, fontFamily: "Inter_700Bold", color: Colors.text, marginTop: 12 },
  subheading: { marginTop: 8, marginBottom: 28, fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.textSecondary, lineHeight: 22 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 2, borderColor: "transparent" },
  cardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", marginRight: 16 },
  iconText: { fontSize: 26 },
  title: { fontSize: 17, fontFamily: "Inter_700Bold", color: Colors.text },
  titleActive: { color: Colors.primary },
  subtitle: { marginTop: 4, fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  subtitleActive: { color: Colors.primary },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#D1D5DB" },
  radioActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  summary: { backgroundColor: "#FFF", borderRadius: 16, padding: 20, marginTop: 12, marginBottom: 30 },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: Colors.textSecondary, textTransform: "uppercase" },
  summaryTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.text, marginTop: 10 },
  summaryDesc: { marginTop: 8, fontSize: 14, lineHeight: 22, fontFamily: "Inter_400Regular", color: Colors.textSecondary },
  button: { backgroundColor: Colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: "center" },
  buttonText: { color: "#FFF", fontSize: 17, fontFamily: "Inter_700Bold" },
});