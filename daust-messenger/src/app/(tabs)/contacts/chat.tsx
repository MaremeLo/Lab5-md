// Lab 3 - Step 8: the conversation screen from Lab 2, now a route

import { useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { Bubble } from "@/components/Bubble";

const START_MESSAGES = [
  { id: "1", text: "Hi!", mine: false },
  { id: "2", text: "Hello 👋", mine: true },
  { id: "3", text: "Are you coming to class today?", mine: false },
];

export default function Chat() {
  const router = useRouter();
  const [messages, setMessages] = useState(START_MESSAGES);
  const [text, setText] = useState("");

  function send() {
    if (text.trim() === "") {
      return;
    }
    const newMessage = { id: String(Date.now()), text: text, mine: true };
    setMessages([...messages, newMessage]);
    setText("");
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* this screen draws its own header, so the stack header is hidden */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Image source="https://i.pravatar.cc/100?u=c1" style={styles.headerAvatar} />
        {/* hard-coded name: the lab says this is a known limitation */}
        <Text style={styles.headerName}>Awa Diop</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <Bubble text={item.text} mine={item.mine} />}
        style={styles.messages}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No messages yet. Say hello.</Text>
        }
        ListHeaderComponent={<Text style={styles.dateLabel}>Today</Text>}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Message…"
          value={text}
          onChangeText={setText}
        />
        <Pressable style={styles.sendButton} onPress={send}>
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  back: { fontSize: 28, color: "#1a5276", paddingRight: 4 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerName: { fontSize: 16, fontWeight: "600" },
  messages: { flex: 1, paddingHorizontal: 12 },
  empty: { textAlign: "center", color: "#888", paddingVertical: 32 },
  dateLabel: { textAlign: "center", color: "#888", fontSize: 12, paddingBottom: 8 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a5276",
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontSize: 16 },
});
