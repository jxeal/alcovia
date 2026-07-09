import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import { Colors, Shadows } from "@/constants/Colors";

interface Props {
  onPress: () => void;
}

export default function StartSessionButton({
  onPress,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.button}
      onPress={onPress}
    >
      <Text style={styles.text}>
        Start Session
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    ...Shadows.button,
  },

  text: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});