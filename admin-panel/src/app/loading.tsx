export default function Loading() {
  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-150">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-2xl border-2 border-slate-200 border-t-emerald-500 animate-spin" />
        <span className="absolute text-[10px] font-black tracking-wider text-slate-700">
          IT
        </span>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
          Loading Workspace
        </p>
        <p className="text-[11px] text-slate-400">
          Preparing Ikisaki Tours admin module...
        </p>
      </div>
    </div>
  );
}
