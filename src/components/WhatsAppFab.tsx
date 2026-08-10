import { site } from "@/lib/site";
import { IconWhatsApp } from "./icons";

export default function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("مرحباً، أرغب في الاستفسار عن منتجات أجروميد")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105"
    >
      <IconWhatsApp className="h-7 w-7" />
    </a>
  );
}
