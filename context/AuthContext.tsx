"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface UserSession {
  access_token: string | null;
  refresh_token: string | null;
  id: number | null;
  role: "ADMIN" | "MEMBER" | null;
  name: string | null;
  email: string | null;
  profileImage: string | null;
  authActiveItem: string | null;
}

interface AuthContextType extends UserSession {
  setSession: (session: Partial<UserSession>) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
const [session, setSessionState] = useState<UserSession>({
  access_token: null,
  refresh_token: null,
  id: null,
  name: null,
  email: null,
  profileImage: null,
  authActiveItem: null,
  role: null,
});

  const setSession = (update: Partial<UserSession>) => {
    setSessionState((prev) => ({ ...prev, ...update }));
  };

 const clearSession = () => {
  setSessionState({
    access_token: null,
    refresh_token: null,
    id: null,
    name: null,
    email: null,
    profileImage: null,
    authActiveItem: null, 
    role: null,
  });
};

  useEffect(() => {
    // fetch the cookie-based session from the server
    fetch("/api/auth/getSession")
      .then((res) => res.json())
      .then((data) => {
        setSessionState({
          access_token: data.access_token ?? null,
          refresh_token: data.refresh_token ?? null,
          id: data.user ?? null,
          name: data.name ?? null,
          email: data.email ?? null,
          profileImage: data.profileImage ?? null,
          authActiveItem: data.authActiveItem ?? null,
          role: data.role ?? "MEMBER", // default to MEMBER if not set
        });
      })
      .catch((err) => {
        console.error("Failed to load session", err);
      });
  }, []);

  useEffect(() => {
  console.log("Updated session: ", session);
}, [session]);

  return (
    <AuthContext.Provider value={{ ...session, setSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
