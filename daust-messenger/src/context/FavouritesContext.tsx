import { createContext, useContext, useReducer, type ReactNode } from "react";

type Action =
  | { type: "add"; id: string }
  | { type: "remove"; id: string }
  | { type: "clear" };

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

type FavouritesValue = {
  ids: string[];
  toggle: (id: string) => void;
  isFavourite: (id: string) => boolean;
  clear: () => void;
};

const FavouritesContext = createContext<FavouritesValue | null>(null);

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

export function useFavourites() {
  const value = useContext(FavouritesContext);

  if (!value) {
    throw new Error("useFavourites must be used inside FavouritesProvider");
  }

  return value;
}