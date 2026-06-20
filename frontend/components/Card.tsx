import type { PropsWithChildren } from "react";

export default function Card({ children }: PropsWithChildren) {
  return <section className="rounded border bg-white p-4 shadow-sm">{children}</section>;
}
