// Lab 3 - Step 9: the modal (outside (tabs), so it covers the tab bar)

import { useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function NewMessage() {
  const router = useRouter();
  const [text, setText] = useState("");

  return (
    <View style={styles.screen}>
      <TextInput
        style={styles.input}
        placeholder="To…"
        value={text}
        onChangeText={setText}
      />
      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonLabel}>Close</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12, backgroundColor: "#fff" },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#1a5276",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonLabel: { color: "#fff", fontWeight: "600" },
});
