import { createContext, useContext, useState, type ReactNode } from "react";

type User = {
  username: string;
  role: string;
};

type AuthContextValue = {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  function login(username: string, password: string) {
    if (username.trim() === "" || password.trim() === "") {
      return false;
    }
    const loggedIn = { username };
    setUser(loggedIn);
    localStorage.setItem("user", JSON.stringify(loggedIn));
    localStorage.setItem("role", JSON.stringify("quartermaster"));
    return true;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
