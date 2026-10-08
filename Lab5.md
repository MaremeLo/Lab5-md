# Lab 5 — Favourites Across the Application

Lab 3 gave the application several screens. This lab makes them **share** one piece of information: which contacts are favourites.

A contact is starred on its detail screen; the star appears in the contacts list; a new **Favourites** tab lists them. No screen imports another, and no props travel between routes. One context holds the state, and every screen reads it through one hook.

```text
app/
├── _layout.tsx                    Stack
├── new-message.tsx                modal
└── (tabs)/
    ├── _layout.tsx                Tabs  ← FavouritesProvider wraps them here
    ├── index.tsx                  Home
    ├── favourites.tsx             NEW   reads the favourites
    └── contacts/
        ├── _layout.tsx            Stack
        ├── index.tsx              the list    reads the favourites
        ├── [id].tsx               one contact reads and changes them
        └── chat.tsx

context/
└── FavouritesContext.tsx          NEW   context + provider + useFavourites()
```

The starting point is the project as it stands at the end of Lab 3: tabs, the contacts stack with its detail route, and the modal.

Rules: type every step, run after each one, read any red screen before fixing it. Each step ends with a **Checkpoint**.

---

# Part A — The Context

---

## Step 1 — Describe What Consumers Need

Before any state exists, decide what the screens will be able to **do** with it. Create a folder **beside** `app/`, not inside it — a file in `app/` becomes a route (Lecture 4):

```text
context/
└── FavouritesContext.tsx
```

Start the file with the shape of the shared value:

```tsx
// context/FavouritesContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";

type FavouritesValue = {
  ids: string[];                         // the favourite contact ids
  toggle: (id: string) => void;          // add if absent, remove if present
  isFavourite: (id: string) => boolean;  // read one answer
};

const FavouritesContext = createContext<FavouritesValue | null>(null);
```

This type is the **public interface** of the shared state. The screens will depend on these three names — not on how the array is managed.

**Checkpoint 1** — the project runs exactly as before. A context now exists, but no state does: `createContext` only declares the channel.

---

## Step 2 — The Provider Holds the State

Add the provider to the same file:

```tsx
export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  function toggle(id: string) {
    setIds((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)   // remove
        : [...current, id]                  // add
    );
  }

  function isFavourite(id: string) {
    return ids.includes(id);
  }

  return (
    <FavouritesContext.Provider value={{ ids, toggle, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
}
```

Two points while typing:

* the state is **ordinary `useState`**. The context does not store anything; it only makes the provider's value reachable from below
* ` toggle`uses the function form of `setIds` and returns **new arrays** — `filter` and the spread — rather than modifying `current`

> React 19 also accepts `<FavouritesContext value={…}>` without `.Provider`. Both work; this lab uses the form found in most tutorials.

**Checkpoint 2** — the project still runs unchanged. Nothing renders the provider yet.

---

## Step 3 — The Custom Hook

Screens should not import the context object and check it for `null` every time. Add one hook, still in the same file:

```tsx
export function useFavourites() {
  const value = useContext(FavouritesContext);

  if (!value) {
    throw new Error("useFavourites must be used inside FavouritesProvider");
  }

  return value;
}
```

The file now exports exactly two things: `FavouritesProvider` and `useFavourites`. The context object itself stays private to the file.

**Checkpoint 3** — the project runs unchanged, and `context/FavouritesContext.tsx` has no TypeScript errors in VS Code.

---

## Step 4 — Place the Provider in the Narrowest Layout

List the screens that will read the favourites:

|Screen|File|
|---|---|
|Contacts list|`app/(tabs)/contacts/index.tsx`|
|Contact detail|`app/(tabs)/contacts/[id].tsx`|
|Favourites tab|`app/(tabs)/favourites.tsx`|

All three sit inside `(tabs)/`, and the Favourites tab is **outside** `contacts/`. The narrowest layout covering all of them is therefore `app/(tabs)/_layout.tsx`:

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { FavouritesProvider } from "@/context/FavouritesContext";

