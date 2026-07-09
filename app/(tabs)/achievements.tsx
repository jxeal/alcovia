import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import ProgressCard from "@/src/components/achievements/ProgressCard";
import AchievementCard from "@/src/components/achievements/AchievementCard";
import { getAchievements } from "@/src/services/student";
import { Achievement } from "@/types/api";

// export default function AchievementsScreen() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.placeholder}>
//         <Text style={styles.title}>Achievements</Text>
//         <Text style={styles.subtitle}>
//           Build this screen from the design spec.
//         </Text>
//         <Text style={styles.hint}>
//           See the "Achievements" section in the design reference.{"\n"}
//           This screen is a WIREFRAME ONLY - the layout,{"\n"}
//           visual treatment, and interactions are entirely your call.
//         </Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.background,
//   },
//   placeholder: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 40,
//   },
//   title: {
//     fontFamily: "Inter_700Bold",
//     fontSize: 24,
//     color: Colors.text,
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontFamily: "Inter_500Medium",
//     fontSize: 16,
//     color: Colors.textSecondary,
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   hint: {
//     fontFamily: "Inter_400Regular",
//     fontSize: 14,
//     color: Colors.textTertiary,
//     textAlign: "center",
//     lineHeight: 22,
//   },
// });

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  async function loadAchievements() {
    try {
      const data = await getAchievements("stu_01");
      setAchievements(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: 60 }}
        />
      </SafeAreaView>
    );
  }

  const unlocked = achievements.filter((a) => a.unlockedAt !== null).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>Track your learning milestones</Text>

        <ProgressCard unlocked={unlocked} total={achievements.length} />

        {achievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.text,
    marginTop: 4,
  },

  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
});
