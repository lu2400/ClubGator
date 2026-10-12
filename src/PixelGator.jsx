
import "./PixelGator.css";
import gator from "./assets/gator.png";

export default function PixelGator() {
  return (
    <div className="pixel-gator">
      <img
        src={gator}
        alt="Gator"
        className="pixel-gator-image"
      />
    </div>
  );
}