export default function TabsLayout() {
  return (
    <FavouritesProvider>
      <Tabs>
        <Tabs.Screen name="index"    options={{ title: "Home" }} />
        <Tabs.Screen name="contacts" options={{ title: "Contacts" }} />
      </Tabs>
    </FavouritesProvider>
  );
}
```

The layout now does two jobs: it declares the navigator **and** marks the boundary of what is shared inside it.

**Checkpoint 4** — the application looks exactly as before: the tabs, the list, and the detail all work. The provider is in place, but no screen reads it yet.

Commit:

```bash
git add . && git commit -m "FavouritesContext: provider and useFavourites hook"
```

---

# Part B — Three Screens, One Source of Truth

---

## Step 5 — The Detail Screen Changes the State

In `app/(tabs)/contacts/[id].tsx`, read the context and add a button. **Every hook goes at the top of the component, above the `if (!contact)` return** — a hook must run on every render, including the not-found one:

```tsx
import { useFavourites } from "@/context/FavouritesContext";

export default function ContactDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavourite, toggle } = useFavourites();
  const router = useRouter();
  const contact = CONTACTS.find((c) => c.id === id);

  if (!contact) {
    /* …the not-found branch from Lab 3… */
  }

  return (
    <View style={styles.screen}>
      {/* …header title, avatar, name, programme… */}

      <Pressable style={styles.favButton} onPress={() => toggle(contact.id)}>
        <Text style={styles.favLabel}>
          {isFavourite(contact.id) ? "★ Favourite" : "☆ Add to favourites"}
        </Text>
      </Pressable>

      {/* …the "Send a message" button from Lab 3… */}
    </View>
  );
}
```

```tsx
favButton: { borderWidth: 1, borderColor: "#f39c12", borderRadius: 24,
             paddingVertical: 10, paddingHorizontal: 20, marginTop: 16 },
favLabel:  { color: "#b9770e", fontWeight: "600" },
```

**Checkpoint 5** — tapping the button switches between ☆ and ★. Go back to the list, open the **same** contact again: it is still ★. The state survived because it lives in the provider, not in the screen, which was destroyed when you left it.

---

## Step 6 — The List Reads the State

The row component stays simple: it receives a `favourite` prop and knows nothing about contexts.

```tsx
// components/ContactRow.tsx
type Contact = { id: string; name: string; program: string };

export function ContactRow({ contact, favourite = false }:
                           { contact: Contact; favourite?: boolean }) {
  return (
    <View style={styles.row}>
      {/* …avatar and the name/programme text, as before… */}
      {favourite && <Text style={styles.star}>★</Text>}
    </View>
  );
}
```

```tsx
star: { fontSize: 18, color: "#f39c12" },
```

The **screen** reads the context and passes the answer down:

```tsx
// app/(tabs)/contacts/index.tsx
import { useFavourites } from "@/context/FavouritesContext";

