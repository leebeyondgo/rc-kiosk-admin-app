import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  PackageOpen,
  Gift,
  LogIn,
  LogOut,
  Menu,
  ChevronDown
} from "lucide-react";
import AdminRecords from "./AdminRecords";
import AdminItems from "./AdminItems";
import AdminLogin from "./AdminLogin";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function MainLayout() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "selector" | "records" | "items" | "login"
  >(() => localStorage.getItem("activeTab") as any || "selector");

  const [centers, setCenters] = useState<{ id: string; name: string }[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string>(() =>
    localStorage.getItem("selectedCenter") || ""
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCenterName = centers.find(c => c.id === selectedCenter)?.name || "";

  useEffect(() => {
    setIsAdmin(sessionStorage.getItem("isAdmin") === "true");
  }, []);

  useEffect(() => {
    const fetchCenters = async () => {
      const { data, error } = await supabase.from("donation_centers").select("id, name");
      if (!error && data) {
        setCenters(data);
      }
    };
    fetchCenters();
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedCenter", selectedCenter);
  }, [selectedCenter]);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    setIsAdmin(false);
    setActiveTab("selector");
  };

  const renderTitle = () => {
    switch (activeTab) {
      case "records":
        return "선택 기록";
      case "items":
        return "상품 관리";
      case "login":
        return "";
      default:
        return "기념품 선택";
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "records":
        return <AdminRecords />;
      case "items":
        return <AdminItems />;
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
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSidebarOpen(!sidebarOpen);
        }}
        className="fixed top-4 left-4 z-0 p-2 bg-white rounded-full shadow-md"
      >
        <Menu />
      </button>

      <div
        className={
          "fixed top-0 left-0 h-full bg-white shadow-lg z-40 transform transition-transform duration-300 " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full") +
          " w-64 p-4 flex flex-col justify-between"
        }
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
              <Gift className="mr-2 h-4 w-4" />기념품 선택
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant={activeTab === "records" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("records")}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />선택 기록
                </Button>
                <Button
                  variant={activeTab === "items" ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("items")}
                >
                  <PackageOpen className="mr-2 h-4 w-4" />상품 관리
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
              <LogOut className="mr-2 h-4 w-4" />로그아웃
            </Button>
          ) : (
            <Button
              variant={activeTab === "login" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setActiveTab("login")}
            >
              <LogIn className="mr-2 h-4 w-4" />로그인
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 w-full">
        <h1 className="text-2xl font-bold text-center mb-2">{renderTitle()}</h1>

        {activeTab === "selector" && (
          <div className="flex justify-center mb-6">
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                className="text-base px-2 py-1 bg-transparent flex items-center gap-1"
              >
                {selectedCenterName || "헌혈 장소 선택"}
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow z-50">
                  {centers.map((center) => (
                    <button
                      key={center.id}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCenter(center.id);
                        setDropdownOpen(false);
                      }}
                    >
                      {center.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}
