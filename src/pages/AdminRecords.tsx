
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function AdminRecords() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase.from("records").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setRecords(data);
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">선택 기록 목록</h2>
      <div className="overflow-auto max-h-[70vh]">
        <table className="min-w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">기념품 이름</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">사용자</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">선택 날짜</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="py-3 px-4 text-sm text-gray-700">{record.item_name}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{record.user_name}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{new Date(record.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
