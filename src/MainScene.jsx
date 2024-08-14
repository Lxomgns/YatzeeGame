import { red } from "@mui/material/colors";
import Phaser from "phaser";

class MainScene extends Phaser.Scene {
  preload() {
    this.load.image("dice1", "./img/dice-1.png");
    this.load.image("dice2", "./img/dice-2.png");
    this.load.image("dice3", "./img/dice-3.png");
    this.load.image("dice4", "./img/dice-4.png");
    this.load.image("dice5", "./img/dice-5.png");
    this.load.image("dice6", "./img/dice-6.png");

    this.load.on("complete", () => {
      console.log("All assets loaded");
    });
  }

  create() {
    const scale = 0.1;
    this.diceImages = [
      this.add.image(100, 100, "dice1").setScale(scale).setInteractive(),
      this.add.image(200, 100, "dice2").setScale(scale).setInteractive(),
      this.add.image(300, 100, "dice3").setScale(scale).setInteractive(),
      this.add.image(400, 100, "dice4").setScale(scale).setInteractive(),
      this.add.image(500, 100, "dice5").setScale(scale).setInteractive(),
    ];
    
        this.diceValue = [0, 0, 0, 0, 0];
    
        this.isHolded = [false, false, false, false, false];

        this.outlineList = []

    for (let i = 0; i<5; i++) {
      const outline = this.add.graphics()
      outline.lineStyle(2,0xff0000)
      outline.strokeRect(this.diceImages[i].x - this.diceImages[i].displayWidth * 0.5, this.diceImages[i].y - this.diceImages[i].displayHeight * 0.5, this.diceImages[i].displayWidth, this.diceImages[i].displayHeight)
      outline.setVisible(false)
      this.outlineList.push(outline)

      this.diceImages[i].on('pointerdown', () => {
        this.isHolded[i] = !this.isHolded[i]
        
        if (this.isHolded[i]) {
          this.outlineList[i].setVisible(true)
        }
        else {
            this.outlineList[i].setVisible(false)
          }
        })
    }

    this.scoreItems = [
      "Ones",
      "Twos",
      "Threes",
      "Fours",
      "Fives",
      "Sixes",
      "Bonus",
      "Three of a Kind",
      "Four of a Kind",
      "Full House",
      "Small Straight",
      "Large Straight",
      "Chance",
      "Yahtzee",
    ];

    this.scores = {};

    this.isConfirmed = [false, false, false, false, false, false, false, false, false, false, false, false, false, false]

    const heightGap = 50;

    this.scoreItems.forEach((item, index) => {
      this.add.text(100, 200 + heightGap * index, item, {
        fill: "#000000",
        backgroundColor: "#F5DCB7",
        fontSize: "20px",
      });
      const scoreText = this.add.text(300, 200 + heightGap * index, "0", {
        fill: "#000000",
        backgroundColor: "#F5DCB7",
        fontSize: "20px",
      }).setInteractive();
      this.scores[item] = scoreText;
    });

    for (let i=0; i<14; i++) {
        this.scores[this.scoreItems[i]].on('pointerdown', () => {
          if (!this.isConfirmed[i]) {
            this.isConfirmed[i] = !this.isConfirmed[i]
            this.scores[this.scoreItems[i]].setBackgroundColor("#599468")
            this.isHolded = [false, false, false, false, false]
            this.outlineList.forEach(outline => outline.setVisible(false));
            this.leftReroll = 3
            this.rollDice()
            this.leftText.setText(`남은 횟수: ${this.leftReroll}`)
            this.canBonus()
          }
        })
        this.scores[this.scoreItems[i]].on('pointerover', () => {
          this.scores[this.scoreItems[i]].setBackgroundColor('#6c5d53')
        })
                this.scores[this.scoreItems[i]].on('pointerout', () => {
                  if (!this.isConfirmed[i]) {
          this.scores[this.scoreItems[i]].setBackgroundColor('#F5DCB7')
                  }
        })
    }

    

    // const graphics = this.add.graphics();
    // graphics.lineStyle(2, 0x000000, 1);
    // for (let i = 0; i <= this.scoreItems.length; i++) {
    //   graphics.moveTo(100, 200 + i * heightGap);
    //   graphics.lineTo(300, 200 + i * heightGap);
    // }

    // graphics.moveTo(100, 200);
    // graphics.lineTo(100, 200 + heightGap * this.scoreItems.length);
    // graphics.moveTo(300, 200);
    // graphics.lineTo(300, 200 + heightGap * this.scoreItems.length);
    // graphics.moveTo(500, 200);
    // graphics.lineTo(500, 200 + heightGap * this.scoreItems.length);

    // graphics.strokePath();

    this.rerollButton = this.add
      .text(600, 85, "돌리기", {
        backgroundColor: "#4B89DC",
        padding: { x: 10, y: 10 },
      })
      .setInteractive();
    this.rerollButton.on("pointerover", () => {
      this.rerollButton.setShadow(2, 2, "#000", 4, true, true);
    });
    this.rerollButton.on("pointerout", () => {
      this.rerollButton.setShadow(0, 0, "#000", 0, false, false);
    });
    this.rerollButton.on("pointerdown", () => {
      this.rerollButton.setScale(0.9);
    });
    this.rerollButton.on("pointerup", () => {
      this.rerollButton.setScale(1);
      this.rollDice();
    });

    this.leftReroll = 3;

    this.leftText = this.add.text(580, 150, `남은 횟수: ${this.leftReroll}`, {
      fill: "#000",
      padding:{y:3}
    });
  }

