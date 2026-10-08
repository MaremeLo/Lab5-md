

import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Step 4 - the tabs draw their own header, so the root stack hides its one */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* Step 9 - same kind of route, but presented as a modal */}
      <Stack.Screen
        name="new-message"
        options={{ presentation: "modal", title: "New message" }}
      />
    </Stack>
  );
}
