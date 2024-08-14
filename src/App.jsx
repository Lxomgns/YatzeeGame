import { useEffect, useState, useRef } from "react";
import "./App.css";
import MainScene from "./MainScene";
import { Scale, Scene } from "phaser";
import { Box } from "@mui/material";

function App() {
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 900,
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
    <div>
      <div id="gameScene" ></div>
    </div>
  );
}

export default App;
