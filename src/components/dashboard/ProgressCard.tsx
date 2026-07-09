import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { Shadows, Colors } from "@/constants/Colors";

interface Props {
  completed: number;
  goal: number;
}

const SIZE = 72;
const STROKE = 7;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressCard({ completed, goal }: Props) {
  const progress = Math.min(completed / goal, 1);

  const offset = CIRCUMFERENCE * (1 - progress);

  const title =
  completed > goal
    ? "Unstoppable! 🔥" 
    : completed === goal
    ? "Daily goal complete!"
    : completed === 0
    ? "Let's get started!"
    : "Almost there!";

const subtitle =
  completed > goal
    ? `You're in the zone! ${completed - goal} extra session${
        completed - goal === 1 ? "" : "s"
      } above your goal.`
    : completed === goal
    ? "Amazing work today! You've reached your peak."
    : `${goal - completed} more session${
        goal - completed === 1 ? "" : "s"
      } to keep your streak alive`;

  return (
    <>
      <Text style={styles.heading}>Today's Progress</Text>

      <View style={styles.card}>
        <View style={styles.ringContainer}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={Colors.border}
              strokeWidth={STROKE}
              fill="none"
            />

            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={Colors.primary}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              rotation="-90"
              origin={`${SIZE / 2}, ${SIZE / 2}`}
            />
          </Svg>

          <View style={styles.center}>
            <Text style={styles.progress}>
              {completed}/{goal}
            </Text>

            <Text style={styles.small}>sessions</Text>
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>

          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 14,
    marginTop: 24,
  },

  ringContainer: {
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    ...Shadows.card,
  },

  center: {
    position: "absolute",
    alignItems: "center",
  },

  progress: {
    fontSize: 22,
    fontFamily: "Inter_800ExtraBold",
    color: Colors.text,
  },

  small: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },
});
