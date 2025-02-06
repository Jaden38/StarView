import { useMemo } from "react";
import { CONSTELLATION_CONNECTIONS, filterStars } from "../utils/threeHelper";

const getStarTemperature = (spect) => {
  if (!spect) return 5000;
  const type = spect[0];
  const temps = {
    O: 30000,
    B: 20000,
    A: 9000,
    F: 7000,
    G: 5500,
    K: 4000,
    M: 3000,
  };
  return temps[type] || 5000;
};

const useStarFilter = (
  stars,
  filters,
  activeModes,
  searchQuery,
  constellation
) => {
  return useMemo(() => {
    if (!stars?.length) return [];

    let filteredStars = [...stars];

    if (activeModes.includes("solarSystem")) {
      filteredStars = filteredStars.filter((star) => star.id !== 0);
    }

    if (activeModes.includes("constellations")) {
      const validStarIds = new Set();
      Object.values(CONSTELLATION_CONNECTIONS).forEach((connections) => {
        connections.forEach((connection) => {
          connection.forEach((id) => validStarIds.add(id));
        });
      });

      filteredStars = filteredStars.filter((star) =>
        validStarIds.has(star.id.toString())
      );

      if (constellation) {
        filteredStars = filteredStars.filter(
          (star) => star.con === constellation
        );
      }
    } else if (activeModes.length > 0) {
      const modeStars = activeModes
        .filter((mode) => mode !== "solarSystem")
        .map((mode) => filterStars[mode]([...stars]));

      if (modeStars.length > 0) {
        const starIds = new Set();
        filteredStars = modeStars.flat().filter((star) => {
          if (starIds.has(star.id)) return false;
          starIds.add(star.id);
          return true;
        });
      }
    }

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

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredStars = filteredStars.filter(
        (star) =>
          (star.proper && star.proper.toLowerCase().includes(query)) ||
          (star.con && star.con.toLowerCase().includes(query))
      );
    }

    return filteredStars;
  }, [stars, filters, activeModes, searchQuery, constellation]);
};

export default useStarFilter;
