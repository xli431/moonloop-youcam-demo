"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  category: string;
  color: string;
  inventory: string;
  accent: string;
};

type TaskStatus = "idle" | "queued" | "processing" | "completed" | "failed";

type YouCamTask = {
  id: string;
  status: Exclude<TaskStatus, "idle">;
  provider: "youcam-mock";
  productId: string;
  result?: { previewTheme: string; notice: string };
};

const products: Product[] = [
  {
    id: "eclipse-bag",
    name: "Eclipse Shoulder Bag",
    category: "Leather Goods",
    color: "Midnight Plum",
    inventory: "4 available",
    accent: "plum",
  },
  {
    id: "lumiere-scarf",
    name: "Lumière Silk Scarf",
    category: "Accessories",
    color: "Moonlight Gold",
    inventory: "8 available",
    accent: "gold",
  },
  {
    id: "aster-sneaker",
    name: "Aster City Sneaker",
    category: "Footwear",
    color: "Cloud White",
    inventory: "2 in this size",
    accent: "ivory",
  },
];

const stageLabels = ["Discover", "Visualize", "Confirm", "Improve"];

export default function Home() {
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [stage, setStage] = useState(0);
  const [task, setTask] = useState<YouCamTask | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("idle");
  const [confirmation, setConfirmation] = useState<"confirmed" | "adjustment" | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState(
    "I am looking for something refined that works for travel and evening events.",
  );
  const [episodeScore, setEpisodeScore] = useState<number | null>(null);

  const product = useMemo(
    () => products.find((item) => item.id === selectedProductId) ?? products[0],
    [selectedProductId],
  );

  useEffect(() => {
    if (!task || task.status === "completed" || task.status === "failed") return;

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/youcam/tasks/${task.id}`, { cache: "no-store" });
      const nextTask = (await response.json()) as YouCamTask;
      setTask(nextTask);
      setTaskStatus(nextTask.status);
      if (nextTask.status === "completed") {
        setStage(2);
        window.clearInterval(timer);
      }
    }, 650);

    return () => window.clearInterval(timer);
  }, [task]);

  async function createVisualExperience() {
    setTaskStatus("queued");
    setConfirmation(null);
    setEpisodeScore(null);
    setStage(1);

    const response = await fetch("/api/youcam/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product.id,
        experienceType: "apparel-vto",
        hasConsent: true,
      }),
    });

    if (!response.ok) {
      setTaskStatus("failed");
      return;
    }

    const nextTask = (await response.json()) as YouCamTask;
    setTask(nextTask);
    setTaskStatus(nextTask.status);
  }

  async function confirmOutcome(outcome: "confirmed" | "adjustment") {
    if (!task) return;
    setConfirmation(outcome);
    setStage(3);

    const response = await fetch("/api/episodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: task.id,
        productId: product.id,
        customerIntent: message,
        humanOutcome: outcome,
        source: "youcam",
      }),
    });

    if (response.ok) {
      const episode = (await response.json()) as { score: number };
      setEpisodeScore(episode.score);
    }
  }

  function toggleListening() {
    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening((current) => !current);
      window.setTimeout(() => setIsListening(false), 1600);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setMessage(transcript);
    };
    recognition.start();
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="MOONLOOP home">
          <span className="brand-mark">M</span>
          <span>
            <strong>MOONLOOP</strong>
            <small>by LAVIA Robotics</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a className="active" href="#experience">Live Experience</a>
          <a href="#episode">Episode</a>
          <a href="#insight">Manager Insight</a>
        </nav>
        <div className="status-pill"><span /> Demo environment</div>
      </header>

      <section className="hero" id="top">
        <div>
          <p className="eyebrow">HUMAN-CENTERED EXPERIENCE INTELLIGENCE</p>
          <h1>Turn every customer moment into a learning loop.</h1>
          <p className="hero-copy">
            Visual AI supports the conversation. People confirm the outcome. Every interaction
            becomes an explainable episode for better service and better coaching.
          </p>
        </div>
        <div className="loop-visual" aria-label="MOONLOOP workflow">
          <span>PERCEIVE</span><i>→</i><span>CONFIRM</span><i>→</i><span>IMPROVE</span>
        </div>
      </section>

      <section className="progress" aria-label="Experience progress">
        {stageLabels.map((label, index) => (
          <div className={index <= stage ? "progress-step active" : "progress-step"} key={label}>
            <span>{index + 1}</span>
            <p>{label}</p>
          </div>
        ))}
      </section>

      <section className="workspace" id="experience">
        <article className="panel conversation-panel">
          <div className="panel-heading">
            <div>
              <p className="kicker">CUSTOMER MOMENT</p>
              <h2>Understand the intention</h2>
            </div>
            <span className="language-pill">English · US</span>
          </div>
          <div className="customer-profile">
            <div className="avatar">AL</div>
            <div><strong>Demo Customer</strong><p>Returning · Evening appointment</p></div>
          </div>
          <label htmlFor="customer-intent">Customer intent</label>
          <div className="speech-input">
            <textarea
              id="customer-intent"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button
              className={isListening ? "mic listening" : "mic"}
              onClick={toggleListening}
              type="button"
              aria-label="Capture customer intent with voice"
            >
              {isListening ? "●" : "◉"}
            </button>
          </div>
          <div className="intent-tags">
            <span>Travel-ready</span><span>Evening</span><span>Refined</span>
          </div>
          <div className="coach-note">
            <span>AI SUGGESTION</span>
            <p>Reflect the customer’s two use cases before recommending a product.</p>
          </div>
        </article>

        <article className="panel catalog-panel">
          <div className="panel-heading">
            <div>
              <p className="kicker">CURATED SELECTION</p>
              <h2>Choose a product</h2>
            </div>
            <span className="inventory-live"><i /> Inventory live</span>
          </div>
          <div className="product-list">
            {products.map((item) => (
              <button
                className={item.id === product.id ? "product selected" : "product"}
                key={item.id}
                onClick={() => setSelectedProductId(item.id)}
                type="button"
              >
                <span className={`product-art ${item.accent}`}><i /></span>
                <span className="product-copy">
                  <small>{item.category}</small><strong>{item.name}</strong>
                  <em>{item.color}</em><b>{item.inventory}</b>
                </span>
                <span className="check">✓</span>
              </button>
            ))}
          </div>
          <button className="primary-button" onClick={createVisualExperience} type="button">
            Create visual experience <span>→</span>
          </button>
          <p className="consent-line">✓ Demo consent recorded · No customer media is retained</p>
        </article>

        <article className="panel result-panel" id="episode">
          <div className="panel-heading">
            <div>
              <p className="kicker">YOUCAM RUNTIME TOOL</p>
              <h2>Review together</h2>
            </div>
            <span className={`task-status ${taskStatus}`}>{taskStatus}</span>
          </div>

          <div className={`preview ${taskStatus === "completed" ? product.accent : "empty"}`}>
            {taskStatus === "completed" ? (
              <>
                <div className="preview-orbit"><i /></div>
                <p>{product.name}</p>
                <span>Interactive demo preview</span>
              </>
            ) : (
              <>
                <div className="preview-placeholder">M</div>
                <p>{taskStatus === "idle" ? "Select a product to begin" : "Preparing the experience…"}</p>
                <span>Mock mode uses no uploaded image</span>
              </>
            )}
          </div>

          <div className="confirmation-box">
            <p>Does this direction match the customer’s intention?</p>
            <div>
              <button
                disabled={taskStatus !== "completed"}
                className={confirmation === "confirmed" ? "confirm selected" : "confirm"}
                onClick={() => confirmOutcome("confirmed")}
                type="button"
              >
                Yes, confirm
              </button>
              <button
                disabled={taskStatus !== "completed"}
                className={confirmation === "adjustment" ? "adjust selected" : "adjust"}
                onClick={() => confirmOutcome("adjustment")}
                type="button"
              >
                Adjust direction
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="insight-strip" id="insight">
        <div>
          <p className="kicker">EXPLAINABLE EPISODE</p>
          <h2>{episodeScore === null ? "Waiting for human confirmation" : `Episode score · ${episodeScore}`}</h2>
        </div>
        <div className="metric"><span>Intent clarity</span><strong>{episodeScore ? "92" : "—"}</strong></div>
        <div className="metric"><span>Response relevance</span><strong>{episodeScore ? "88" : "—"}</strong></div>
        <div className="metric"><span>Human outcome</span><strong>{confirmation === "confirmed" ? "Confirmed" : confirmation === "adjustment" ? "Adjust" : "—"}</strong></div>
        <div className="policy-lock"><span>◆</span><p><strong>Policy locked</strong>YouCam episode excluded from training</p></div>
      </section>

      <footer>
        <p>MOONLOOP · A LAVIA Robotics prototype</p>
        <p>Human judgment remains in control.</p>
      </footer>
    </main>
  );
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onstart: () => void;
  onend: () => void;
  onresult: (event: { results: ArrayLike<{ 0?: { transcript?: string } }> }) => void;
  start: () => void;
};
