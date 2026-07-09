import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";

import { Colors, Shadows } from "@/constants/Colors";

interface Session {
  id: string;
  type: "deep_focus" | "quick_sprint" | "pomodoro";
  durationMs: number;
  coins: number;
  startedAt: number;
}

interface Props {
  session: Session;
  onPress: () => void;
}

const TYPE_MAP = {
  deep_focus: {
    label: "Deep Focus",
    icon: "🎯",
    bg: Colors.primaryLight,
  },
  quick_sprint: {
    label: "Quick Sprint",
    icon: "⚡",
    bg: Colors.successLight,
  },
  pomodoro: {
    label: "Pomodoro",
    icon: "🕛",
    bg: Colors.amberLight,
  },
};

function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const target = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );

    const diff =
        (today.getTime() - target.getTime()) /
        (1000 * 60 * 60 * 24);

    const time = date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });

    if (diff === 0)
        return `Today • ${time}`;

    if (diff === 1)
        return `Yesterday • ${time}`;

    return `${date.toLocaleDateString([], {
        weekday: "short",
    })} • ${time}`;
}

export default function SessionCard({
  session,
  onPress,
}: Props) {
  const type = TYPE_MAP[session.type];

  const duration = `${session.durationMs / 60000} min`;

  const date = new Date(session.startedAt);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  const meta = `${duration} • ${formatDate(session.startedAt)}`;

  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: type.bg,
          },
        ]}
      >
        <Text style={styles.icon}>
          {type.icon}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>
          {type.label}
        </Text>

        <Text style={styles.meta}>
          {meta}
        </Text>
      </View>

      <Text style={styles.coins}>
        +{session.coins}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    ...Shadows.card,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  icon: {
    fontSize: 18,
  },

  info: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.text,
    marginBottom: 2,
  },

  meta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.textTertiary,
  },

  coins: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.success,
  },
});