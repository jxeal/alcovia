import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";

type GreetingProps = {
  name: string;
  initials: string;
};

export default function Greeting({ name, initials }: GreetingProps) {
  const firstName = name.split(" ")[0];

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View>
        <Text style={styles.greeting}>Hey, {firstName}</Text>

        <Text style={styles.subtitle}>Let's crush this week</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    paddingTop: 4,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  
  greeting: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
  },

  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
  },

  avatarText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
});
