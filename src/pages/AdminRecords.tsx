import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import Datepicker, { DateValueType } from "react-tailwindcss-datepicker";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface GiftRecord {
  id: string;
  name: string;
  items: string[];
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
  const [dateRange, setDateRange] = useState<DateValueType>({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: recordsData } = await supabase.from("gift_records").select("*");
      const { data: locationData } = await supabase.from("donation_locations").select("*");

      if (recordsData) {
        const sorted = (recordsData as GiftRecord[]).sort(
          (a, b) => new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime()
        );
        setRecords(sorted);
      } else {
        setRecords([]);
      }

      setLocations(locationData ?? []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = records.filter((r) => {
      const matchesLocation =
        selectedLocations.length === 0 || selectedLocations.includes(r.location_id);
      const date = new Date(r.timestamp || "");
      const from = new Date(dateRange?.startDate || "");
      const to = new Date(dateRange?.endDate || "");
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

  const handleBulkDelete = async () => {
    if (selectedRecords.size === 0 || !confirm("선택된 항목들을 삭제하시겠습니까?")) return;

    const { error } = await supabase
      .from("gift_records")
      .delete()
      .in("id", Array.from(selectedRecords));

    if (!error) {
      setRecords((prev) => prev.filter((r) => !selectedRecords.has(r.id)));
      setSelectedRecords(new Set());
    } else {
      alert("일괄 삭제 실패");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block font-semibold mb-1">날짜 선택</label>
          <Datepicker
            value={dateRange}
            onChange={(newValue: DateValueType) => setDateRange(newValue)}
            showShortcuts
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
                  onChange={() =>
                    setSelectedLocations((prev) =>
                      prev.includes(loc.id)
                        ? prev.filter((id) => id !== loc.id)
                        : [...prev, loc.id]
                    )
                  }
                />
                {loc.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Button onClick={() => {
            setSelectedLocations([]);
            const today = new Date().toISOString().split("T")[0];
            setDateRange({ startDate: today, endDate: today });
          }} variant="outline">
            필터 초기화
          </Button>
          <Button
            onClick={handleBulkDelete}
            variant="destructive"
            disabled={selectedRecords.size === 0}
          >
            선택 항목 삭제
          </Button>
        </div>
      </div>

      <div className="text-sm text-gray-500 flex items-center gap-2">
        <input
          type="checkbox"
          checked={selectedRecords.size === filteredRecords.length && filteredRecords.length > 0}
          onChange={() => setSelectedRecords(
            selectedRecords.size === filteredRecords.length
              ? new Set()
              : new Set(filteredRecords.map((r) => r.id))
          )}
        />
        총 {filteredRecords.length}개 항목
      </div>

      {filteredRecords.length === 0 ? (
        <p className="text-gray-500 text-center">기록이 없습니다.</p>
      ) : (
        filteredRecords.map((record) => (
          <div key={record.id} className="relative border rounded-lg p-4 bg-white shadow-sm">
            {/* Record details remain unchanged */}
          </div>
        ))
      )}
    </div>
  );
}