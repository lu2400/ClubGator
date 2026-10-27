import { Scene } from 'phaser';
import { getLandmarks } from "../../services/landmarkService";
export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }
    async create ()
    {
        this.cameras.main.setBackgroundColor(0x1e293b);
        this.add.text(30, 25, 'ClubGator Map', {
            fontFamily: 'Arial',
            fontSize: 24,
            color: '#f97316',
            fontStyle: 'bold'
        });
        const infoText = this.add.text(512, 720, 'Click any landmark marker to inspect campus details', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#cbd5e1',
            backgroundColor: '#0f172a',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);
        try {
            const landmarks = await getLandmarks();
            landmarks.forEach((place) => {
                const marker = this.add.circle(place.x, place.y, 14, 0xf97316);
                marker.setStrokeStyle(3, 0xffffff);
                marker.setInteractive({ useHandCursor: true });
                this.add.text(place.x, place.y + 18, place.name, {
                    fontFamily: 'Arial',
                    fontSize: 12,
                    color: '#ffffff',
                    backgroundColor: '#000000aa',
                    padding: { x: 4, y: 2 }
                }).setOrigin(0.5, 0);

                marker.on('pointerover', () => {
                    marker.setScale(1.3);
                    marker.setFillStyle(0x38bdf8);
                });

                marker.on('pointerout', () => {
                    marker.setScale(1.0);
                    marker.setFillStyle(0xf97316);
                });

                marker.on('pointerdown', () => {
                    infoText.setText(`[${place.id}] ${place.name}: ${place.description}`);
                    infoText.setStyle({ color: '#fde047' });
                });
            });
        } catch (error) {
            console.error("Failed to load landmarks into Phaser scene:", error);
        }
    }
}