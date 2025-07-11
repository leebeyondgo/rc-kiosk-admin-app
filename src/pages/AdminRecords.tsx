import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { Trash2 } from "lucide-react";
import supabase from "@/lib/supabaseClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "@/components/ui/Modal";
import StatisticsModal from "@/modals/StatisticsModal"; // 상단에 import
import { GiftRecord } from "@/types"; // 타입 import
import { useToast } from "@/components/ui/Toast";


interface Location {
  id: string;
  name: string;
}

export default function AdminRecords() {
  const [records, setRecords] = useState<GiftRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<GiftRecord[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => {
    const stored = localStorage.getItem("selectedLocations");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [highlightedRecords, setHighlightedRecords] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(() => {
    const stored = localStorage.getItem("startDate");
    return stored ? new Date(stored) : new Date();
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const stored = localStorage.getItem("endDate");
    return stored ? new Date(stored) : new Date();
  });
  const [dateMode, setDateMode] = useState<"today" | "range">(() => {
    return (localStorage.getItem("dateMode") as "today" | "range") || "today";
  });
  const toast = useToast();
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [ackFilter, setAckFilter] = useState<"all" | "paid" | "unpaid">(() => {
    return (localStorage.getItem("ackFilter") as "all" | "paid" | "unpaid") || "all";
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
      setLoading(false);
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
    
      const matchesDate = recordDate >= start && recordDate <= end;
      const matchesAck =
        ackFilter === "all"
          ? true
          : ackFilter === "paid"
          ? r.is_paid
          : !r.is_paid;
    
      return matchesLocation && matchesDate && matchesAck;
    });

    setFilteredRecords(filtered);

    setSelectedRecords((prev) => {
      const filteredIds = new Set(filtered.map((r) => r.id));
      return new Set([...prev].filter((id) => filteredIds.has(id)));
    });
  }, [records, selectedLocations, startDate, endDate, ackFilter]);

  useEffect(() => {
    localStorage.setItem("selectedLocations", JSON.stringify(selectedLocations));
  }, [selectedLocations]);
  
  useEffect(() => {
    localStorage.setItem("dateMode", dateMode);
  }, [dateMode]);
  
  useEffect(() => {
    localStorage.setItem("startDate", startDate.toISOString());
  }, [startDate]);
  
  useEffect(() => {
    localStorage.setItem("endDate", endDate.toISOString());
  }, [endDate]);
  
  useEffect(() => {
    localStorage.setItem("ackFilter", ackFilter);
  }, [ackFilter]);    

  const handleDelete = async (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      const { error } = await supabase.from("gift_records").delete().eq("id", id);
      if (!error) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast("삭제 실패");
      }
    }
  };

  const resetFilters = () => {
    setSelectedLocations([]);
    setDateMode("today");
    setStartDate(today);
    setEndDate(today);
    setAckFilter("all");
  
    // localStorage도 같이 초기화
    localStorage.removeItem("selectedLocations");
    localStorage.removeItem("dateMode");
    localStorage.removeItem("startDate");
    localStorage.removeItem("endDate");
    localStorage.removeItem("ackFilter");
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
      toast("일괄 삭제 실패");
    }
  };

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords((prev) => {
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

  const toggleAcknowledge = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("gift_records")
      .update({ is_paid: !current })
      .eq("id", id);
  
    if (!error) {
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_paid: !current } : r))
      );
    }
  };

  const today = new Date();

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader className="h-8 w-8" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
        {/* 날짜 필터 */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <label className="font-semibold">날짜 선택</label>
            <div className="flex items-center gap-1">
              <input
                type="radio"
                name="date-mode"
                id="date-mode-today"
                value="today"
                checked={dateMode === 'today'}
                onChange={() => {
                  setDateMode('today');
                  setStartDate(today);
                  setEndDate(today);
                }}
              />
              <label htmlFor="date-mode-today">오늘</label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="radio"
                name="date-mode"
                id="date-mode-range"
                value="range"
                checked={dateMode === 'range'}
                onChange={() => setDateMode('range')}
              />
              <label htmlFor="date-mode-range">기간</label>
            </div>
          </div>
          {dateMode === 'range' && (
            <div className="flex gap-4">
              <div>
                <label className="text-sm">시작 날짜 </label>
                <DatePicker selected={startDate} onChange={(date) => setStartDate(date || today)} />
              </div>
              <div>
                <label className="text-sm">종료 날짜 </label>
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
                  <div key={loc.id} className="flex items-center gap-2 p-2">
                    <input
                      type="checkbox"
                      name="location-filter"
                      id={`location-${loc.id}`}
                      checked={selectedLocations.includes(loc.id)}
                      onChange={() =>
                        setSelectedLocations((prev) =>
                          prev.includes(loc.id)
                            ? prev.filter((id) => id !== loc.id)
                            : [...prev, loc.id]
                        )
                      }
                    />
                    <label htmlFor={`location-${loc.id}`}>{loc.name}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedLocations.length > 0 && (
            <div className="text-sm text-redCrossWarmGray-600">
              선택됨: {selectedLocations.map((id) => locations.find((l) => l.id === id)?.name).join(", ")}
            </div>
          )}
        </div>
        {/* 확인 상태 필터 */}
        <div className="space-y-2">
          <label className="font-semibold">지급 상태</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <input
                type="radio"
                name="ack-filter"
                id="ack-all"
                value="all"
                checked={ackFilter === "all"}
                onChange={() => setAckFilter("all")}
              />
              <label htmlFor="ack-all">전체</label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="radio"
                name="ack-filter"
                id="ack-paid"
                value="paid"
                checked={ackFilter === "paid"}
                onChange={() => setAckFilter("paid")}
              />
              <label htmlFor="ack-paid">지급함</label>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="radio"
                name="ack-filter"
                id="ack-unpaid"
                value="unpaid"
                checked={ackFilter === "unpaid"}
                onChange={() => setAckFilter("unpaid")}
              />
              <label htmlFor="ack-unpaid">미지급</label>
            </div>
          </div>
        </div>
        {/* 컨트롤 버튼 */}
        <div className="flex justify-between items-center">
          <Button onClick={resetFilters} variant="soft">
            필터 초기화
          </Button>
          <Button onClick={handleBulkDelete} variant="destructive" disabled={selectedRecords.size === 0}>
            선택 항목 삭제
          </Button>
        </div>

        <Button onClick={() => setShowModal(true)} variant="default">
          통계 보기
        </Button>

        {/* 선택 및 항목 수 */}
        <div className="flex justify-between items-center text-sm text-redCrossWarmGray-500">
          <label htmlFor="select-all" className="flex items-center gap-2">
            <input
              id="select-all"
              name="select-all"
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
        <p className="text-redCrossWarmGray-500 text-center">기록이 없습니다.</p>
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

            const isAcknowledged = record.is_paid;
            const isHighlighted = highlightedRecords.has(record.id);

            return (
              <div
                key={record.id}
                className={`relative border rounded-lg p-4 shadow-sm cursor-pointer transition duration-500 ${
                  isAcknowledged
                    ? "bg-redCrossWarmGray-100 opacity-70"
                    : isHighlighted
                    ? "animate-highlight"
                    : "bg-white hover:bg-redCrossWarmGray-50"
                }`}
                onClick={() => toggleAcknowledge(record.id, record.is_paid || false)} // "확인함" 상태를 토글하는 부분
              >
                {/* 확인함 텍스트 오버레이 */}
                {isAcknowledged && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-lg font-bold rounded-lg">
                    지급함
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  {/* 체크박스를 클릭할 때만 "확인함" 상태가 변경되지 않도록 stopPropagation() */}
                  <input
                    type="checkbox"
                    name="record-select"
                    id={`record-${record.id}`}
                    checked={selectedRecords.has(record.id)}
                    onChange={(e) => {
                      e.stopPropagation(); // 체크박스를 클릭할 때 "확인함" 상태 변경 안됨
                      toggleRecordSelection(record.id); // 체크박스 상태만 변경
                    }}
                  />
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(record.id);
                  }}
                  className="absolute top-3 right-3 text-redCrossWarmGray-400 hover:text-redCrossRed"
                  aria-label="기록 삭제"
                >
                  <Trash2 size={16} />
                </button>

                <div className="ml-6 mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-redCrossWarmGray-800">{record.name}</span>
                  <span className="text-xs text-redCrossWarmGray-500">
                    {new Date(record.timestamp || "").toLocaleString("ko-KR", {
                      year: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs text-redCrossWarmGray-400">({locationName})</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center px-3 py-2 bg-redCrossWarmGray-50 border rounded text-sm text-redCrossWarmGray-700 shadow-inner"
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
      </>
      )}
      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          labelledBy="statistics-modal-title"
          maxWidthClass="max-w-[95vw] sm:max-w-xl md:max-w-5xl"
        >
          <StatisticsModal
            data={filteredRecords}
            titleId="statistics-modal-title"
          />
        </Modal>
      )}
    </div>
  );
}

