import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import { getMeApi } from "../api/auth.api";   // auth api

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    getMeApi()

      .then((res) => {

        const userData =
          res.data.user;

        setUser(userData);

        localStorage.setItem(
          "user",
          JSON.stringify(userData)
        );
      })

      .catch(() => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
      })

      .finally(() => {
        setLoading(false);
      });

  }, []);

  const login = (
    token,
    userData
  ) => {

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);

    window.location.href =
      "/login";
  };

  return (

    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout
      }}
    >

      {children}

    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);