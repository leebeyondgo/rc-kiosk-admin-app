import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface GiftRecord {
  id: string;
  name: string;
  items: string[];
  timestamp?: string;
}

export default function AdminRecords() {
  const [records, setRecords] = useState<GiftRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("gift_records").select("*");
      if (error) {
        console.error("데이터 로드 오류:", error);
      } else if (data) {
        const sorted = (data as GiftRecord[]).sort(
          (a, b) =>
            new Date(b.timestamp || "").getTime() -
            new Date(a.timestamp || "").getTime()
        );
        setRecords(sorted);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      const { error } = await supabase
        .from("gift_records")
        .delete()
        .eq("id", id);

      if (!error) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("삭제 실패");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* 헤더 */}

      {/* 본문 */}
      {records.length === 0 ? (
        <p className="text-gray-500 text-center">선택된 기록이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div
              key={record.id}
              className="relative border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <button
                onClick={() => handleDelete(record.id)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>

              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-800">{record.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(record.timestamp || "").toLocaleString("ko-KR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                {record.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
