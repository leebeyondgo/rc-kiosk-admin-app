import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";

interface Location {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  location_id: string;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function LocationItemManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [baseItems, setBaseItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase.from("donation_locations").select("*");
      if (!error && data) setLocations(data);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      if (!selectedBase) return;
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("location_id", selectedBase);
      if (!error && data) setBaseItems(data);
    };
    fetchItems();
  }, [selectedBase]);

  const toggleTarget = (id: string) => {
    setSelectedTargets((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const handleSync = async () => {
    if (!selectedBase || baseItems.length === 0 || selectedTargets.size === 0) return;
    if (!confirm("선택한 장소의 기념품을 기준 장소의 내용으로 동기화하시겠습니까?")) return;

    setLoading(true);
    for (const locationId of selectedTargets) {
      await supabase.from("items").delete().eq("location_id", locationId);
      for (const item of baseItems) {
        const { id, ...clone } = item;
        await supabase.from("items").insert({ ...clone, location_id: locationId });
      }
    }
    setLoading(false);
    alert("동기화 완료");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">헌혈 장소별 기념품 관리</h1>

      <div className="space-y-2">
        <h2 className="font-semibold">기준 장소 선택</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {locations.map((loc) => (
            <Button
              key={loc.id}
              onClick={() => setSelectedBase(loc.id)}
              variant={selectedBase === loc.id ? "default" : "outline"}
            >
              {loc.name}
            </Button>
          ))}
        </div>
      </div>

      {selectedBase && (
        <div className="space-y-2">
          <h2 className="font-semibold">동기화 대상 장소 선택</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {locations
              .filter((loc) => loc.id !== selectedBase)
              .map((loc) => (
                <label key={loc.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedTargets.has(loc.id)}
                    onChange={() => toggleTarget(loc.id)}
                  />
                  {loc.name}
                </label>
              ))}
          </div>
        </div>
      )}

      <div className="pt-4">
        <Button onClick={handleSync} disabled={loading || !selectedBase || selectedTargets.size === 0}>
          {loading ? "동기화 중..." : "동기화 실행"}
        </Button>
      </div>
    </div>
  );
}
