import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { CONTACTS } from "@/data/contacts";
import { useFavourites } from "@/context/FavouritesContext";

export default function ContactDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavourite, toggle } = useFavourites();
  const router = useRouter();
  const contact = CONTACTS.find((c) => c.id === id);

  if (!contact) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>Contact not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: contact.name }} />

      <Image
        source={`https://i.pravatar.cc/200?u=${contact.id}`}
        style={styles.avatar}
      />
      <Text style={styles.name}>{contact.name}</Text>
      <Text style={styles.program}>{contact.program}</Text>

      <Pressable style={styles.favButton} onPress={() => toggle(contact.id)}>
        <Text style={styles.favLabel}>
          {isFavourite(contact.id) ? "★ Favourite" : "☆ Add to favourites"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.navigate("/contacts/chat")}
      >
        <Text style={styles.buttonLabel}>Send a message</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    paddingTop: 32,
    gap: 8,
    backgroundColor: "#fff",
  },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  name: { fontSize: 22, fontWeight: "bold" },
  program: { fontSize: 15, color: "#666" },
  missing: { color: "#888", paddingTop: 32 },
  favButton: {
    borderWidth: 1,
    borderColor: "#f39c12",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  favLabel: { color: "#b9770e", fontWeight: "600" },
  button: {
    backgroundColor: "#1a5276",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 16,
  },
  buttonLabel: { color: "#fff", fontWeight: "600" },
});