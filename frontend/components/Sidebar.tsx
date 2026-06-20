import Link from "next/link";

const links = [
  ["Dashboard", "/dashboard"],
  ["Customers", "/customers"],
  ["Policies", "/policies"],
  ["Claims", "/claims"],
  ["Conversations", "/conversations"],
  ["Documents", "/documents"],
  ["SMS", "/sms"],
  ["Voice & IVR", "/voice"],
  ["Login", "/login"],
] as const;

export default function Sidebar() {
  return (
    <aside className="w-56 bg-white border-r p-4">
      <nav className="space-y-2">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded px-3 py-2 hover:bg-gray-100">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