  rollDice() {
    if (this.leftReroll != 0) {
    for (let i = 0; i < 5; i++) {
      if (!this.isHolded[i]) {
        const randomDiceValue = Phaser.Math.Between(1, 6);
        this.diceImages[i].setTexture(`dice${randomDiceValue}`);
        this.diceValue[i] = randomDiceValue;
      }
    }
    this.leftReroll -= 1
    this.leftText.setText(`남은 횟수: ${this.leftReroll}`)
    this.discriminant();
  }
}

sameDice() {
    for (let i = 1; i < 7; i++) {
      const sameDiceScore = this.diceValue.filter((dice) => dice === i).length * i;
      if (!this.isConfirmed[i-1]) {
        this.scores[this.scoreItems[i-1]].setText(sameDiceScore)
      }
    }
  }

  canBonus() {
    let sum = 0
    for (let i=0; i<6; i++) {
        if (this.isConfirmed[i]) {
            sum += this.scores[this.scoreItems[i]]
        }
    }
    if (sum>=63) {
        this.scores[this.scoreItems[6]].setText(35)
    }
  }

  isThreeOfAKind() {
        if (!this.isConfirmed[7]) {
      this.scores[this.scoreItems[7]].setText(0)
    }
    for (let i = 1; i < 7; i++) {
        const sameDiceNumber = this.diceValue.filter((dice) => dice === i).length;
        if (!this.isConfirmed[7]) {
        if (sameDiceNumber >= 3) {
          this.scores[this.scoreItems[7]].setText(sameDiceNumber * i)
        }
    }
      }
  }

  isFourOfAKind() {
        if (!this.isConfirmed[8]) {
      this.scores[this.scoreItems[8]].setText(0)
    }
    for (let i = 1; i < 7; i++) {
        const sameDiceNumber = this.diceValue.filter((dice) => dice === i).length;
        if (!this.isConfirmed[8]) {
        if (sameDiceNumber >= 4) {
          this.scores[this.scoreItems[8]].setText(sameDiceNumber * i)
        }
    }
      }
  }

  isFullHouse() {
    let sum = 0
        if (!this.isConfirmed[9]) {
      this.scores[this.scoreItems[9]].setText(0)
    }
    for (let i = 1; i < 7; i++) {
        const sameDiceNumber = this.diceValue.filter((dice) => dice === i).length;
        if (!this.isConfirmed[9]) {
        if (sameDiceNumber === 3) {
            const leftTwo = this.diceValue.filter((dice) => dice != this.diceValue[i])
            if (leftTwo[0] === leftTwo[1]) {
                for (let j = 0; j<6; j++) {
                    sum += this.diceValue[j]
                }
                this.scores[this.scoreItems[9]].setText(sum)
            }
    
        }
    }
      }
  }

  isSmallStraight() {
    let a = [1, 2, 3, 4];
    let b = [2, 3, 4, 5];
    let c = [3, 4, 5, 6];
    if (!this.isConfirmed[10]) {
      this.scores[this.scoreItems[10]].setText(0)
    }
    if (
      a.every((item) => this.diceValue.includes(item)) ||
      b.every((item) => this.diceValue.includes(item)) ||
      c.every((item) => this.diceValue.includes(item))
    ) {
      if (!this.isConfirmed[10]) {
        this.scores[this.scoreItems[10]].setText('30')
      }
    }
  }

  isLargeStraight() {
    let a = [1, 2, 3, 4, 5];
    let b = [2, 3, 4, 5, 6];
        if (!this.isConfirmed[11]) {
      this.scores[this.scoreItems[11]].setText(0)
    }
    if (
      a.every((item) => this.diceValue.includes(item)) ||
      b.every((item) => this.diceValue.includes(item))
    ) {
      if (!this.isConfirmed[11]) {
        this.scores[this.scoreItems[11]].setText('40')
      }
    }
  }

  chanceValue() {
    let sum = 0
    for (let i=0; i<5; i++) {
        sum += this.diceValue[i]
    }
    if (!this.isConfirmed[12]) {
    this.scores[this.scoreItems[12]].setText(sum)
    }
  }

  isYatzee() {
        if (!this.isConfirmed[13]) {
      this.scores[this.scoreItems[13]].setText(0)
    }
    if (
      this.diceValue.every((item) => item === this.diceValue[0])
    ) {
      if (!this.isConfirmed[13]) {
        this.scores[this.scoreItems[13]].setText(50)
      }
    }
  }

  discriminant() {
    this.sameDice()
    this.isThreeOfAKind()
    this.isFourOfAKind()
    this.isFullHouse()
    this.isSmallStraight()
    this.isLargeStraight()
    this.chanceValue()
    this.isYatzee()
  }

  update() {}
}
export default MainScene;
