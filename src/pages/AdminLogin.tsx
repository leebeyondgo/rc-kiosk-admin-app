import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import supabase from "@/lib/supabaseClient";


interface AdminLoginProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onBack, onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from("user_auth")
      .select("password")
      .eq("id", username)
      .single();

    if (error) {
      toast("서버 오류가 발생했습니다.");
      console.error(error);
      return;
    }

    if (data && data.password === password) {
      localStorage.setItem("isAdmin", "true");
      onLoginSuccess();
    } else {
      toast("아이디 또는 비밀번호가 틀렸습니다.");
    }
  };

  return (
    <div className="flex justify-center items-center h-full relative">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow space-y-4">
        <h1 className="text-xl font-semibold text-center">로그인</h1>
        <label className="block space-y-1" htmlFor="username">
          <span className="sr-only">아이디</span>
          <Input
            type="text"
            id="username"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="text-base"
          />
        </label>
        <label className="block space-y-1" htmlFor="password">
          <span className="sr-only">비밀번호</span>
          <Input
            type="password"
            id="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-base"
          />
        </label>
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

