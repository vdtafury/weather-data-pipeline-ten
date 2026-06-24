import { useEffect, useState } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { tsParticles } from "@tsparticles/engine";

export default function DynamicBackground({ temp = 25, humidity = 50 }) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    loadSlim(tsParticles).then(() => {
      setInit(true);
    });
  }, []);

  const isHot = temp >= 32;
  const isHumid = humidity > 60 && temp < 30;
  
  const particleColor = isHot ? "#d4af37" : (isHumid ? "#4a90e2" : "#ffffff");
  const particleCount = isHot ? 80 : (isHumid ? 100 : 30);
  const particleSpeed = isHot ? 1.5 : (isHumid ? 0.5 : 0.8);
  const particleDirection = isHumid ? "bottom" : "none";

  const options = {
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: particleColor,
      },
      links: {
        enable: false,
      },
      move: {
        direction: particleDirection,
        enable: true,
        outModes: {
          default: "out",
        },
        random: true,
        speed: particleSpeed,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: particleCount,
      },
      opacity: {
        value: { min: 0.1, max: 0.5 },
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    detectRetina: true,
  };

  if (init) {
    return (
      <Particles
        id="tsparticles"
        options={options}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      />
    );
  }

  return null;
}
