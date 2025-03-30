import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Location {
  id: string;
  name: string;
}

export default function AdminMultiLocationItems() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBaseLocation, setSelectedBaseLocation] = useState<string | null>(null);
  const [targetLocations, setTargetLocations] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase.from("donation_locations").select("id, name");
      if (error) {
        console.error("헌혈 장소 불러오기 실패", error);
      } else {
        setLocations(data || []);
      }
      setLoading(false);
    };
    fetchLocations();
  }, []);

  const toggleTarget = (id: string) => {
    setTargetLocations((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleSync = async () => {
    if (!selectedBaseLocation || targetLocations.size === 0) return alert("기준 장소와 대상 장소를 선택해주세요.");

    const { data: baseItems, error: baseError } = await supabase
      .from("items")
      .select("*")
      .eq("location_id", selectedBaseLocation);

    if (baseError || !baseItems) {
      return alert("기준 장소의 기념품을 불러오는 데 실패했습니다.");
    }

    const deletePromises = Array.from(targetLocations).map((id) =>
      supabase.from("items").delete().eq("location_id", id)
    );
    await Promise.all(deletePromises);

    const insertPromises = Array.from(targetLocations).map((id) =>
      supabase.from("items").insert(baseItems.map((item) => ({
        ...item,
        location_id: id,
        id: crypto.randomUUID(),
      })))
    );
    await Promise.all(insertPromises);

    alert("동기화 완료!");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h2 className="text-xl font-bold">헌혈 장소별 기념품 관리</h2>

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <>
          <div className="space-y-4">
            <label className="block font-semibold">기준 장소 선택</label>
            <div className="flex flex-wrap gap-2">
              {locations.map((loc) => (
                <Button
                  key={loc.id}
                  variant={selectedBaseLocation === loc.id ? "default" : "outline"}
                  onClick={() => setSelectedBaseLocation(loc.id)}
                >
                  {loc.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <label className="block font-semibold">동기화 대상 장소 선택</label>
            <div className="flex flex-wrap gap-2">
              {locations
                .filter((loc) => loc.id !== selectedBaseLocation)
                .map((loc) => (
                  <Button
                    key={loc.id}
                    variant={targetLocations.has(loc.id) ? "default" : "outline"}
                    onClick={() => toggleTarget(loc.id)}
                  >
                    {loc.name}
                  </Button>
              ))}
            </div>
          </div>

          <div className="pt-6">
            <Button onClick={handleSync} disabled={!selectedBaseLocation || targetLocations.size === 0}>
              선택된 장소에 기념품 동기화
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
