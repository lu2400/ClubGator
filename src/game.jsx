import { useEffect, useRef } from "react";
import StartGame from "../my-phaser-game/src/game/main";

export default function GameView() {
  const gameRef = useRef(null);

  useEffect(() => {
    const game = StartGame("game-container");
    gameRef.current = game;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{
      width: "100%",
      display: "flex",
      justifyContent: "center",
      padding: "1rem 0 2rem"
    }}>
      <div
        id="game-container"
        style={{
          width: "100%",
          maxWidth: "1024px",
          aspectRatio: "4 / 3",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
        }}
      />
    </div>
  );
}