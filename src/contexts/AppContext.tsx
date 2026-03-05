import React, { createContext, useContext, ReactNode } from "react";
import { Member, Service, IncomeRecord } from "@/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { createSeedData } from "@/data/seed";

const seed = createSeedData();

interface AppContextType {
  members: Member[];
  setMembers: (val: Member[] | ((v: Member[]) => Member[])) => void;
  services: Service[];
  setServices: (val: Service[] | ((v: Service[]) => Service[])) => void;
  income: IncomeRecord[];
  setIncome: (val: IncomeRecord[] | ((v: IncomeRecord[]) => IncomeRecord[])) => void;
  isFirstVisit: boolean;
  setFirstVisit: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useLocalStorage<Member[]>("gracetrack_members", seed.members);
  const [services, setServices] = useLocalStorage<Service[]>("gracetrack_services", seed.services);
  const [income, setIncome] = useLocalStorage<IncomeRecord[]>("gracetrack_income", seed.income);
  const [isFirstVisit, setFirstVisit] = useLocalStorage<boolean>("gracetrack_first_visit", false);

  return (
    <AppContext.Provider value={{ members, setMembers, services, setServices, income, setIncome, isFirstVisit, setFirstVisit }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
}
