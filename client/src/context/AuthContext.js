import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../api/api";

const AuthContext = createContext(null);

export const AuthProvider=({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const loadUser=async()=> {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login =async(identifier, password)=> {
    const response = await api.post("/auth/login", {
      identifier,
      password,
    });

    setUser(response.data.user);
    return response.data.user;
  }

  const logout=async()=> {
    await api.post("/auth/logout");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth=() =>{
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}