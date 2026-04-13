import { Spot, SpotFilters } from "@/lib/types";

export const defaultSpotFilters: SpotFilters = {
  campusArea: "all",
  bestTime: "all",
  keyword: ""
};

export function filterSpots(spots: Spot[], filters: SpotFilters) {
  const keyword = filters.keyword.trim().toLowerCase();

  return spots.filter((spot) => {
    const matchesCampusArea = filters.campusArea === "all" || spot.campusArea === filters.campusArea;
    const matchesBestTime = filters.bestTime === "all" || normalizeBestTimeBucket(spot.bestTime) === filters.bestTime;
    const matchesKeyword =
      !keyword ||
      spot.name.toLowerCase().includes(keyword) ||
      spot.description.toLowerCase().includes(keyword) ||
      spot.campusArea.toLowerCase().includes(keyword);

    return matchesCampusArea && matchesBestTime && matchesKeyword;
  });
}

export function getCampusAreaOptions(spots: Spot[]) {
  return Array.from(new Set(spots.map((spot) => spot.campusArea))).sort();
}

export function getBestTimeOptions(spots: Spot[]) {
  return Array.from(new Set(spots.map((spot) => normalizeBestTimeBucket(spot.bestTime)))).sort();
}

function normalizeBestTimeBucket(value: string) {
  const lowerValue = value.toLowerCase();

  if (lowerValue.includes("06") || lowerValue.includes("07") || lowerValue.includes("08") || lowerValue.includes("09") || lowerValue.includes("10") || lowerValue.includes("11")) {
    return "Morning";
  }

  if (lowerValue.includes("12") || lowerValue.includes("13") || lowerValue.includes("14") || lowerValue.includes("15")) {
    return "Afternoon";
  }

  if (lowerValue.includes("16") || lowerValue.includes("17") || lowerValue.includes("18") || lowerValue.includes("19")) {
    return "Golden Hour";
  }

  return "Flexible";
}
