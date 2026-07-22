"use client";

import { useEffect, useState } from "react";

type WearableEpisode = {
  id: string;
  productId: string;
  customerIntent: string;
  humanOutcome: "confirmed" | "adjustment";
  score: number;
  createdAt: string;
  policy: { trainingEligible: false };
};

const productNames: Record<string, string> = {
  "eclipse-bag": "Eclipse Shoulder Bag",
  "lumiere-scarf": "Lumière Silk Scarf",
  "aster-sneaker": "Aster City Sneaker",
};

export default function WearablePage() {
  const [episode, setEpisode] = useState<WearableEpisode | null>(null);
  const [connection, setConnection] = useState<"connecting" | "live" | "offline">("connecting");
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const response = await fetch("/api/episodes/latest", { cache: "no-store" });
        if (!response.ok) throw new Error("Episode service unavailable");
        const payload = (await response.json()) as { episode: WearableEpisode | null };
        if (active) {
          setEpisode(payload.episode);
          setConnection("live");
        }
      } catch {
        if (active) setConnection("offline");
      }
    }

    void refresh();
    const timer = window.setInterval(refresh, 1500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <main className={focusMode ? "wearable-shell focus-mode" : "wearable-shell"}>
      <header className="wearable-header">
        <a href="/" aria-label="Return to MOONLOOP web experience">
          <span>M</span><strong>MOONLOOP</strong>
        </a>
        <p><i className={connection} />{connection}</p>
      </header>

      <section className="wearable-hero">
        <p className="wearable-kicker">ROKID COMPANION VIEW</p>
        <h1>{episode ? "A confirmed moment is ready." : "Waiting for the next customer moment."}</h1>
        <p>Glanceable guidance keeps the associate present in the conversation.</p>
      </section>

      <section className="wearable-grid">
        <article className="wearable-card primary">
          <small>CUSTOMER INTENT</small>
          <p>{episode?.customerIntent ?? "The confirmed customer intent will appear here."}</p>
        </article>
        <article className="wearable-card">
          <small>PRODUCT</small>
          <strong>{episode ? productNames[episode.productId] ?? episode.productId : "—"}</strong>
          <span>{episode?.humanOutcome ?? "Awaiting confirmation"}</span>
        </article>
        <article className="wearable-card score-card">
          <small>EPISODE SCORE</small>
          <strong>{episode?.score ?? "—"}</strong>
          <span>Human-confirmed</span>
        </article>
      </section>

      <section className="wearable-guidance">
        <div>
          <small>EXPLAINABLE NEXT MOVE</small>
          <p>{episode?.humanOutcome === "adjustment"
            ? "Acknowledge the mismatch and return to discovery before showing another option."
            : "Reflect the confirmed preference and offer one relevant comparison without rushing the decision."}</p>
        </div>
        <button onClick={() => setFocusMode((current) => !current)} type="button">
          {focusMode ? "Show full view" : "Enter focus view"}
        </button>
      </section>

      <footer className="wearable-footer">
        <span>◆ Policy locked</span>
        <p>YouCam media and assisted episodes are excluded from training.</p>
      </footer>
    </main>
  );
}
