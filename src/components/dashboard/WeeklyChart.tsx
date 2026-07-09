import { View, Text, StyleSheet } from "react-native";
import React from "react";

import { Colors } from "@/constants/Colors";

type DayStat = {
  day: string;
  count: number;
};

type WeeklyChartProps = {
  data: DayStat[];
};

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  const today = DAYS[new Date().getDay()];

  const orderedDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  const orderedData = orderedDays.map((day) => {
    return data.find((d) => d.day === day)!;
  });

  return (
    <View>
      <Text style={styles.title}>This Week</Text>

      <View style={styles.chart}>
        {orderedData.map((item) => {
          const MIN_BAR = 24;
          const MAX_BAR = 64;

          const ratio = item.count / max;

          const height =
            item.count === 0 ? 0 : MIN_BAR + ratio * (MAX_BAR - MIN_BAR);

          const isToday = item.day === today;

          return (
            <View key={item.day} style={styles.column}>
              <View
                style={[
                  styles.bar,
                  {
                    height,
                    backgroundColor: isToday
                      ? Colors.primary
                      : Colors.primaryLight,
                  },
                ]}
              />

              <Text style={[styles.day, isToday && styles.today]}>
                {item.day[0].toUpperCase()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginBottom: 14,
  },

  chart: {
    height: 140,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 24,
  },

  column: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },

  bar: {
    width: "100%",
    maxWidth: 36,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },

  day: {
    marginTop: 6,
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: Colors.textTertiary,
  },

  today: {
    color: Colors.primary,
  },
});
