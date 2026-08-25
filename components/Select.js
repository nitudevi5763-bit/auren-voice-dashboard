'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function Select({ value, onChange, options, groups, placeholder = 'Select…' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const flatOptions = groups ? groups.flatMap((g) => g.options) : options || [];
  const selected = flatOptions.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input flex items-center justify-between text-left"
      >
        <span className={`truncate ${selected ? 'text-white' : 'text-muted'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={15} className={`shrink-0 text-muted transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 mt-1.5 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-panel2 p-1 shadow-xl shadow-black/50">
          {groups
            ? groups.map((group) => (
                <div key={group.label}>
                  <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted/70">{group.label}</p>
                  {group.options.map((opt) => (
                    <Option key={opt.value} opt={opt} selected={opt.value === value}
                      onSelect={() => { onChange(opt.value); setOpen(false); }} />
                  ))}
                </div>
              ))
            : options.map((opt) => (
                <Option key={opt.value} opt={opt} selected={opt.value === value}
                  onSelect={() => { onChange(opt.value); setOpen(false); }} />
              ))}
        </div>
      )}
    </div>
  );
}

function Option({ opt, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
        selected ? 'bg-accent/10 text-accent' : 'text-white hover:bg-panel'
      }`}
    >
      <span className="truncate">{opt.label}</span>
      {selected && <Check size={14} className="shrink-0" />}
    </button>
  );
}
