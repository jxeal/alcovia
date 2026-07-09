import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import { Colors } from "@/constants/Colors";

export type HistoryFilter = "today" | "week" | "month" | "all";

interface Props {
  selected: HistoryFilter;
  onSelect: (filter: HistoryFilter) => void;
}

const FILTERS: { label: string; value: HistoryFilter }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All", value: "all" },
];

export default function FilterPills({
  selected,
  onSelect,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTERS.map((filter) => {
        const active = selected === filter.value;

        return (
          <TouchableOpacity
            key={filter.value}
            activeOpacity={0.8}
            onPress={() => onSelect(filter.value)}
            style={[
              styles.pill,
              active && styles.activePill,
            ]}
          >
            <Text
              style={[
                styles.label,
                active && styles.activeLabel,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingBottom: 16,
  },

  pill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  activePill: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
  },

  activeLabel: {
    color: Colors.surface,
  },
});