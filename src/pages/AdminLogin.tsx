
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onLoginSuccess, onBack }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      sessionStorage.setItem("isAdmin", "true");
      onLoginSuccess();
    } else {
      setError("비밀번호가 잘못되었습니다.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">관리자 로그인</h2>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        <Input
          type="password"
          placeholder="비밀번호 입력"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4"
        />
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={handleLogin}>로그인</Button>
          <Button variant="outline" onClick={onBack}>돌아가기</Button>
        </div>
      </div>
    </div>
  );
}
