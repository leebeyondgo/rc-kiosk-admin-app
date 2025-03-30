import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [dateMode, setDateMode] = useState<'today' | 'range'>('today');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const filtered = records.filter((r) => {
      const matchesLocation =
        selectedLocations.length === 0 || selectedLocations.includes(r.location_id);
      const recordDate = new Date(r.timestamp || "");
      const from = new Date(startDate);
      const to = new Date(endDate);
      to.setHours(23, 59, 59, 999);
      return matchesLocation && recordDate >= from && recordDate <= to;
    });
    setFilteredRecords(filtered);
  }, [records, selectedLocations, startDate, endDate]);

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

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const today = new Date();

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="font-semibold">날짜 선택</label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="today"
                checked={dateMode === 'today'}
                onChange={() => {
                  setDateMode('today');
                  setStartDate(today);
                  setEndDate(today);
                }}
              />
              당일
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                value="range"
                checked={dateMode === 'range'}
                onChange={() => setDateMode('range')}
              />
              기간
            </label>
          </div>
          {dateMode === 'range' && (
            <div className="flex gap-4">
              <div>
                <label className="text-sm">시작 날짜</label>
                <DatePicker selected={startDate} onChange={(date) => setStartDate(date || today)} />
              </div>
              <div>
                <label className="text-sm">종료 날짜</label>
                <DatePicker selected={endDate} onChange={(date) => setEndDate(date || today)} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2" ref={dropdownRef}>
          <label className="font-semibold">헌혈 장소</label>
          <div className="relative">
            <Button onClick={() => setShowLocationDropdown(!showLocationDropdown)} variant="outline">
              {selectedLocations.length > 0
                ? `${selectedLocations.length}개 선택됨`
                : "장소 선택"}
            </Button>
            {showLocationDropdown && (
              <div className="absolute z-10 mt-2 w-full max-h-40 overflow-y-auto border rounded bg-white shadow">
                {locations.map((loc) => (
                  <label key={loc.id} className="flex items-center gap-2 p-2">
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
            )}
          </div>
          {selectedLocations.length > 0 && (
            <div className="text-sm text-gray-600">
              선택됨: {selectedLocations.map((id) => locations.find((l) => l.id === id)?.name).join(", ")}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Button
            onClick={() => {
              setSelectedLocations([]);
              setDateMode('today');
              setStartDate(today);
              setEndDate(today);
            }}
            variant="outline"
          >
            필터 초기화
          </Button>
          <Button onClick={handleBulkDelete} variant="destructive" disabled={selectedRecords.size === 0}>
            선택 항목 삭제
          </Button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <p className="text-gray-500 text-center">기록이 없습니다.</p>
      ) : (
        filteredRecords.map((record) => (
          <div key={record.id} className="relative border rounded-lg p-4 bg-white shadow-sm">
            <div className="ml-6 font-semibold text-gray-800">{record.name}</div>
          </div>
        ))
      )}
    </div>
  );
}
