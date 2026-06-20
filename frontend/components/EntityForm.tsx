import { FormEvent, useState } from "react";

type Props = {
  onSubmit: (value: string) => void;
  label: string;
};

export default function EntityForm({ onSubmit, label }: Props) {
  const [value, setValue] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <form onSubmit={submit} className="mb-4 flex gap-2">
      <input
        id="entity-input"
        aria-label={label}
        className="rounded border px-3 py-2"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={label}
      />
      <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">
        Add
      </button>
    </form>
  );
}
