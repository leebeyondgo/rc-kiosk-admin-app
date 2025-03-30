
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function KioskLinks() {
  const [kiosks, setKiosks] = useState<any[]>([]);

  useEffect(() => {
    fetchKiosks();
  }, []);

  const fetchKiosks = async () => {
    const { data, error } = await supabase.from("kiosks").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setKiosks(data);
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">기념품 키오스크 목록</h2>
        <Button variant="secondary">새 키오스크 추가</Button>
      </div>
      <ul className="space-y-3 max-h-[70vh] overflow-auto">
        {kiosks.map((kiosk) => (
          <li key={kiosk.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2 border border-gray-200 shadow-sm">
            <span className="text-gray-700 font-medium">{kiosk.name}</span>
            <Button variant="outline" size="sm">링크 열기</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
