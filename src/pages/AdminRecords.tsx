import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import Datepicker from "react-tailwindcss-datepicker";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface GiftRecord {
  id: string;
  name: string;
  items: string[] | string;
  timestamp?: string;
  location_id: string;
}

interface Location {
  id: string;
  name: string;
}

export default function AdminRecords() {
  const [records, setRecords] = useState<GiftRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<GiftRecord[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: recordsData, error } = await supabase
        .from("gift_records")
        .select("*");

      const { data: locationData } = await supabase
        .from("locations")
        .select("*");

      if (error) {
        console.error("데이터 로드 오류:", error);
      } else if (recordsData) {
        const parsed = (recordsData as GiftRecord[]).map((r) => ({
          ...r,
          items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
        }));
        const sorted = parsed.sort(
          (a, b) =>
            new Date(b.timestamp || "").getTime() -
            new Date(a.timestamp || "").getTime()
        );
        setRecords(sorted);
      }

      if (locationData) setLocations(locationData as Location[]);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = records.filter((r) => {
      const matchesLocation =
        selectedLocations.length === 0 || selectedLocations.includes(r.location_id);
      const date = new Date(r.timestamp || "");
      const from = new Date(dateRange.startDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(dateRange.endDate);
      to.setHours(23, 59, 59, 999);
      return matchesLocation && date >= from && date <= to;
    });
    setFilteredRecords(filtered);
  }, [records, selectedLocations, dateRange]);

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      const { error } = await supabase.from("gift_records").delete().eq("id", id);
      if (!error) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("삭제 실패");
      }
    }
  };

  const handleLocationToggle = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((loc) => loc !== id) : [...prev, id]
    );
  };

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    setSelectedRecords(
      selectedRecords.size === filteredRecords.length
        ? new Set()
        : new Set(filteredRecords.map((r) => r.id))
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* 필터 섹션 */}
      <div className="flex flex-col gap-4">
        <div>
          <label className="block font-semibold mb-1">날짜 선택</label>
          <Datepicker
            value={dateRange}
            onChange={(newValue) => setDateRange(newValue)}
            showShortcuts={true}
            primaryColor="red"
            displayFormat="YYYY-MM-DD"
            separator=" ~ "
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">헌혈 장소</label>
          <div className="border rounded p-2 max-h-40 overflow-y-auto space-y-1">
            {locations.map((loc) => (
              <label key={loc.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(loc.id)}
                  onChange={() => handleLocationToggle(loc.id)}
                />
                {loc.name}
              </label>
            ))}
          </div>
          {selectedLocations.length > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              선택된 장소: {selectedLocations.map(id => locations.find(l => l.id === id)?.name).join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* 결과 개수 및 전체 선택 */}
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <input
          type="checkbox"
          checked={
            selectedRecords.size === filteredRecords.length && filteredRecords.length > 0
          }
          onChange={toggleSelectAll}
        />
        총 {filteredRecords.length}개 항목 (표시 중)
      </div>

      {/* 기록 리스트 */}
      {filteredRecords.length === 0 ? (
        <p className="text-gray-500 text-center">기록이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const locationName =
              locations.find((loc) => loc.id === record.location_id)?.name || "-";

            return (
              <div
                key={record.id}
                className="relative border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedRecords.has(record.id)}
                    onChange={() => toggleRecordSelection(record.id)}
                  />
                </div>

                <button
                  onClick={() => handleDelete(record.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>

                <div className="ml-6 mb-1 flex flex-wrap items-center gap-2">
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
                  <span className="text-xs text-gray-400">({locationName})</span>
                </div>

                <ul className="ml-6 list-disc list-inside text-sm text-gray-700 mt-1">
                  {Array.isArray(record.items) && record.items.length > 0 ? (
                    record.items.map((item, i) => <li key={i}>{item}</li>)
                  ) : (
                    <li className="text-gray-400 italic">선택된 기념품 없음</li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
