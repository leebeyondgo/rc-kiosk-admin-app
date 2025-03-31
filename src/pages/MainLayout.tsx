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
        return "";
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
    <div
      className="flex min-h-screen relative"
      onClick={() => sidebarOpen && setSidebarOpen(false)}
    >
      {/* 사이드 메뉴 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSidebarOpen(!sidebarOpen);
        }}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md"
      >
        <Menu />
      </button>

      {/* 사이드 메뉴 */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white shadow-lg z-100 transform 
          transition-transform duration-300 w-64 p-4 flex flex-col justify-between
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">메뉴</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-black"
            >
              &times;
            </button>
          </div>

          <div className="space-y-2">
            <Button
              variant={activeTab === "selector" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActiveTab("selector")}
            >
              <Gift className="mr-2 h-4 w-4" />
              기념품 키오스크
            </Button>

            {isAdmin && (
              <>
                <Button
                  variant={activeTab === "records" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("records")}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  선택 기록
                </Button>
                <Button
                  variant={activeTab === "bulkItems" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("bulkItems")}
                >
                  <Boxes className="mr-2 h-4 w-4" />
                  기념품 일괄 관리
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          {isAdmin ? (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          ) : (
            <Button
              variant={activeTab === "login" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActiveTab("login")}
            >
              <LogIn className="mr-2 h-4 w-4" />
              로그인
            </Button>
          )}
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="flex-1 overflow-auto p-4 w-full">
        <h1 className="text-2xl font-bold text-center mb-2">{renderTitle()}</h1>
        {renderContent()}
      </div>
    </div>
  );
}
