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
  const [acknowledgedRecords, setAcknowledgedRecords] = useState<Set<string>>(new Set());
  const [highlightedRecords, setHighlightedRecords] = useState<Set<string>>(new Set());
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

    const subscription = supabase
      .channel("gift_records_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gift_records" },
        (payload) => {
          const newRecord = payload.new as GiftRecord;
          setRecords((prev) => {
            const updated = [newRecord, ...prev.filter((r) => r.id !== newRecord.id)];
            return updated.sort((a, b) => new Date(b.timestamp || "").getTime() - new Date(a.timestamp || "").getTime());
          });
          setHighlightedRecords((prev) => new Set(prev).add(newRecord.id));

          setTimeout(() => {
            setHighlightedRecords((prev) => {
              const updated = new Set(prev);
              updated.delete(newRecord.id);
              return updated;
            });
          }, 3000); // 3초간 강조 표시
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
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

      if (!r.timestamp) return false;

      const recordDate = new Date(r.timestamp);
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return matchesLocation && recordDate >= start && recordDate <= end;
    });

    setFilteredRecords(filtered);

    setSelectedRecords((prev) => {
      const filteredIds = new Set(filtered.map((r) => r.id));
      return new Set([...prev].filter((id) => filteredIds.has(id)));
    });
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

  const toggleAcknowledge = (id: string) => {
    setAcknowledgedRecords((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedRecords.size === filteredRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(filteredRecords.map((r) => r.id)));
    }
  };

  const today = new Date();

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      <div className="flex flex-col gap-4">
        {/* 날짜 필터 */}
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
              오늘
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

        {/* 장소 필터 */}
        <div className="space-y-2" ref={dropdownRef}>
          <label className="font-semibold">헌혈 장소</label>
          <div className="relative">
            <Button onClick={() => setShowLocationDropdown(!showLocationDropdown)} variant="soft">
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

        {/* 컨트롤 버튼 */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => {
              setSelectedLocations([]);
              setDateMode('today');
              setStartDate(today);
              setEndDate(today);
            }}
            variant="soft"
          >
            필터 초기화
          </Button>
          <Button onClick={handleBulkDelete} variant="destructive" disabled={selectedRecords.size === 0}>
            선택 항목 삭제
          </Button>
        </div>

        {/* 선택 및 항목 수 */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedRecords.size === filteredRecords.length && filteredRecords.length > 0}
              onChange={toggleSelectAll}
            />
            전체 선택
          </label>
          <span>총 {filteredRecords.length}개 항목</span>
        </div>
      </div>

      {/* 결과 리스트 */}
      {filteredRecords.length === 0 ? (
        <p className="text-gray-500 text-center">기록이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const locationName = locations.find((loc) => loc.id === record.location_id)?.name || "-";

            let items: string[] = [];
            try {
              items = Array.isArray(record.items) ? record.items : JSON.parse(record.items as any);
            } catch {
              items = [];
            }

            const isAcknowledged = acknowledgedRecords.has(record.id);
            const isHighlighted = highlightedRecords.has(record.id);

            return (
              <div
                key={record.id}
                className={`relative border rounded-lg p-4 shadow-sm cursor-pointer transition duration-500 ${
                  isAcknowledged
                    ? "bg-gray-100 opacity-70"
                    : isHighlighted
                    ? "animate-highlight"
                    : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => toggleAcknowledge(record.id)}
              >
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedRecords.has(record.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleRecordSelection(record.id);
                    }}
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(record.id);
                  }}
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

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center px-3 py-2 bg-gray-50 border rounded text-sm text-gray-700 shadow-inner"
                    >
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
