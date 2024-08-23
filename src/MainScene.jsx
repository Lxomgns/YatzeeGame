import Phaser from "phaser";
import Peer from "peerjs";

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
    this.peer = new Peer();
    this.peer.on("open", (id) => {
      console.log("My ID:" + id);
      const code = document.createElement("p");
      code.textContent = "코드:" + id;
      code.style.textAlign = "center";
      document.body.appendChild(code);
    });

    this.peer.on("connection", (conn) => {
      this.conn = conn;
      this.player = "P1";
      this.setupConnection(conn);
    });

    this.add.text(10, 10, "코드 입력:", {
      fill: "black",
      backgroundColor: "white",
      padding: 5,
    });

    const codeInput = document.createElement("input");
    codeInput.type = "text";
    codeInput.id = "code-input";
    codeInput.style.position = "absolute";
    codeInput.style.top = "40px";
    codeInput.style.left = "100px";
    document.body.appendChild(codeInput);

    const connectButton = this.add
      .text(300, 10, "연결", {
        fill: "green",
        backgroundColor: "white",
        padding: 5,
      })
      .setInteractive();
    connectButton.on("pointerdown", () => {
      const hostId = document.getElementById("code-input").value;
      this.conn = this.peer.connect(hostId);
      this.player = "P2";
      this.setupConnection(this.conn);
    });

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
    this.outlineList = [];
    this.currentTurn = "P1";

    this.turnText = this.add.text(300, 50, "P1의 턴", {
      fill: "#000",
      fontSize: "20px",
      padding: 5,
    });

    for (let i = 0; i < 5; i++) {
      const outline = this.add.graphics();
      outline.lineStyle(2, 0xff0000);
      outline.strokeRect(
        this.diceImages[i].x - this.diceImages[i].displayWidth * 0.5,
        this.diceImages[i].y - this.diceImages[i].displayHeight * 0.5,
        this.diceImages[i].displayWidth,
        this.diceImages[i].displayHeight
      );
      outline.setVisible(false);
      this.outlineList.push(outline);

      this.diceImages[i].on("pointerdown", () => {
        if (this.currentTurn === this.player) {
          this.isHolded[i] = !this.isHolded[i];
          this.outlineList[i].setVisible(this.isHolded[i]);
          this.sendGameState();
        }
      });
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

    this.scoresP1 = {};
    this.scoresP2 = {};
    this.isConfirmedP1 = Array(this.scoreItems.length).fill(false);
    this.isConfirmedP2 = Array(this.scoreItems.length).fill(false);

    const heightGap = 50;

    this.add.text(250, 150, "P1 점수", {
      fill: "#000",
      fontSize: "20px",
      padding: 5,
    });
    this.add.text(450, 150, "P2 점수", {
      fill: "#000",
      fontSize: "20px",
      padding: 5,
    });

    this.scoreItems.forEach((item, index) => {
      this.add.text(100, 200 + heightGap * index, item, {
        fill: "#000000",
        backgroundColor: "#F5DCB7",
        fontSize: "20px",
      });

      const scoreTextP1 = this.add
        .text(300, 200 + heightGap * index, "0", {
          fill: "#000000",
          backgroundColor: "#F5DCB7",
          fontSize: "20px",
        })
        .setInteractive();
      this.scoresP1[item] = scoreTextP1;

      const scoreTextP2 = this.add
        .text(500, 200 + heightGap * index, "0", {
          fill: "#000000",
          backgroundColor: "#F5DCB7",
          fontSize: "20px",
        })
        .setInteractive();
      this.scoresP2[item] = scoreTextP2;

      scoreTextP1.on("pointerdown", () => {
        if (
          !this.isConfirmedP1[index] &&
          this.currentTurn === this.player &&
          this.currentTurn === "P1"
        ) {
          this.isConfirmedP1[index] = true;
          this.scoresP1[item].setBackgroundColor("#599468");
          this.isHolded.fill(false);
          this.outlineList.forEach((outline) => outline.setVisible(false));
          this.leftReroll = 3;
          this.rollDice();
          this.leftText.setText(`남은 횟수: ${this.leftReroll}`);
          this.canBonus();
          this.endTurn();
        }
      });

      scoreTextP1.on("pointerover", () => {
        if (!this.isConfirmedP1[index] && this.currentTurn === "P1") {
          this.scoresP1[item].setBackgroundColor("#6c5d53");
        }
      });

      scoreTextP1.on("pointerout", () => {
        if (!this.isConfirmedP1[index]) {
          this.scoresP1[item].setBackgroundColor("#F5DCB7");
        }
      });

      scoreTextP2.on("pointerdown", () => {
        if (
          !this.isConfirmedP2[index] &&
          this.currentTurn === this.player &&
          this.currentTurn === "P2"
        ) {
          this.isConfirmedP2[index] = true;
          this.scoresP2[item].setBackgroundColor("#599468");
          this.isHolded.fill(false);
          this.outlineList.forEach((outline) => outline.setVisible(false));
          this.leftReroll = 3;
          this.rollDice();
          this.leftText.setText(`남은 횟수: ${this.leftReroll}`);
          this.canBonus();
          this.endTurn();
        }
      });

      scoreTextP2.on("pointerover", () => {
        if (
          !this.isConfirmedP2[index] &&
          this.currentTurn === "P2" &&
          this.currentTurn === this.player
        ) {
          this.scoresP2[item].setBackgroundColor("#6c5d53");
        }
      });

      scoreTextP2.on("pointerout", () => {
        if (!this.isConfirmedP2[index]) {
          this.scoresP2[item].setBackgroundColor("#F5DCB7");
        }
      });
    });

    this.rerollButton = this.add
      .text(600, 85, "돌리기", {
        backgroundColor: "#4B89DC",
        padding: { x: 10, y: 10 },
      })
      .setInteractive();

    this.rerollButton.on("pointerover", () => {
      if (this.currentTurn === this.player) {
        this.rerollButton.setShadow(2, 2, "#000", 4, true, true);
      }
    });

    this.rerollButton.on("pointerout", () => {
      if (this.currentTurn === this.player) {
        this.rerollButton.setShadow(0, 0, "#000", 0, false, false);
      }
    });

    this.rerollButton.on("pointerdown", () => {
      if (this.currentTurn === this.player) {
        this.rerollButton.setScale(0.9);
      }
    });

    this.rerollButton.on("pointerup", () => {
      if (this.currentTurn === this.player) {
        this.rerollButton.setScale(1);
        this.rollDice();
      }
    });

    this.leftReroll = 3;
    this.leftText = this.add.text(580, 150, `남은 횟수: ${this.leftReroll}`, {
      fill: "#000",
      padding: { y: 3 },
    });
  }

  setupConnection(conn) {
    conn.on("open", () => {
      console.log("Connected to: " + conn.peer);
    });

    conn.on("data", (data) => {
      console.log(data);
      this.receiveGameState(data);
    });
  }

  sendGameState() {
    if (this.conn && this.conn.open) {
      const gameState = {
        diceValue: this.diceValue,
        isHolded: this.isHolded,
        leftReroll: this.leftReroll,
        scoresP1: Object.fromEntries(
          Object.entries(this.scoresP1).map(([key, textObj]) => [
            key,
            textObj.text,
          ])
        ),
        scoresP2: Object.fromEntries(
          Object.entries(this.scoresP2).map(([key, textObj]) => [
            key,
            textObj.text,
          ])
        ),
        isConfirmedP1: this.isConfirmedP1,
        isConfirmedP2: this.isConfirmedP2,
        currentTurn: this.currentTurn,
      };
      this.conn.send(gameState);
    }
  }

  receiveGameState(data) {
    this.diceValue = data.diceValue;
    this.isHolded = data.isHolded;
    this.leftReroll = data.leftReroll;

    Object.entries(data.scoresP1).forEach(([key, value]) => {
      this.scoresP1[key].setText(value);
    });

    Object.entries(data.scoresP2).forEach(([key, value]) => {
      this.scoresP2[key].setText(value);
    });

    this.isConfirmedP1 = data.isConfirmedP1;
    this.isConfirmedP2 = data.isConfirmedP2;
    this.currentTurn = data.currentTurn;

    this.updateTurnText();
    this.updateGameState();
  }

  updateTurnText() {
    this.turnText.setText(this.currentTurn === "P1" ? "P1의 턴" : "P2의 턴");
  }

  updateGameState() {
    for (let i = 0; i < 5; i++) {
      this.diceImages[i].setTexture(`dice${this.diceValue[i]}`);
      this.outlineList[i].setVisible(this.isHolded[i]);
    }
    this.leftText.setText(`남은 횟수: ${this.leftReroll}`);
  }

  rollDice() {
    if (this.leftReroll > 0) {
      for (let i = 0; i < 5; i++) {
        if (!this.isHolded[i]) {
          const randomDiceValue = Phaser.Math.Between(1, 6);
          this.diceImages[i].setTexture(`dice${randomDiceValue}`);
          this.diceValue[i] = randomDiceValue;
        }
      }
      this.leftReroll -= 1;
      this.leftText.setText(`남은 횟수: ${this.leftReroll}`);
      this.discriminant();
      this.sendGameState();
    }
  }

  endTurn() {
    this.currentTurn = this.currentTurn === "P1" ? "P2" : "P1";
    this.updateTurnText();
    this.sendGameState();
  }

  sameDice() {
    for (let i = 1; i < 7; i++) {
      const sameDiceScore =
        this.diceValue.filter((dice) => dice === i).length * i;
      if (!this.isConfirmedP1[i - 1]) {
        this.scoresP1[this.scoreItems[i - 1]].setText(sameDiceScore);
      }
      if (!this.isConfirmedP2[i - 1]) {
        this.scoresP2[this.scoreItems[i - 1]].setText(sameDiceScore);
      }
    }
  }

  canBonus() {
    let sumP1 = 0;
    let sumP2 = 0;

    for (let i = 0; i < 6; i++) {
      if (this.isConfirmedP1[i]) {
        sumP1 += parseInt(this.scoresP1[this.scoreItems[i]].text);
      }
      if (this.isConfirmedP2[i]) {
        sumP2 += parseInt(this.scoresP2[this.scoreItems[i]].text);
      }
    }

    if (sumP1 >= 63) {
      this.scoresP1[this.scoreItems[6]].setText(35);
    }

    if (sumP2 >= 63) {
      this.scoresP2[this.scoreItems[6]].setText(35);
    }
  }

  isThreeOfAKind() {
    if (!this.isConfirmedP1[7]) {
      this.scoresP1[this.scoreItems[7]].setText(0);
    }
    if (!this.isConfirmedP2[7]) {
      this.scoresP2[this.scoreItems[7]].setText(0);
    }

    for (let i = 1; i < 7; i++) {
      const sameDiceNumber = this.diceValue.filter((dice) => dice === i).length;
      if (sameDiceNumber >= 3) {
        if (!this.isConfirmedP1[7]) {
          this.scoresP1[this.scoreItems[7]].setText(
            this.diceValue.reduce((a, b) => a + b, 0)
          );
        }
        if (!this.isConfirmedP2[7]) {
          this.scoresP2[this.scoreItems[7]].setText(
            this.diceValue.reduce((a, b) => a + b, 0)
          );
        }
        break;
      }
    }
  }

  isFourOfAKind() {
    if (!this.isConfirmedP1[8]) {
      this.scoresP1[this.scoreItems[8]].setText(0);
    }
    if (!this.isConfirmedP2[8]) {
      this.scoresP2[this.scoreItems[8]].setText(0);
    }

    for (let i = 1; i < 7; i++) {
      const sameDiceNumber = this.diceValue.filter((dice) => dice === i).length;
      if (sameDiceNumber >= 4) {
        if (!this.isConfirmedP1[8]) {
          this.scoresP1[this.scoreItems[8]].setText(
            this.diceValue.reduce((a, b) => a + b, 0)
          );
        }
        if (!this.isConfirmedP2[8]) {
          this.scoresP2[this.scoreItems[8]].setText(
            this.diceValue.reduce((a, b) => a + b, 0)
          );
        }
        break;
      }
    }
  }

  isFullHouse() {
    if (!this.isConfirmedP1[9]) {
      this.scoresP1[this.scoreItems[9]].setText(0);
    }
    if (!this.isConfirmedP2[9]) {
      this.scoresP2[this.scoreItems[9]].setText(0);
    }

    const counts = this.diceValue.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    const values = Object.values(counts);
    if (values.includes(3) && values.includes(2)) {
      if (!this.isConfirmedP1[9]) {
        this.scoresP1[this.scoreItems[9]].setText(25);
      }
      if (!this.isConfirmedP2[9]) {
        this.scoresP2[this.scoreItems[9]].setText(25);
      }
    }
  }

  isSmallStraight() {
    const possibleStraights = [
      [1, 2, 3, 4],
      [2, 3, 4, 5],
      [3, 4, 5, 6],
    ];

    if (!this.isConfirmedP1[10]) {
      this.scoresP1[this.scoreItems[10]].setText(0);
    }
    if (!this.isConfirmedP2[10]) {
      this.scoresP2[this.scoreItems[10]].setText(0);
    }

    for (const straight of possibleStraights) {
      if (straight.every((num) => this.diceValue.includes(num))) {
        if (!this.isConfirmedP1[10]) {
          this.scoresP1[this.scoreItems[10]].setText(30);
        }
        if (!this.isConfirmedP2[10]) {
          this.scoresP2[this.scoreItems[10]].setText(30);
        }
        break;
      }
    }
  }

  isLargeStraight() {
    const possibleStraights = [
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 6],
    ];

    if (!this.isConfirmedP1[11]) {
      this.scoresP1[this.scoreItems[11]].setText(0);
    }
    if (!this.isConfirmedP2[11]) {
      this.scoresP2[this.scoreItems[11]].setText(0);
    }

    for (const straight of possibleStraights) {
      if (straight.every((num) => this.diceValue.includes(num))) {
        if (!this.isConfirmedP1[11]) {
          this.scoresP1[this.scoreItems[11]].setText(40);
        }
        if (!this.isConfirmedP2[11]) {
          this.scoresP2[this.scoreItems[11]].setText(40);
        }
        break;
      }
    }
  }

  chanceValue() {
    if (!this.isConfirmedP1[12]) {
      this.scoresP1[this.scoreItems[12]].setText(
        this.diceValue.reduce((a, b) => a + b, 0)
      );
    }
    if (!this.isConfirmedP2[12]) {
      this.scoresP2[this.scoreItems[12]].setText(
        this.diceValue.reduce((a, b) => a + b, 0)
      );
    }
  }

  isYatzee() {
    if (!this.isConfirmedP1[13]) {
      this.scoresP1[this.scoreItems[13]].setText(0);
    }
    if (!this.isConfirmedP2[13]) {
      this.scoresP2[this.scoreItems[13]].setText(0);
    }

    if (this.diceValue.every((val) => val === this.diceValue[0])) {
      if (!this.isConfirmedP1[13]) {
        this.scoresP1[this.scoreItems[13]].setText(50);
      }
      if (!this.isConfirmedP2[13]) {
        this.scoresP2[this.scoreItems[13]].setText(50);
      }
    }
  }

  discriminant() {
    this.sameDice();
    this.isThreeOfAKind();
    this.isFourOfAKind();
    this.isFullHouse();
    this.isSmallStraight();
    this.isLargeStraight();
    this.chanceValue();
    this.isYatzee();
  }
}

export default MainScene;
