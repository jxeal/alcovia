import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Shadows } from "@/constants/Colors";
import { Achievement } from "@/types/api";

interface Props {
  achievement: Achievement;
}

export default function AchievementCard({ achievement }: Props) {
  const unlocked = achievement.unlockedAt !== null;

  const unlockedDate = unlocked
    ? new Date(achievement.unlockedAt!).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.iconContainer,
          unlocked ? styles.iconUnlocked : styles.iconLocked,
        ]}
      >
        <Ionicons
          name={achievement.icon as any}
          size={24}
          color={unlocked ? Colors.primary : Colors.textTertiary}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{achievement.name}</Text>

        <Text style={styles.description}>{achievement.description}</Text>

        {unlocked ? (
          <View style={styles.unlockedRow}>
            <Text style={styles.unlocked}>✓ Unlocked</Text>

            <Text style={styles.unlockedDate}>{unlockedDate}</Text>
          </View>
        ) : (
          <>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${achievement.progress}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.progressText}>
              {achievement.current} / {achievement.target}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Shadows.card,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  iconUnlocked: {
    backgroundColor: Colors.primaryLight,
  },

  iconLocked: {
    backgroundColor: "#ECECEC",
  },

  content: {
    flex: 1,
  },

  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },

  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },

  unlockedRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  unlocked: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.success,
  },

  unlockedDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 10,
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#ECECEC",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 6,
  },

  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },

  progressText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
