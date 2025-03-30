import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface GiftItem {
  id: string;
  name: string;
  category: string;
  image_url?: string;
  sort_order: number;
  allow_multiple: boolean;
  visible: boolean;
  description?: string;
  location_id: string;
}

interface Location {
  id: string;
  name: string;
}

export default function GiftItemBulkManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [items, setItems] = useState<GiftItem[]>([]);
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
      .from("gift_items")
      .select("*")
      .eq("location_id", locationId);
    setItems(data || []);
  };

  const handleLocationClick = (loc: Location) => {
    setSelectedLocation(loc);
    fetchItems(loc.id);
    setSyncTargets([]);
  };

  const handleSync = async () => {
    if (!selectedLocation) return;

    // 필수 필드 전부 포함
    const sourceItems = items.map((item) => ({
      name: item.name,
      category: item.category,
      sort_order: item.sort_order ?? 0,
      allow_multiple: item.allow_multiple ?? false,
      visible: item.visible ?? true,
      description: item.description ?? null,
      image_url: item.image_url ?? null,
    }));

    for (const targetId of syncTargets) {
      // 기존 아이템 삭제
      await supabase.from("gift_items").delete().eq("location_id", targetId);
      // 새로운 아이템 삽입
      const itemsToInsert = sourceItems.map((item) => ({
        ...item,
        location_id: targetId,
      }));
      const { error } = await supabase.from("gift_items").insert(itemsToInsert);
      if (error) {
        alert(`동기화 실패 (장소 ID: ${targetId})`);
        console.error(error);
        return;
      }
    }

    alert("선택한 장소들과 동기화 완료");
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
