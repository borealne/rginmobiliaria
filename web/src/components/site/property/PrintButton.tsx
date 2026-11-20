"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="h-11 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px]">download</span>
      Guardar como PDF
    </button>
  );
}
