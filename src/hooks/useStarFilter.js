import { useMemo } from "react";
import { filterStars } from "../utils/threeHelper";
import { CONSTELLATION_CONNECTIONS } from "../data/constellationData";

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

const getValidConstellationStars = (constellation = null) => {
  const validHips = new Set();

  if (constellation) {
    const connections = CONSTELLATION_CONNECTIONS[constellation];
    if (connections) {
      connections.forEach(([hip1, hip2]) => {
        validHips.add(hip1);
        validHips.add(hip2);
      });
    }
  } else {
    Object.values(CONSTELLATION_CONNECTIONS).forEach((connections) => {
      connections.forEach(([hip1, hip2]) => {
        validHips.add(hip1);
        validHips.add(hip2);
      });
    });
  }

  return validHips;
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

    filteredStars = filteredStars.filter((star) => star.id !== 0);

    if (activeModes.includes("constellations")) {
      const validHips = getValidConstellationStars(constellation);
      filteredStars = filteredStars.filter((star) => {
        if (!star.hip) return false;
        return validHips.has(parseInt(star.hip));
      });

      if (constellation) {
        filteredStars = filteredStars.filter(
          (star) => star.con === constellation
        );
      }
    } else if (activeModes.some((mode) => mode !== "solarSystem")) {
      const modesWithoutSolarSystem = activeModes.filter(
        (mode) => mode !== "solarSystem"
      );

      if (modesWithoutSolarSystem.length > 0) {
        const modeStars = modesWithoutSolarSystem.flatMap(
          (mode) => filterStars[mode]?.([...stars]) || []
        );

        if (modeStars.length > 0) {
          const uniqueStarIds = new Set();
          filteredStars = modeStars.filter((star) => {
            if (uniqueStarIds.has(star.id)) return false;
            uniqueStarIds.add(star.id);
            return true;
          });
        }
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
          star.proper?.toLowerCase().includes(query) ||
          star.con?.toLowerCase().includes(query)
      );
    }

    return filteredStars;
  }, [stars, filters, activeModes, searchQuery, constellation]);

export default useStarFilter;
