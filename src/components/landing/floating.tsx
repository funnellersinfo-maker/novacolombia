"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CHAT_GREETING, CHAT_SUGGESTIONS, SITE, getBotReply, waLink } from "./data";

type Msg = { id: number; role: "bot" | "user"; text: string };

let nextId = 1;

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1" aria-label="Escribiendo">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([
    { id: nextId++, role: "bot", text: CHAT_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const hasInteracted = useRef(false); // evita el scroll automático al cargar
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!hasInteracted.current) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  function send(text: string) {
    const clean = text.trim().slice(0, 300);
    if (!clean) return;
    hasInteracted.current = true;
    setMessages((m) => [...m, { id: nextId++, role: "user", text: clean }]);
    setInput("");
    setTyping(true);
    timerRef.current = setTimeout(() => {
      setMessages((m) => [...m, { id: nextId++, role: "bot", text: getBotReply(clean) }]);
      setTyping(false);
    }, 700);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(input);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role="dialog"
      aria-label="Asistente virtual de NOVA Colombia"
      className="card-pop fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] right-4 z-50 flex h-[min(28rem,68vh)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl bg-card"
    >
      <div className="flex items-center gap-3 border-b-2 border-ink bg-ink px-4 py-3 text-[#faf3e9]">
        <span className="grid size-9 place-items-center rounded-xl border-2 border-[#faf3e9] bg-primary">
          <Bot className="size-5 text-primary-foreground" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-extrabold leading-tight">Nova · Asistente</p>
          <p className="flex items-center gap-1.5 text-[11px] text-[#faf3e9]/70">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            En línea · respuestas automáticas
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar asistente"
          className="grid size-8 place-items-center rounded-lg text-[#faf3e9]/80 transition-colors hover:bg-white/10 hover:text-[#faf3e9]"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        className="scroll-y min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-secondary/30 p-3"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              m.role === "user"
                ? "ml-auto max-w-[85%] whitespace-pre-line rounded-2xl rounded-tr-md border-2 border-ink bg-primary px-3.5 py-2.5 text-sm font-medium text-primary-foreground"
                : "max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-md border-2 border-ink bg-card px-3.5 py-2.5 text-sm leading-relaxed"
            }
          >
            {m.text}
          </div>
        ))}
        {typing && (
          <div className="max-w-[85%] rounded-2xl rounded-tl-md border-2 border-ink bg-card px-3.5 py-2.5">
            <TypingDots />
          </div>
        )}
      </div>

      <div className="border-t-2 border-ink bg-card p-3">
        <div className="no-scrollbar mb-2.5 flex gap-2 overflow-x-auto" aria-label="Sugerencias">
          {CHAT_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="press-pop shrink-0 rounded-full border-2 border-ink bg-amber px-3 py-1.5 text-xs font-extrabold text-ink shadow-[2px_2px_0_var(--shadow-ink)]"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Escribe tu pregunta
          </label>
          <Input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={300}
            placeholder="Escribe tu pregunta..."
            autoComplete="off"
            className="h-11 border-2 border-input bg-background focus-visible:ring-2"
          />
          <Button
            type="submit"
            aria-label="Enviar mensaje"
            className="h-11 w-11 shrink-0 border-2 border-ink bg-primary p-0 text-primary-foreground shadow-[3px_3px_0_var(--shadow-ink)] hover:bg-primary/90"
          >
            <Send className="size-4" aria-hidden="true" />
          </Button>
        </form>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Para pedidos reales te conectamos con un asesor: {SITE.phone}
        </p>
      </div>
    </motion.div>
  );
}

export function FloatingActions() {
  const [chatOpen, setChatOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <>
      <AnimatePresence>
        {chatOpen && <ChatPanel key="chat" onClose={() => setChatOpen(false)} />}
      </AnimatePresence>

      <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 flex flex-col items-end gap-3">
        <button
          type="button"
          onClick={() => setChatOpen((v) => !v)}
          aria-label={chatOpen ? "Cerrar asistente virtual" : "Abrir asistente virtual"}
          aria-expanded={chatOpen}
          className="press-pop grid size-14 place-items-center rounded-full border-2 border-ink bg-primary text-primary-foreground shadow-[4px_4px_0_var(--shadow-ink)] transition-transform hover:-translate-y-0.5"
        >
          {chatOpen ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <Bot className="size-6" aria-hidden="true" />
          )}
        </button>

        <a
          href={waLink("Hola NOVA Colombia, quiero hacer un pedido.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chatear por WhatsApp con NOVA Colombia"
          className="press-pop relative grid size-14 place-items-center rounded-full border-2 border-ink bg-[#25d366] text-white shadow-[4px_4px_0_var(--shadow-ink)] transition-transform hover:-translate-y-0.5"
        >
          {!reduce && (
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-[#25d366]/40 [animation-duration:2.5s]"
            />
          )}
          <MessageCircle className="relative size-6" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
