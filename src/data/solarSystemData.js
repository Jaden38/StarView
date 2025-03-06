export const SOLAR_SYSTEM = {
    sun: {
      name: "Sun",
      radius: 696340,
      color: 0xffff00,
      temperature: 5778,
      type: "G2V",
      mass: 1,
      distance: 0,
    },
    planets: [
      {
        name: "Mercury",
        radius: 2440,
        distance: 57.9e6,
        color: 0x8c8c8c,
        temperature: 440,
        mass: 0.055,
        orbitalPeriod: 88,
        moons: 0,
      },
      {
        name: "Venus",
        radius: 6052,
        distance: 108.2e6,
        color: 0xe6b800,
        temperature: 737,
        mass: 0.815,
        orbitalPeriod: 225,
        moons: 0,
      },
      {
        name: "Earth",
        radius: 6371,
        distance: 149.6e6,
        color: 0x0066ff,
        temperature: 288,
        mass: 1,
        orbitalPeriod: 365,
        moons: 1,
      },
      {
        name: "Mars",
        radius: 3390,
        distance: 227.9e6,
        color: 0xff4d4d,
        temperature: 210,
        mass: 0.107,
        orbitalPeriod: 687,
        moons: 2,
      },
      {
        name: "Jupiter",
        radius: 69911,
        distance: 778.5e6,
        color: 0xffad33,
        temperature: 165,
        mass: 317.8,
        orbitalPeriod: 4333,
        moons: 79,
      },
      {
        name: "Saturn",
        radius: 58232,
        distance: 1.434e9,
        color: 0xffcc00,
        temperature: 134,
        mass: 95.2,
        orbitalPeriod: 10759,
        moons: 82,
      },
      {
        name: "Uranus",
        radius: 25362,
        distance: 2.871e9,
        color: 0x00ffff,
        temperature: 76,
        mass: 14.5,
        orbitalPeriod: 30687,
        moons: 27,
      },
      {
        name: "Neptune",
        radius: 24622,
        distance: 4.495e9,
        color: 0x0000ff,
        temperature: 72,
        mass: 17.1,
        orbitalPeriod: 60190,
        moons: 14,
      },
    ],
  };
  
  export const planetTextures = {
    Mercury: "mercury.jpg",
    Venus: "venus_s.jpg",
    Earth: "earth.jpg",
    Mars: "mars.jpg",
    Jupiter: "jupiter.jpg",
    Saturn: "saturn.jpg",
    Uranus: "uranus.jpg",
    Neptune: "neptune.jpg",
  };