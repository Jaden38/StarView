import { useMemo } from "react";
import { CONSTELLATION_CONNECTIONS, filterStars } from "../utils/threeHelper";

const getStarTemperature = (spect) => {
  if (!spect) return 5000;
  const type = spect[0];
  return (
    {
      O: 30000,
      B: 20000,
      A: 9000,
      F: 7000,
      G: 5500,
      K: 4000,
      M: 3000,
    }[type] || 5000
  );
};

const getValidConstellationStars = () => {
  const validStarIds = new Set();
  Object.values(CONSTELLATION_CONNECTIONS).forEach((connections) => {
    connections.flat().forEach((id) => validStarIds.add(id));
  });
  return validStarIds;
};

const useStarFilter = (
  stars,
  filters,
  activeModes,
  searchQuery,
  constellation
) =>
  useMemo(() => {
    if (!stars?.length) return [];

    let filteredStars = [...stars];

    // **Remove solar system stars**
    if (activeModes.includes("solarSystem")) {
      filteredStars = filteredStars.filter((star) => star.id !== 0);
    }

    // **Handle constellation filtering**
    if (activeModes.includes("constellations")) {
      const validStarIds = getValidConstellationStars();
      filteredStars = filteredStars.filter((star) =>
        validStarIds.has(star.id.toString())
      );

      if (constellation) {
        filteredStars = filteredStars.filter(
          (star) => star.con === constellation
        );
      }
    }
    // **Handle other active modes**
    else if (activeModes.length > 0) {
      const modeStars = activeModes
        .filter((mode) => mode !== "solarSystem")
        .flatMap((mode) => filterStars[mode]?.([...stars]) || []);

      if (modeStars.length > 0) {
        const starIds = new Set();
        filteredStars = modeStars.filter((star) =>
          starIds.has(star.id) ? false : starIds.add(star.id)
        );
      }
    }

    // **Apply numerical filters**
    filteredStars = filteredStars.filter((star) => {
      const temp = getStarTemperature(star.spect);
      const relevantMagnitude =
        filters.magnitudeType === "apparent" ? star.mag : star.absmag;
      return (
        relevantMagnitude <= filters.magnitude &&
        star.dist <= filters.maxDistance &&
        temp >= filters.minTemp
      );
    });

    // **Apply search query**
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredStars = filteredStars.filter(
        (star) =>
          star.proper?.toLowerCase().includes(query) ||
          star.con?.toLowerCase().includes(query)
      );
    }

    return filteredStars;
  }, [stars, filters, activeModes, searchQuery, constellation]);

export default useStarFilter;
