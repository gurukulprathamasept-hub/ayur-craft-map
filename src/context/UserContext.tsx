import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type UserRole = "store_manager" | "pharmacist" | "qc_head" | "production_supervisor";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string;
}

const seedUsers: User[] = [
  { id: "U1", name: "Dr. Anand Kulkarni", role: "store_manager", pin: "1111" },
  { id: "U2", name: "Pharm. Kavita Rane", role: "pharmacist", pin: "2222" },
  { id: "U3", name: "Dr. Amit Joshi", role: "qc_head", pin: "3333" },
  { id: "U4", name: "Pharm. Ravi Kulkarni", role: "production_supervisor", pin: "4444" },
];

interface UserContextType {
  currentUser: User | null;
  users: User[];
  login: (pin: string) => boolean;
  logout: () => void;
  addUser: (u: User) => void;
  hasRole: (role: UserRole) => boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

export const roleLabel = (r: UserRole) =>
  ({
    store_manager: "Store Manager",
    pharmacist: "Pharmacist",
    qc_head: "QC Head",
    production_supervisor: "Production Supervisor",
  }[r]);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const s = localStorage.getItem("ayur_users");
      return s ? JSON.parse(s) : seedUsers;
    } catch {
      return seedUsers;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const s = localStorage.getItem("ayur_current_user");
      return s ? JSON.parse(s) : seedUsers[0];
    } catch {
      return seedUsers[0];
    }
  });

  useEffect(() => {
    localStorage.setItem("ayur_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) localStorage.setItem("ayur_current_user", JSON.stringify(currentUser));
    else localStorage.removeItem("ayur_current_user");
  }, [currentUser]);

  const login = (pin: string) => {
    const u = users.find((x) => x.pin === pin);
    if (u) {
      setCurrentUser(u);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  const addUser = (u: User) => setUsers((prev) => [...prev, u]);

  const hasRole = (role: UserRole) => currentUser?.role === role;

  return (
    <UserContext.Provider value={{ currentUser, users, login, logout, addUser, hasRole }}>
      {children}
    </UserContext.Provider>
  );
};
