"use client";

import React, { createContext, useContext, useState } from "react";
import { Unit } from "@/types/property";

interface ContactContextValue {
  selectedUnit: Unit | null;
  openUnitDrawer: (unit: Unit) => void;
  closeUnitDrawer: () => void;

  contactOpen: boolean;
  openContactSheet: () => void;
  closeContactSheet: () => void;

  leadOpen: boolean;
  leadPrefill: string;
  openLeadModal: (prefillNote?: string) => void;
  closeLeadModal: () => void;

  sellOpen: boolean;
  sellCategory: "chung-cu" | "thap-tang";
  openSellModal: (category?: "chung-cu" | "thap-tang") => void;
  closeSellModal: () => void;
}

const ContactContext = createContext<ContactContextValue | null>(null);

export function ContactProvider({ children }: { children: React.ReactNode }) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadPrefill, setLeadPrefill] = useState("");
  const [sellOpen, setSellOpen] = useState(false);
  const [sellCategory, setSellCategory] = useState<"chung-cu" | "thap-tang">(
    "thap-tang"
  );

  return (
    <ContactContext.Provider
      value={{
        selectedUnit,
        openUnitDrawer: (unit) => setSelectedUnit(unit),
        closeUnitDrawer: () => setSelectedUnit(null),

        contactOpen,
        openContactSheet: () => setContactOpen(true),
        closeContactSheet: () => setContactOpen(false),

        leadOpen,
        leadPrefill,
        openLeadModal: (prefill = "") => {
          setLeadPrefill(prefill);
          setLeadOpen(true);
        },
        closeLeadModal: () => setLeadOpen(false),

        sellOpen,
        sellCategory,
        openSellModal: (cat = "thap-tang") => {
          setSellCategory(cat);
          setSellOpen(true);
        },
        closeSellModal: () => setSellOpen(false),
      }}
    >
      {children}
    </ContactContext.Provider>
  );
}

export function useContact() {
  const ctx = useContext(ContactContext);
  if (!ctx) {
    throw new Error("useContact must be used within ContactProvider");
  }
  return ctx;
}
