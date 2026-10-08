import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { ContactRow } from "@/components/ContactRow";
import { CONTACTS } from "@/data/contacts";
import { useFavourites } from "@/context/FavouritesContext";

export default function Contacts() {
  const { isFavourite } = useFavourites();
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      CONTACTS.filter((c) =>
        c.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [query]
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={(c) => c.id}
      renderItem={({ item }) => (
        <Link
          href={{ pathname: "/contacts/[id]", params: { id: item.id } }}
          asChild
        >
          <Pressable>
            <ContactRow contact={item} favourite={isFavourite(item.id)} />
          </Pressable>
        </Link>
      )}
      ListHeaderComponent={
        <View>
          <View style={styles.headerRow}>
            <Text style={styles.h1}>Contacts</Text>
            <View style={styles.headerRight}>
              <Text style={styles.count}>({filtered.length})</Text>
              <Link href="/new-message" asChild>
                <Pressable>
                  <Text style={styles.action}>New</Text>
                </Pressable>
              </Link>
            </View>
          </View>
          <TextInput
            style={styles.search}
            placeholder="Search…"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <Text style={styles.empty}>No contact matches "{query}".</Text>
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      style={{ backgroundColor: "#fff" }}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  h1: { fontSize: 22, fontWeight: "bold", color: "#1a5276" },
  count: { color: "#888" },
  action: { color: "#1a5276", fontWeight: "600" },
  search: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  separator: { height: 1, backgroundColor: "#e5e5e5" },
  empty: { textAlign: "center", color: "#888", paddingVertical: 32 },
});