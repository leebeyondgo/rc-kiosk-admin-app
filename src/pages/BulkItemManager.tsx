import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";
import { Button } from "@/components/ui/button";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface GiftItem {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
}

interface Location {
  id: string;
  name: string;
}

interface LocationGiftItem {
  id: string;
  location_id: string;
  gift_item_id: string;
  category: string;
  sort_order: number;
  allow_multiple: boolean;
  visible: boolean;
}

export default function BulkItemManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [giftItems, setGiftItems] = useState<GiftItem[]>([]);
  const [locationGiftItems, setLocationGiftItems] = useState<LocationGiftItem[]>([]);
  const [syncTargets, setSyncTargets] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: locs } = await supabase.from("donation_locations").select("*");
      const { data: items } = await supabase.from("gift_items").select("*");
      if (locs) setLocations(locs);
      if (items) setGiftItems(items);
    };
    fetchData();
  }, []);

  const fetchLocationGiftItems = async (locationId: string) => {
    const { data } = await supabase
      .from("location_gift_items")
      .select("*")
      .eq("location_id", locationId);
    setLocationGiftItems(data || []);
  };

  const handleLocationClick = (loc: Location) => {
    setSelectedLocation(loc);
    fetchLocationGiftItems(loc.id);
  };

  const handleSync = async () => {
    if (!selectedLocation) return;

    const { error: delErr } = await supabase
      .from("location_gift_items")
      .delete()
      .in("location_id", syncTargets);

    if (delErr) return alert("삭제 실패: " + delErr.message);

    const newData = syncTargets.flatMap((locId) =>
      locationGiftItems.map((item) => ({
        ...item,
        location_id: locId,
        id: undefined, // 새 uuid 생성되게
      }))
    );

    const { error: insertErr } = await supabase.from("location_gift_items").insert(newData);
    if (insertErr) return alert("삽입 실패: " + insertErr.message);

    alert("동기화 완료");
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
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
              {selectedLocation.name}의 기념품 목록 ({locationGiftItems.length}개)
            </h3>
            <ul className="list-disc list-inside text-sm mb-4">
              {locationGiftItems.map((item, i) => {
                const base = giftItems.find((g) => g.id === item.gift_item_id);
                return (
                  <li key={i}>
                    {base?.name || "[삭제된 기념품]"} - {item.category} -
                    순서 {item.sort_order} - 중복허용: {item.allow_multiple ? "O" : "X"}
                  </li>
                );
              })}
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
