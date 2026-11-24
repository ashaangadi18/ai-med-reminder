import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { chatApi } from "../entities/medicineApi";

const INTRO_MESSAGE = {
  role: "assistant",
  content:
    "Hi, I'm your MediMind assistant. Ask me about your medicine schedule, general medicine facts, or how to use the app. I'm not a doctor, so for anything urgent please contact one.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INTRO_MESSAGE]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      // Only send plain role/content history (drop the static intro message).
      const history = nextMessages.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const { reply } = await chatApi.send(trimmed, history.slice(0, -1));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't reach the assistant just now. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 w-[22rem] max-w-[90vw] h-[28rem] bg-white rounded-xl2 shadow-soft border border-teal-100 flex flex-col overflow-hidden z-40 animate-fadeUp">
          <div className="bg-teal-500 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} />
              <span className="font-medium text-sm">MediMind Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-paper">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] text-sm px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                  m.role === "user"
                    ? "bg-teal-500 text-white self-end rounded-br-sm"
                    : "bg-white text-ink border border-teal-50 self-start rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div className="self-start bg-white border border-teal-50 text-muted text-sm px-3.5 py-2.5 rounded-2xl rounded-bl-sm">
                Thinking…
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-teal-50 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your medicines…"
              className="flex-1 input-field py-2 text-sm"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-10 h-10 shrink-0 rounded-full bg-teal-500 text-white flex items-center justify-center disabled:opacity-50 hover:bg-teal-600 transition-colors"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-teal-500 text-white shadow-soft flex items-center justify-center hover:bg-teal-600 transition-all hover:-translate-y-0.5 z-40"
        aria-label="Toggle assistant chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}
