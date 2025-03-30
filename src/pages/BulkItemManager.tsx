import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Item {
  id: string;
  name: string;
  location_id: string;
}

interface Location {
  id: string;
  name: string;
}

export default function BulkItemManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [syncTargets, setSyncTargets] = useState<string[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase.from("donation_locations").select("*");
      setLocations(data || []);
    };
    fetchLocations();
  }, []);

  const fetchItems = async (locationId: string) => {
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("location_id", locationId);
    setItems(data || []);
  };

  const handleLocationClick = (loc: Location) => {
    setSelectedLocation(loc);
    fetchItems(loc.id);
  };

  const handleSync = async () => {
    if (!selectedLocation) return;

    const sourceItems = items.map((item) => ({ name: item.name }));

    for (const targetId of syncTargets) {
      await supabase.from("items").delete().eq("location_id", targetId);
      for (const item of sourceItems) {
        await supabase.from("items").insert({ ...item, location_id: targetId });
      }
    }
    alert("동기화 완료");
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">헌혈 장소별 기념품 관리</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">헌혈 장소 목록</h3>
          <ul className="space-y-1">
            {locations.map((loc) => (
              <li key={loc.id}>
                <Button
                  variant={selectedLocation?.id === loc.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleLocationClick(loc)}
                >
                  {loc.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {selectedLocation && (
          <div>
            <h3 className="font-semibold mb-2">
              {selectedLocation.name}의 기념품 목록 ({items.length}개)
            </h3>
            <ul className="list-disc list-inside text-sm mb-4">
              {items.map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>

            <div>
              <label className="font-semibold">동기화 대상 선택</label>
              <div className="border rounded p-2 max-h-40 overflow-y-auto space-y-1 mt-1">
                {locations
                  .filter((l) => l.id !== selectedLocation.id)
                  .map((loc) => (
                    <label key={loc.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={syncTargets.includes(loc.id)}
                        onChange={() =>
                          setSyncTargets((prev) =>
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
              <Button onClick={handleSync} className="mt-3">
                선택한 장소들과 동기화
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
