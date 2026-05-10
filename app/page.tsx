"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Party = {
  id: string;
  name: string;
  date: string;
  fee: number;
};

const PASSWORD_KEY = "party_manager_password";
const AUTH_KEY = "party_manager_authed";

export default function Home() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editFee, setEditFee] = useState("");

  useEffect(() => {
    const authed = sessionStorage.getItem(AUTH_KEY);
    if (authed === "true") {
      setAuthenticated(true);
      fetchParties();
    }
    const saved = localStorage.getItem(PASSWORD_KEY);
    if (!saved) setIsSettingUp(true);
  }, []);

  const fetchParties = async () => {
  const res = await fetch("/api/parties");
  const data = await res.json();
  setParties(Array.isArray(data) ? data : []);
  };

  const handleSetPassword = () => {
    if (!inputPassword) return;
    if (inputPassword !== confirmPassword) {
      setAuthError("パスワードが一致しません");
      return;
    }
    localStorage.setItem(PASSWORD_KEY, inputPassword);
    sessionStorage.setItem(AUTH_KEY, "true");
    setAuthenticated(true);
    setIsSettingUp(false);
    fetchParties();
  };

  const handleLogin = () => {
    const saved = localStorage.getItem(PASSWORD_KEY);
    if (inputPassword === saved) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setAuthenticated(true);
      setAuthError("");
      fetchParties();
    } else {
      setAuthError("パスワードが違います");
    }
  };

  const handleCreate = async () => {
    if (!name || !date || !fee) return;
    setLoading(true);

    const res = await fetch("/api/parties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, date, fee: parseInt(fee) }),
    });

    const party = await res.json();
    setLoading(false);
    router.push(`/party/${party.id}`);
  };

  const handleEdit = (party: Party) => {
    setEditingParty(party);
    setEditName(party.name);
    setEditDate(party.date.split("T")[0]);
    setEditFee(party.fee.toString());
  };

  const handleUpdate = async () => {
    if (!editingParty) return;
    await fetch(`/api/parties/${editingParty.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, date: editDate, fee: parseInt(editFee) }),
    });
    setEditingParty(null);
    fetchParties();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/parties/${id}`, { method: "DELETE" });
    fetchParties();
  };

  // パスワード設定画面
  if (isSettingUp) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">🎉 Party Manager</h1>
        <p className="text-gray-400 text-sm mb-6">初回設定：ホスト用パスワードを設定してください</p>
        <div className="w-full max-w-sm">
          <input
            type="password"
            className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-white placeholder-gray-500"
            placeholder="パスワード"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
          />
          <input
            type="password"
            className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-white placeholder-gray-500"
            placeholder="パスワード（確認）"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
          <button
            onClick={handleSetPassword}
            className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl p-3 font-semibold"
          >
            設定する
          </button>
        </div>
      </main>
    );
  }

  // ログイン画面
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-6">🎉 Party Manager</h1>
        <div className="w-full max-w-sm">
          <input
            type="password"
            className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-white placeholder-gray-500"
            placeholder="パスワード"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl p-3 font-semibold"
          >
            ログイン
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
     <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">🎉 Party Manager</h1>
      <button
        onClick={() => {
          localStorage.removeItem(PASSWORD_KEY);
          sessionStorage.removeItem(AUTH_KEY);
          setAuthenticated(false);
          setIsSettingUp(true);
          setInputPassword("");
          setConfirmPassword("");
        }}
        className="text-xs text-gray-500 hover:text-gray-300"
      >
        パスワード変更
      </button>
    </div>

      {/* パーティ作成フォーム */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">新しいパーティを作成</h2>
        <input
          className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-white placeholder-gray-500"
          placeholder="パーティ名"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="date"
          className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-white"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="number"
          className="w-full bg-gray-800 rounded-xl p-3 mb-4 text-white placeholder-gray-500"
          placeholder="参加費 (CAD)"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
        />
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl p-3 font-semibold disabled:opacity-50"
        >
          {loading ? "作成中..." : "パーティを作成"}
        </button>
      </div>

      {/* パーティ一覧 */}
      <div>
        <h2 className="text-lg font-semibold mb-3">過去のパーティ</h2>
        {parties.length === 0 ? (
          <p className="text-gray-500 text-center">まだパーティがありません</p>
        ) : (
          parties.map((party) => (
            <div key={party.id} className="bg-gray-900 rounded-2xl p-4 mb-3">
              <div
                onClick={() => router.push(`/party/${party.id}`)}
                className="cursor-pointer mb-3"
              >
                <p className="font-semibold">{party.name}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(party.date).toLocaleDateString("ja-JP", { timeZone: "UTC" })} · ${party.fee} CAD
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(party)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-xl p-2 text-sm"
                >
                  編集
                </button>
                <button
                  onClick={() => handleDelete(party.id)}
                  className="flex-1 bg-red-900 hover:bg-red-800 rounded-xl p-2 text-sm text-red-300"
                >
                  削除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 編集モーダル */}
      {editingParty && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-4 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">パーティを編集</h2>
            <input
              className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-white placeholder-gray-500"
              placeholder="パーティ名"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <input
              type="date"
              className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-white"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
            <input
              type="number"
              className="w-full bg-gray-800 rounded-xl p-3 mb-4 text-white placeholder-gray-500"
              placeholder="参加費 (CAD)"
              value={editFee}
              onChange={(e) => setEditFee(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditingParty(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 rounded-xl p-3 font-semibold"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdate}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 rounded-xl p-3 font-semibold"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}