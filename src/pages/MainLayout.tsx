
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  PackageOpen,
  Gift,
  LogIn,
  LogOut,
  Menu,
  Boxes
} from "lucide-react";
import AdminRecords from "./AdminRecords";
import AdminLogin from "./AdminLogin";
import BulkItemManager from "./BulkItemManager";
import KioskLinks from "./KioskLinks";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function MainLayout() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "selector" | "records" | "bulkItems" | "login"
  >(() => localStorage.getItem("activeTab") as any || "selector");

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem("isAdmin") === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    setIsAdmin(false);
    setActiveTab("selector");
  };

  const renderTitle = () => {
    switch (activeTab) {
      case "records":
        return "선택 기록";
      case "bulkItems":
        return "기념품 일괄 관리";
      case "login":
        return "관리자 로그인";
      default:
        return "기념품 키오스크";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "selector":
        return <KioskLinks />;
      case "records":
        return <AdminRecords />;
      case "bulkItems":
        return <BulkItemManager />;
      case "login":
        return (
          <AdminLogin
            onBack={() => setActiveTab("selector")}
            onLoginSuccess={() => {
              setIsAdmin(true);
              setActiveTab("selector");
            }}
          />
        );
      default:
        return <AdminRecords />;
    }
  };

  return (
    <div className="flex min-h-screen relative bg-gray-50" onClick={() => sidebarOpen && setSidebarOpen(false)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSidebarOpen(!sidebarOpen);
        }}
        className="fixed top-4 left-4 z-10 p-3 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <Menu className="text-gray-700"/>
      </button>

      <div
        className={`fixed top-0 left-0 z-20 h-full w-64 bg-white shadow-xl border-r transition-transform duration-300 ease-in-out transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col p-4 space-y-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">메뉴</h2>
          <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("selector")}><Gift className="mr-2" />기념품 키오스크</Button>
          {isAdmin && (
            <>
              <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("records")}><ClipboardList className="mr-2" />선택 기록</Button>
              <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("bulkItems")}><Boxes className="mr-2" />일괄 관리</Button>
              <Button variant="danger" className="justify-start" onClick={handleLogout}><LogOut className="mr-2" />로그아웃</Button>
            </>
          )}
          {!isAdmin && (
            <Button variant="outline" className="justify-start" onClick={() => setActiveTab("login")}><LogIn className="mr-2" />관리자 로그인</Button>
          )}
        </div>
      </div>

      <div className="flex-grow flex flex-col p-6 ml-0 md:ml-64 transition-all duration-300">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{renderTitle()}</h1>
        {renderContent()}
      </div>
    </div>
  );
}
