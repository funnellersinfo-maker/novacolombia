"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SITE, waLink } from "./data";

type Errors = { nombre?: string; telefono?: string; email?: string };

export function Contact() {
  const reduce = useReducedMotion();
  const [values, setValues] = useState({ nombre: "", telefono: "", email: "", ciudad: "", mensaje: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (values.nombre.trim().length < 2) {
      e.nombre = "Escribe tu nombre (mínimo 2 caracteres).";
    }
    const digits = values.telefono.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      e.telefono = "Escribe un teléfono válido (entre 7 y 15 dígitos).";
    }
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      e.email = "Ese correo no parece válido. Revísalo o déjalo vacío.";
    }
    return e;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const lines = [
      "Hola NOVA Colombia, quiero hacer una consulta:",
      "",
      `Nombre: ${values.nombre.trim()}`,
      `Teléfono: ${values.telefono.trim()}`,
    ];
    if (values.ciudad.trim()) lines.push(`Ciudad: ${values.ciudad.trim()}`);
    if (values.email.trim()) lines.push(`Correo: ${values.email.trim()}`);
    lines.push("");
    if (values.mensaje.trim()) lines.push(values.mensaje.trim());

    window.open(waLink(lines.join("\n")), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  const set = (field: keyof typeof values) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  return (
    <section id="contacto" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:gap-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="sticker">Hablamos claro</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            ¿Hablamos de tu pedido?
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Cuéntanos qué buscas y un asesor humano te responde con disponibilidad,
            precios y la mejor opción de envío para tu ciudad.
          </p>

          <address className="card-pop mt-8 flex flex-col gap-4 rounded-2xl bg-card p-6 not-italic">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-secondary">
                <Phone className="size-5 text-primary" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Teléfono</p>
                <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="font-bold hover:text-primary">
                  {SITE.phone}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-secondary">
                <Mail className="size-5 text-primary" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Correo</p>
                <a href={`mailto:${SITE.email}`} className="break-all font-bold hover:text-primary">
                  {SITE.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-secondary">
                <MapPin className="size-5 text-primary" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Dirección</p>
                <p className="font-bold">{SITE.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-secondary">
                <Clock className="size-5 text-primary" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Horario</p>
                <p className="whitespace-pre-line font-bold">{SITE.hours}</p>
              </div>
            </div>
          </address>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="card-pop rounded-2xl bg-card p-6 sm:p-8">
            {sent ? (
              <div className="flex min-h-96 flex-col items-center justify-center gap-4 text-center" role="status">
                <span className="grid size-16 place-items-center rounded-full border-2 border-ink bg-success/10">
                  <CheckCircle2 className="size-9 text-success" aria-hidden="true" />
                </span>
                <h3 className="font-display text-2xl font-extrabold">¡Listo! Abrimos WhatsApp</h3>
                <p className="max-w-sm text-sm text-muted-foreground sm:text-base">
                  Tu mensaje quedó redactado con tus datos. Si no se abrió la ventana,
                  revisa el navegador o escríbenos directo al {SITE.phone}.
                </p>
                <Button
                  variant="outline"
                  className="border-2 border-ink"
                  onClick={() => {
                    setSent(false);
                    setValues({ nombre: "", telefono: "", email: "", ciudad: "", mensaje: "" });
                  }}
                >
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <h3 className="font-display text-2xl font-extrabold">Escríbenos</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Completa el formulario y te llevamos directo a WhatsApp con todo redactado.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="nombre">Nombre completo *</Label>
                    <Input
                      id="nombre"
                      name="nombre"
                      type="text"
                      autoComplete="name"
                      placeholder="María Gómez"
                      value={values.nombre}
                      onChange={set("nombre")}
                      aria-invalid={!!errors.nombre}
                      aria-describedby={errors.nombre ? "error-nombre" : undefined}
                      className="h-11 border-2 border-input bg-background focus-visible:ring-2"
                    />
                    {errors.nombre && (
                      <p id="error-nombre" className="text-xs font-semibold text-destructive">
                        {errors.nombre}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="telefono">Celular / Teléfono *</Label>
                    <Input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="300 123 4567"
                      value={values.telefono}
                      onChange={set("telefono")}
                      aria-invalid={!!errors.telefono}
                      aria-describedby={errors.telefono ? "error-telefono" : undefined}
                      className="h-11 border-2 border-input bg-background focus-visible:ring-2"
                    />
                    {errors.telefono && (
                      <p id="error-telefono" className="text-xs font-semibold text-destructive">
                        {errors.telefono}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Correo electrónico (opcional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="maria@correo.com"
                      value={values.email}
                      onChange={set("email")}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "error-email" : undefined}
                      className="h-11 border-2 border-input bg-background focus-visible:ring-2"
                    />
                    {errors.email && (
                      <p id="error-email" className="text-xs font-semibold text-destructive">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ciudad">Ciudad (opcional)</Label>
                    <Input
                      id="ciudad"
                      name="ciudad"
                      type="text"
                      placeholder="Medellín"
                      value={values.ciudad}
                      onChange={set("ciudad")}
                      className="h-11 border-2 border-input bg-background focus-visible:ring-2"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="mensaje">Mensaje (opcional)</Label>
                    <Textarea
                      id="mensaje"
                      name="mensaje"
                      rows={4}
                      placeholder="Cuéntanos qué producto buscas, para cuándo lo necesitas o la duda que tengas."
                      value={values.mensaje}
                      onChange={set("mensaje")}
                      className="resize-none border-2 border-input bg-background focus-visible:ring-2"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-6 h-12 w-full border-2 border-ink bg-success text-base font-extrabold text-success-foreground shadow-[4px_4px_0_var(--shadow-ink)] hover:bg-success/90"
                >
                  <Send className="size-5" aria-hidden="true" />
                  Enviar por WhatsApp
                </Button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  ¿No usas WhatsApp?{" "}
                  <a
                    className="font-bold text-primary underline underline-offset-2 hover:no-underline"
                    href={`mailto:${SITE.email}?subject=${encodeURIComponent("Consulta desde la web NOVA Colombia")}`}
                  >
                    Escríbenos por correo
                  </a>{" "}
                  y te respondemos a la brevedad.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl px-4">
        <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
          <MessageCircle className="size-3.5" aria-hidden="true" />
          Responde un asesor humano en horario de atención. Tus datos solo se usan para
          responder tu consulta.
        </p>
      </div>
    </section>
  );
}
