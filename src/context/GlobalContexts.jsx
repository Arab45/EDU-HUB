import redux from "redux";

export const GlobalContext = redux.createContext();

export const GlobalProvider = ({ children }) => {
  const [user, setUser] = redux.useState(null);
  const [isAuthenticated, setIsAuthenticated] = redux.useState(false);

  return (
    <GlobalContext.Provider value={{ user, setUser, isAuthenticated, setIsAuthenticated }}>
      {children}
    </GlobalContext.Provider>
  );
};