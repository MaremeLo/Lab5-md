import { FlatList, Pressable, Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { ContactRow } from "@/components/ContactRow";
import { CONTACTS } from "@/data/contacts";
import { useFavourites } from "@/context/FavouritesContext";

export default function Favourites() {
  const { ids, clear } = useFavourites();
  const favourites = CONTACTS.filter((c) => ids.includes(c.id));

  return (
    <FlatList
      data={favourites}
      keyExtractor={(c) => c.id}
      renderItem={({ item }) => (
        <Link
          href={{ pathname: "/contacts/[id]", params: { id: item.id } }}
          asChild
        >
          <Pressable>
            <ContactRow contact={item} favourite />
          </Pressable>
        </Link>
      )}
      ListHeaderComponent={
        favourites.length > 0 ? (
          <View style={styles.headerRow}>
            <Text style={styles.count}>{favourites.length} favourite(s)</Text>
            <Pressable onPress={clear}>
              <Text style={styles.action}>Clear all</Text>
            </Pressable>
          </View>
        ) : null
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <Text style={styles.empty}>No favourites yet. Open a contact and tap ☆.</Text>
      }
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
  count: { color: "#888" },
  action: { color: "#1a5276", fontWeight: "600" },
  separator: { height: 1, backgroundColor: "#e5e5e5" },
  empty: { textAlign: "center", color: "#888", paddingVertical: 32 },
});