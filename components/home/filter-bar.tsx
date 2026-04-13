"use client";

import { SpotFilters } from "@/lib/types";

type FilterBarProps = {
  filters: SpotFilters;
  campusAreas: string[];
  bestTimes: string[];
  onChange: (filters: SpotFilters) => void;
  onReset: () => void;
};

export function FilterBar({ filters, campusAreas, bestTimes, onChange, onReset }: FilterBarProps) {
  return (
    <div className="grid gap-4 rounded-[28px] border border-ink/10 bg-white/90 p-5 shadow-soft md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
      <label className="space-y-2 text-sm font-medium text-ink">
        Search spots
        <input
          value={filters.keyword}
          onChange={(event) => onChange({ ...filters, keyword: event.target.value })}
          placeholder="Search by name or campus area"
          className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
        />
      </label>
      <label className="space-y-2 text-sm font-medium text-ink">
        Campus area
        <select
          value={filters.campusArea}
          onChange={(event) => onChange({ ...filters, campusArea: event.target.value })}
          className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
        >
          <option value="all">All areas</option>
          {campusAreas.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm font-medium text-ink">
        Best time
        <select
          value={filters.bestTime}
          onChange={(event) => onChange({ ...filters, bestTime: event.target.value })}
          className="w-full rounded-2xl border border-ink/10 bg-mist px-4 py-3 outline-none transition focus:border-moss"
        >
          <option value="all">All times</option>
          {bestTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={onReset}
        className="self-end rounded-full border border-ink/10 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-moss/35"
      >
        Reset filters
      </button>
    </div>
  );
}
