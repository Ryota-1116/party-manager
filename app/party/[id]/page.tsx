"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

type Guest = {
  id: string;
  instagramId: string;
  paymentMethod: string;
  transferReference: string | null;
  checkedIn: boolean;
  manuallyAdded: boolean;
};

type Party = {
  id: string;
  name: string;
  date: string;
  fee: number;
  guests: Guest[];
};

export default function PartyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [party, setParty] = useState<Party | null>(null);
  const [search, setSearch] = useState("");
  const [showCheckedIn, setShowCheckedIn] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [addInstagram, setAddInstagram] = useState("");
  const [addPayment, setAddPayment] = useState("cash");
  const [addReference, setAddReference] = useState("");

  const fetchParty = async () => {
    const res = await fetch(`/api/parties/${id}`);
    const data = await res.json();
    setParty(data);
  };

  useEffect(() => {
    fetchParty();
  }, [id]);

  const handleCheckIn = async (guestId: string, checkedIn: boolean) => {
    await fetch(`/api/guests/${guestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkedIn }),
    });
    fetchParty();
  };

  const handleAddGuest = async () => {
    if (!addInstagram) return;
    await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partyId: id,
        instagramId: addInstagram,
        paymentMethod: addPayment,
        transferReference: addReference || null,
        manuallyAdded: true,
        checkedIn: true,
      }),
    });
    setAddInstagram("");
    setAddReference("");
    fetchParty();
  };

  const handleDelete = async (guestId: string) => {
    await fetch(`/api/guests/${guestId}`, { method: "DELETE" });
    fetchParty();
  };

  const filteredGuests = (party?.guests ?? [])
    .filter((g) => g.instagramId.toLowerCase().startsWith(search.toLowerCase()))
    .filter((g) => showCheckedIn ? g.checkedIn : !g.checkedIn);

  const totalPages = Math.ceil((filteredGuests?.length ?? 0) / PAGE_SIZE);
  const pagedGuests = filteredGuests?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const checkedInCount = (party?.guests ?? []).filter((g) => g.checkedIn).length;
  const totalCount = (party?.guests ?? []).length;

  if (!party) return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      読み込み中...
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <div className="flex items-center mb-4">
        <button onClick={() => router.push("/")} className="text-gray-400 mr-3">←</button>
        <h1 className="text-xl font-bold">{party.name}</h1>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold">{totalCount}</p>
          <p className="text-gray-400 text-xs">総参加者</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{checkedInCount}</p>
          <p className="text-gray-400 text-xs">チェックイン済み</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{totalCount - checkedInCount}</p>
          <p className="text-gray-400 text-xs">未チェックイン</p>
        </div>
      </div>

      {/* 登録リンク */}
      <div className="bg-gray-900 rounded-2xl p-4 mb-4">
        <p className="text-sm text-gray-400 mb-2">ゲスト登録リンク</p>
        <p className="text-xs bg-gray-800 rounded-xl p-2 break-all">
          {typeof window !== "undefined" ? `${window.location.origin}/party/${id}/register` : ""}
        </p>
        <button
          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/party/${id}/register`)}
          className="mt-2 w-full bg-gray-700 hover:bg-gray-600 rounded-xl p-2 text-sm"
        >
          リンクをコピー
        </button>
      </div>

      {/* 検索 */}
      <input
        className="w-full bg-gray-800 rounded-xl p-3 mb-3 text-white placeholder-gray-500"
        placeholder="インスタIDで検索..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      />

      {/* フィルターボタン */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setShowCheckedIn(false); setPage(1); }}
          className={`flex-1 rounded-xl p-2 text-sm font-semibold ${!showCheckedIn ? "bg-indigo-600" : "bg-gray-800 text-gray-400"}`}
        >
          未チェックイン ({(party?.guests ?? []).filter(g => !g.checkedIn).length})
        </button>
        <button
          onClick={() => { setShowCheckedIn(true); setPage(1); }}
          className={`flex-1 rounded-xl p-2 text-sm font-semibold ${showCheckedIn ? "bg-green-600" : "bg-gray-800 text-gray-400"}`}
        >
          済み ({(party?.guests ?? []).filter(g => g.checkedIn).length})
        </button>
      </div>

      {/* ゲスト一覧 */}
      <div className="mb-4">
        {pagedGuests?.map((guest) => (
          <div key={guest.id} className="bg-gray-900 rounded-2xl p-4 mb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">@{guest.instagramId}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400">
                    {guest.paymentMethod === "e-transfer" ? "💸 E-Transfer" : "💵 Cash"}
                    {guest.transferReference && ` · ${guest.transferReference}`}
                  </p>
                  {guest.manuallyAdded && (
                    <span className="text-xs bg-yellow-600 text-white rounded-full px-2 py-0.5">手動</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => handleCheckIn(guest.id, !guest.checkedIn)}
                  className={`rounded-xl px-3 py-1 text-sm font-semibold whitespace-nowrap ${
                    guest.checkedIn
                      ? "bg-green-600 hover:bg-green-500"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {guest.checkedIn ? "✅ 済み" : "未"}
                </button>
                <button
                  onClick={() => handleDelete(guest.id)}
                  className="text-red-400 text-sm whitespace-nowrap"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-gray-800 rounded-xl px-4 py-2 text-sm disabled:opacity-50"
          >
            ←
          </button>
          <span className="flex items-center text-sm text-gray-400">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="bg-gray-800 rounded-xl px-4 py-2 text-sm disabled:opacity-50"
          >
            →
          </button>
        </div>
      )}

      {/* 手動追加 */}
      <div className="bg-gray-900 rounded-2xl p-4">
        <h2 className="text-sm font-semibold mb-3">ゲストを手動追加</h2>
        <input
          className="w-full bg-gray-800 rounded-xl p-3 mb-2 text-white placeholder-gray-500"
          placeholder="インスタID"
          value={addInstagram}
          onChange={(e) => {
            const value = e.target.value.replace(/[^a-zA-Z0-9._]/g, "");
            setAddInstagram(value);
          }}
        />
        <select
          className="w-full bg-gray-800 rounded-xl p-3 mb-2 text-white"
          value={addPayment}
          onChange={(e) => setAddPayment(e.target.value)}
        >
          <option value="cash">Cash</option>
          <option value="e-transfer">E-Transfer</option>
        </select>
        {addPayment === "e-transfer" && (
          <input
            className="w-full bg-gray-800 rounded-xl p-3 mb-2 text-white placeholder-gray-500"
            placeholder="確認番号"
            value={addReference}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
              setAddReference(value);
            }}
          />
        )}
        <button
          onClick={handleAddGuest}
          className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl p-3 font-semibold"
        >
          追加
        </button>
      </div>
    </main>
  );
}