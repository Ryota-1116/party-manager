"use client";

import { useState, use } from "react";

export default function RegisterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [instagramId, setInstagramId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("e-transfer");
  const [transferReference, setTransferReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!instagramId) return;
    if (paymentMethod === "e-transfer" && !transferReference) {
      setError("Please enter your E-Transfer reference number");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partyId: id,
        instagramId,
        paymentMethod,
        transferReference: transferReference || null,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json();
      if (data.error === "Already registered") {
        setError("This Instagram ID is already registered");
      } else {
        setError("Registration failed. Please try again");
      }
    }
  };

  if (done) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl mb-4">🎉</p>
          <h1 className="text-2xl font-bold mb-2">You're registered!</h1>
          <p className="text-gray-400 mb-6">See you at the party!</p>
          {paymentMethod === "e-transfer" && (
            <div className="bg-gray-900 rounded-2xl p-4 mb-4 text-left">
              <p className="text-sm text-gray-400 mb-1">E-Transfer Reference Number</p>
              <p className="font-mono font-bold text-green-400">{transferReference}</p>
              <p className="text-xs text-gray-500 mt-2">Screenshot this page and save it!</p>
            </div>
          )}
          {paymentMethod === "cash" && (
            <div className="bg-gray-900 rounded-2xl p-4 mb-4 text-left">
              <p className="text-sm text-gray-400">💵 Pay cash on the day</p>
              <p className="text-xs text-gray-500 mt-2">Just tell the host your Instagram ID when you arrive!</p>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <h1 className="text-2xl font-bold mb-2 text-center">🎉 Register for the Party</h1>
      <p className="text-gray-400 text-center text-sm mb-6">Fill in the details below to sign up!</p>

      <div className="bg-gray-900 rounded-2xl p-4">
        <label className="text-sm text-gray-400 mb-1 block">Instagram ID</label>
        <input
        className="w-full bg-gray-800 rounded-xl p-3 mb-4 text-white placeholder-gray-500"
        placeholder="Enter without @"
        value={instagramId}
        onChange={(e) => {
            const value = e.target.value.replace(/[^a-z0-9._]/g, "");
            setInstagramId(value);
        }}
        />

        <label className="text-sm text-gray-400 mb-1 block">Payment Method</label>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPaymentMethod("e-transfer")}
            className={`flex-1 rounded-xl p-3 font-semibold text-sm whitespace-nowrap ${
              paymentMethod === "e-transfer"
                ? "bg-indigo-600"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            💸 E-Transfer
          </button>
          <button
            onClick={() => setPaymentMethod("cash")}
            className={`flex-1 rounded-xl p-3 font-semibold text-sm whitespace-nowrap ${
              paymentMethod === "cash"
                ? "bg-indigo-600"
                : "bg-gray-800 text-gray-400"
            }`}
          >
            💵 Cash
          </button>
        </div>

        {paymentMethod === "e-transfer" && (
          <>
            <label className="text-sm text-gray-400 mb-1 block">E-Transfer Reference Number</label>
            <input
                className="w-full bg-gray-800 rounded-xl p-3 mb-4 text-white placeholder-gray-500"
                placeholder="Enter reference number"
                value={transferReference}
                onChange={(e) => {
                    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                    setTransferReference(value);
                }}
                />
        </>
        )}

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-xl p-3 font-semibold disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </main>
  );
}