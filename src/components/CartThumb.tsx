import Image from "next/image";
import type { CartLine } from "@/lib/types";
import { IconLeaf } from "./icons";

/** صورة مصغّرة لسطر السلة — تعتمد على اللقطة المخزّنة لا على الكتالوج. */
export default function CartThumb({ line }: { line: CartLine }) {
  if (!line.image) {
    return (
      <div className="grid h-full w-full place-items-center bg-brand-50 text-brand-500">
        <IconLeaf className="h-6 w-6" />
      </div>
    );
  }
  return (
    <Image src={line.image} alt={line.name} fill sizes="80px" className="object-contain p-1" />
  );
}
