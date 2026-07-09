import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Shadows } from "@/constants/Colors";

interface Props {
  unlocked: number;
  total: number;
}

export default function ProgressCard({
  unlocked,
  total,
}: Props) {
  const percentage = total === 0 ? 0 : (unlocked / total) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="trophy"
            size={26}
            color={Colors.primary}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.subtitle}>
            {unlocked} of {total} unlocked
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.footer}>
        {percentage === 100
          ? "Amazing! Every achievement unlocked"
          : `${total - unlocked} achievements left to unlock`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    ...Shadows.card,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.text,
    marginBottom: 2,
  },

  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
  },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#ECECEC",
    overflow: "hidden",
    marginBottom: 10,
  },

  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },

  footer: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
});