
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function BulkItemManager() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setItems(data);
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">기념품 일괄 관리</h2>
        <Button variant="secondary">새 기념품 추가</Button>
      </div>
      <div className="overflow-auto max-h-[70vh]">
        <table className="min-w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">기념품 이름</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">상태</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-3 px-4 text-sm text-gray-700">{item.name}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{item.status}</td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  <Button variant="outline" size="sm">편집</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
