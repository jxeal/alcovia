import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";

type StatCardProps = {
  icon: string;
  value: number | string;
  label: string;
  backgroundColor: string;
};

export default function StatCard({
  icon,
  value,
  label,
  backgroundColor,
}: StatCardProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
        },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>

      <Text style={styles.value}>{value}</Text>

      <Text style={styles.label}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
  },

  icon: {
    fontSize: 18,
    marginBottom: 8,
  },

  value: {
    fontFamily: "Inter_800ExtraBold",
    fontSize: 26,
    color: Colors.text,
    fontVariant: ["tabular-nums"],
    lineHeight: 30,
  },

  label: {
    marginTop: 4,
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
});