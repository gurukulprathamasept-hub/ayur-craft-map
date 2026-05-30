import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gst: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  sourceType: "Trader" | "Manufacturer" | "Forest Collector" | "Cultivator" | "Importer";
  drugLicenseNo: string;
  active: boolean;
};

const initialSuppliers: Supplier[] = [
  {
    id: "SUP-001", name: "Himalaya Herbs Traders", contactPerson: "Rajesh Sharma",
    phone: "9876543210", email: "rajesh@himalayanherbs.in", gst: "05AABCH1234A1Z5",
    address: "Plot 42, Herb Market, Saharanpur Road", city: "Dehradun", state: "Uttarakhand", pincode: "248001",
    sourceType: "Trader", drugLicenseNo: "UK/2019/DL-4421", active: true,
  },
  {
    id: "SUP-002", name: "Kerala Ayurveda Farms", contactPerson: "Dr. Suresh Nair",
    phone: "9845612378", email: "suresh@keralaayurfarms.com", gst: "32AABCK5678B2Z3",
    address: "Wayanad Organic Farm Cluster", city: "Kalpetta", state: "Kerala", pincode: "673121",
    sourceType: "Cultivator", drugLicenseNo: "KL/2020/DL-0891", active: true,
  },
  {
    id: "SUP-003", name: "Madhya Bharat Van Aushadhi", contactPerson: "Gopal Patel",
    phone: "9425678901", email: "gopal@mbvanaushadhi.in", gst: "23AABCM9012C3Z1",
    address: "Near Forest Office, Hoshangabad Road", city: "Bhopal", state: "Madhya Pradesh", pincode: "462001",
    sourceType: "Forest Collector", drugLicenseNo: "MP/2021/DL-2233", active: true,
  },
  {
    id: "SUP-004", name: "Gujarat Minerals & Metals", contactPerson: "Hitesh Desai",
    phone: "9898765432", email: "hitesh@gujminerals.com", gst: "24AABCG3456D4Z9",
    address: "GIDC Industrial Estate, Phase-II", city: "Ankleshwar", state: "Gujarat", pincode: "393002",
    sourceType: "Manufacturer", drugLicenseNo: "GJ/2018/DL-7890", active: true,
  },
  {
    id: "SUP-005", name: "Sanjivani Imports Pvt. Ltd.", contactPerson: "Priya Mehra",
    phone: "9811234567", email: "priya@sanjivaniimports.com", gst: "07AABCS7890E5Z7",
    address: "Nehru Place, Tower-B, 4th Floor", city: "New Delhi", state: "Delhi", pincode: "110019",
    sourceType: "Importer", drugLicenseNo: "DL/2022/DL-1155", active: false,
  },
];

type SupplierContextType = {
  suppliers: Supplier[];
  addSupplier: (s: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, data: Partial<Omit<Supplier, "id">>) => void;
  deleteSupplier: (id: string) => void;
};

const SupplierContext = createContext<SupplierContextType | null>(null);

export const useSupplier = () => {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error("useSupplier must be inside SupplierProvider");
  return ctx;
};

export const SupplierProvider = ({ children }: { children: ReactNode }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);

  const addSupplier = (s: Omit<Supplier, "id">) => {
    setSuppliers(prev => {
      const maxNum = prev.reduce((max, sup) => {
        const n = parseInt(sup.id.replace("SUP-", ""));
        return n > max ? n : max;
      }, 0);
      return [...prev, { ...s, id: `SUP-${String(maxNum + 1).padStart(3, "0")}` }];
    });
  };

  const updateSupplier = (id: string, data: Partial<Omit<Supplier, "id">>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  return (
    <SupplierContext.Provider value={{ suppliers, addSupplier, updateSupplier, deleteSupplier }}>
      {children}
    </SupplierContext.Provider>
  );
};
