import { Tabs } from "expo-router";
import { FavouritesProvider } from "@/context/FavouritesContext";

export default function TabsLayout() {
  return (
    <FavouritesProvider>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen
          name="contacts"
          options={{ title: "Contacts", headerShown: false }}
        />
        <Tabs.Screen name="favourites" options={{ title: "Favourites" }} />
      </Tabs>
    </FavouritesProvider>
  );
}