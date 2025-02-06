import { useEffect, useState } from "react";
import Papa from "papaparse";

const useStarData = () => {
  const [stars, setStars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isValidStar = (star) => {
    return (
      star.x != null &&
      star.y != null &&
      star.z != null &&
      !isNaN(star.x) &&
      !isNaN(star.y) &&
      !isNaN(star.z)
    );
  };

  const mapStarData = (star) => ({
    ...star,
    x: parseFloat(star.x),
    y: parseFloat(star.y),
    z: parseFloat(star.z),
    mag: parseFloat(star.mag),
    dist: parseFloat(star.dist),
  });

  useEffect(() => {
    const loadStars = async () => {
      try {
        const response = await fetch("/data/stars.csv");
        const text = await response.text();

        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error("CSV parsing errors:", results.errors);
            }

            // Filter out invalid entries and transform data
            const validStars = results.data
              .filter(isValidStar)
              .map(mapStarData);

            console.log("Loaded stars:", validStars.length); // Debug log
            setStars(validStars);
            setLoading(false);
          },
          error: (error) => {
            console.error("CSV parsing error:", error);
            setError("Failed to parse star data");
            setLoading(false);
          },
        });
      } catch (err) {
        console.error("Error loading star data:", err);
        setError("Failed to load star data");
        setLoading(false);
      }
    };

    loadStars();
  }, []);

  return { stars, loading, error };
};

export default useStarData;