export default function Contacts() {
  const { isFavourite } = useFavourites();
  /* …query and filtered, as before… */

  return (
    <FlatList
      /* …data, keyExtractor, header, separators, empty state, as before… */
      renderItem={({ item }) => (
        <Link href={{ pathname: "/contacts/[id]", params: { id: item.id } }} asChild>
          <Pressable>
            <ContactRow contact={item} favourite={isFavourite(item.id)} />
          </Pressable>
        </Link>
      )}
    />
  );
}
```

This is the division of work from the lecture: **context to reach the screen, props below it**. `ContactRow` can still be reused anywhere, with or without a provider.

**Checkpoint 6** — star a contact on its detail screen, press back: the star is already in the list. Unstar it: the star disappears. Neither screen imports the other.

---

## Step 7 — A Third Screen Joins

Create `app/(tabs)/favourites.tsx`:

```tsx
import { FlatList, Pressable, Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { ContactRow } from "@/components/ContactRow";
import { CONTACTS } from "@/data/contacts";
import { useFavourites } from "@/context/FavouritesContext";

export default function Favourites() {
  const { ids } = useFavourites();
  const favourites = CONTACTS.filter((c) => ids.includes(c.id));

  return (
    <FlatList
      data={favourites}
      keyExtractor={(c) => c.id}
      renderItem={({ item }) => (
        <Link href={{ pathname: "/contacts/[id]", params: { id: item.id } }} asChild>
          <Pressable>
            <ContactRow contact={item} favourite />
          </Pressable>
        </Link>
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListEmptyComponent={
        <Text style={styles.empty}>No favourites yet. Open a contact and tap ☆.</Text>
      }
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  separator: { height: 1, backgroundColor: "#e5e5e5" },
  empty:     { textAlign: "center", color: "#888", paddingVertical: 32 },
});
```

Register the tab:

```tsx
// app/(tabs)/_layout.tsx
<Tabs.Screen name="favourites" options={{ title: "Favourites" }} />
```

A row here opens a route that belongs to the **Contacts** tab. If the contacts stack has never been opened, the detail screen would arrive with no list underneath it, and no back button. One line in the contacts layout tells the stack to always start from its list:

```tsx
// app/(tabs)/contacts/_layout.tsx — above the component
export const unstable_settings = { initialRouteName: "index" };
```

**Checkpoint 7** — with no favourites, the tab shows the empty message. Star two contacts: both appear in the tab. Tap one: its detail opens in the Contacts tab, and back returns to the list. Unstar it there: it leaves the Favourites tab. The detail screen and the list were **not modified** in this step.

---

## Step 8 — Break It on Purpose

Move the provider from `app/(tabs)/_layout.tsx` into `app/(tabs)/contacts/_layout.tsx`, wrapping the contacts `<Stack>` instead of the `<Tabs>`.

Open the Favourites tab and read the red screen. It shows the sentence written in Step 3:

```text
useFavourites must be used inside FavouritesProvider
```

The Favourites tab is not below the provider any more. The custom hook turns that mistake into an immediate, readable error instead of a silent `null`.

Move the provider back to `app/(tabs)/_layout.tsx`.

**Checkpoint 8** — the error appeared when the provider was too low, and disappeared when it was restored. You can explain why `app/(tabs)/_layout.tsx` is the right place, and why `app/_layout.tsx` would also work but is wider than needed.

Commit:

```bash
git add . && git commit -m "Favourites shared by the list, the detail, and a Favourites tab"
```

---

# Part C — From `useState` to `useReducer`

---

## Step 9 — Name the Operations First

A **Clear all** button is coming. The favourites now change in three ways. Write them down in plain words before writing any code:

|Action|Meaning|Data it carries|
|---|---|---|
|`add`|Mark one contact as favourite|its `id`|
|`remove`|Unmark one contact|its `id`|
|`clear`|Remove every favourite|nothing|

In TypeScript, at the top of `context/FavouritesContext.tsx`:

```tsx
type Action =
  | { type: "add"; id: string }
  | { type: "remove"; id: string }
  | { type: "clear" };
```

An action describes **what happened**. It is not the next state.

**Checkpoint 9** — the file compiles. Nothing else has changed.

---

## Step 10 — Write the Reducer

Below the `Action` type, **outside** any component:

```tsx
function favouritesReducer(ids: string[], action: Action): string[] {
  switch (action.type) {
    case "add":
      return ids.includes(action.id) ? ids : [...ids, action.id];
    case "remove":
      return ids.filter((x) => x !== action.id);
    case "clear":
      return [];
  }
}
```

Check each case against two rules from the lecture:

*  **pure** — the result depends only on `ids` and `action`; no state is set and no request is sent inside it
*  **new values** — it never calls `push` or modifies `ids`; it returns a new array, or the same one when nothing changes

**Checkpoint 10** — the file compiles. In VS Code, delete the `case "clear":` lines for a moment: TypeScript reports that the function does not always return a value. Restore them. The `Action` type makes a forgotten case a compile error.

---

## Step 11 — Swap the State, Keep the Interface

In `FavouritesProvider`, replace `useState` with `useReducer`, and rewrite the operations as dispatches:

```tsx
import { createContext, useContext, useReducer, type ReactNode } from "react";

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [ids, dispatch] = useReducer(favouritesReducer, []);

  function toggle(id: string) {
    dispatch(ids.includes(id) ? { type: "remove", id } : { type: "add", id });
  }

  function clear() {
    dispatch({ type: "clear" });
  }

  function isFavourite(id: string) {
    return ids.includes(id);
  }

  return (
    <FavouritesContext.Provider value={{ ids, toggle, isFavourite, clear }}>
      {children}
    </FavouritesContext.Provider>
  );
}
```

Add `clear` to the interface:

```tsx
type FavouritesValue = {
  ids: string[];
  toggle: (id: string) => void;
  isFavourite: (id: string) => boolean;
  clear: () => void;
};
```

**Checkpoint 11** — run Checkpoints 5, 6 and 7 again: everything behaves exactly as before. **No screen was edited.** The screens depend on `useFavourites()` and its names, not on whether `useState` or a reducer sits behind them.

---

## Step 12 — Clear All

On the Favourites tab, read `clear` as well, and add a header to the list:

```tsx
const { ids, clear } = useFavourites();
```

```tsx
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
```

```tsx
headerRow: { flexDirection: "row", justifyContent: "space-between",
             alignItems: "center", paddingBottom: 8 },
count:     { color: "#888" },
action:    { color: "#1a5276", fontWeight: "600" },
```

Follow one tap through the code, aloud or on paper:

```text
tap "Clear all"  →  clear()  →  dispatch({ type: "clear" })  →  favouritesReducer  →  []
                 →  the provider re-renders  →  list, detail and tab all read the empty array
```

**Checkpoint 12** — star three contacts, tap **Clear all**: the tab shows its empty message, and the stars are gone from the list.

---

## Step 13 — Verify the Whole Application

A checklist, run on a physical device:

|Check|Expected|
|---|---|
|Star on the detail screen|Button switches to ★|
|Back to the list|★ beside that contact|
|Favourites tab|Lists exactly the starred contacts|
|Tap a favourite|Detail opens in the Contacts tab; back returns to the list|
|Unstar from the detail|Contact leaves the Favourites tab|
|Clear all|Tab empty, no stars in the list|
|No favourites|The empty message, no header|
|Screen imports|No screen imports another screen|

Then reload the application (press `r` in the terminal running Expo). Every favourite is gone.

That is **not** a bug. A context is memory, not storage: it lives as long as the running application. Keeping favourites between launches needs persistence, which comes later in the course.

**Checkpoint 13** — every line passes, and you can explain why the reload empties the list.

```bash
git add . && git commit -m "Favourites reducer with add, remove, and clear"
```

---

## Stretch — A Star in the Header

Move the favourite button into the detail screen's header, on the right, using the options the screen already sets:

```tsx
<Stack.Screen
  options={{
    title: contact.name,
    headerRight: () => (
      <Pressable onPress={() => toggle(contact.id)}>
        <Text style={{ fontSize: 22 }}>{isFavourite(contact.id) ? "★" : "☆"}</Text>
      </Pressable>
    ),
  }}
/>
```

Nothing else changes: the header is one more consumer of the same hook.

---

## What Was Used

|Step|Concept|From|
|---|---|---|
|1|The public interface of shared state; only screens belong in `app/`|Lecture 5, Part IV · Lecture 4, Part V|
|2|Context distributes; `useState` in the provider stores|Lecture 5, Parts III and IV|
|3|A custom hook around the context|Lecture 5, Part VI|
|4|The provider in the narrowest layout that covers every reader|Lecture 5, Part V|
|5–7|Several screens, one source of truth; context to the screen, props below|Lecture 5, Part VII|
|7|A route in another tab; `initialRouteName` for a nested stack|Lecture 4, Part IV|
|8|A consumer outside its provider|Lecture 5, Parts V and VI|
|9–10|Actions describe what happened; a reducer is a pure function|Lecture 5, Part IX|
|11–12|A reducer inside a provider, behind an unchanged interface|Lecture 5, Part X|
|13|Context is memory, not storage|Lecture 5, Part XI|

## Extension

Add a theme switcher using context api