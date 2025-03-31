import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/supabaseConfig";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface AdminLoginProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onBack, onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from("center_auth")
      .select("password")
      .eq("id", username)
      .single();

    if (error) {
      alert("서버 오류가 발생했습니다.");
      console.error(error);
      return;
    }

    if (data && data.password === password) {
      localStorage.setItem("isAdmin", "true");
      onLoginSuccess();
    } else {
      alert("아이디 또는 비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div className="flex justify-center items-center h-full relative">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow space-y-4">
        <h1 className="text-xl font-semibold text-center">로그인</h1>
        <Input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="text-base"
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-base"
        />
        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline" className="text-base">
            돌아가기
          </Button>
          <Button onClick={handleLogin} className="text-base">
            로그인
          </Button>
        </div>
      </div>
    </div>
  );
}
