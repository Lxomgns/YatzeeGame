import Phaser from "phaser"


class MainScene extends Phaser.Scene {
    preload() {
        this.load.image('dice1', '/img/dice-1.png')
        this.load.image('dice2', '/img/dice-2.png')
        this.load.image('dice3', '/img/dice-3.png')
        this.load.image('dice4', '/img/dice-4.png')
        this.load.image('dice5', '/img/dice-5.png')
        this.load.image('dice6', '/img/dice-6.png')

        this.load.on('complete', () => {
            console.log('All assets loaded');
        })
        
    }

    create() {
        const scale = 0.1;
        this.diceImages = [
            this.add.image(100, 100, 'dice1').setScale(scale),
            this.add.image(200, 100, 'dice2').setScale(scale),
            this.add.image(300, 100, 'dice3').setScale(scale),
            this.add.image(400, 100, 'dice4').setScale(scale),
            this.add.image(500, 100, 'dice5').setScale(scale)
        ]

    }
    rollDice() {
        for (let i = 0; i< 5; i++) {
            const diceValue = Phaser.Math.Between(1,6)
            this.diceImages[i].setTexture(`dice${diceValue}`)
        }
    
    }

    update() {
    }


}
export default MainScene