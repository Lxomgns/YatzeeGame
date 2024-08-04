import { useEffect, useState, useRef } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import MainScene from "./MainScene";
import { Scale, Scene } from "phaser";
import UI from "./UI";
import { Box } from "@mui/material";

function App() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 800,
      scene: MainScene,
      parent: "gameScene",
      backgroundColor: "#8ED173",
      scale: {
        mode: Phaser.Scale.NONE,
        // mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);
    window.PhaserGame = gameRef.current;

    const resumeAudioContext = () => {
      if (
        Phaser.Sound.WebAudioSound &&
        Phaser.Sound.WebAudioSound.context
      ) {
        Phaser.Sound.WebAudioSound.context.resume();
      }
      document.addEventListener("click", resumeAudioContext);
      document.addEventListener("touchstart", resumeAudioContext);

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
        }
        document.removeEventListener("click", resumeAudioContext);
        document.removeEventListener("touchstart", resumeAudioContext);
      };
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "200vh",
        width: "100vw",
        overflow: "hidden"
      }}
    >
      <div id="gameScene" style={{ position: "absolute", top: 0, left: "30%" }}></div>
      <div style={{}}>
      <UI/>
      </div>
    </div>
  );
}

export default App;
