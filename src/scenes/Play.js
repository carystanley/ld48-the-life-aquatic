/* global ga */

import Player from '../entities/Player.js';
import Fish from '../entities/Fish.js';
import OxygenTank from '../entities/OxygenTank.js';

const fishTypes = [
    'red-fish',
    'blue-fish',
    'piranha-fish',
    'angler-fish',
    'duck-fish',
    'clown-fish',
    'minnow-fish',
    'crab',
    'rainbow-fish',
    'shark'
];
const SPECIES_COUNT = fishTypes.length;

const OXYBAR_X = 57;
const OXYBAR_Y = 208;
const OXYBAR_MARGIN = 1;
const OXYBAR_HEIGHT = 5;
const OXYBAR_UNIT_WIDTH = 10;
const OXYBAR_RATE = 1/15;

const DIVING_Y = 40;


function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const secounds = Math.floor(time % 60);
    return (minutes + ':' + (secounds + '').padStart(2, '0'));
}


class Play extends Phaser.Scene {
    constructor (config) {
        super({ key: 'play' });
    }

    create (config) {
        const camera = this.cameras.main;
        this.music = this.sound.add('mainMusic');
        this.music.play({
            mute: false,
            volume: 0.4,
            loop: true,
            delay: 0
        });

        const map = this.make.tilemap({ key: 'world' });
        const tileset = map.addTilesetImage('tiles', 'tiles');

        const worldLayer = map.createLayer('world', tileset);
        worldLayer.setCollisionByProperty({ collides: true });

        this.physics.world.gravity.y = 0;
        this.worldLayer = worldLayer;

        this.startPoint = map.findObject('objects', obj => obj.name === 'start');
        this.player = new Player(this, this.startPoint.x, this.startPoint.y);
        this.playerWorldCollider = this.physics.add.collider(this.player, worldLayer, this.onCrash, null, this);

        this.fishies = this.add.group();
        map.filterObjects('objects', function(obj) {
            return (fishTypes.includes(obj.name));
        }).forEach(function(fish) {
            this.fishies.add(new Fish(this, fish.x, fish.y, fish.name));
        }, this);
        this.physics.add.collider(this.fishies, worldLayer);
        this.physics.add.overlap(this.player, this.fishies, this.playerGotFish, null, this);

        this.powerups = this.add.group();
        map.filterObjects('objects', function(obj) {
            return (obj.name === 'oxygen');
        }).forEach(function(powerup) {
            this.powerups.add(new OxygenTank(this, powerup.x, powerup.y));
        }, this);
        this.physics.add.overlap(this.player, this.powerups, this.playerGotPowerUp, null, this);

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        this.hud = this.add.container(0, 0);
        this.hud.depth = 40;
        this.hud.setScrollFactor(0);

        const altitudeLabel = this.add.bitmapText(10, 10, 'boxy_bold_8');
        altitudeLabel.setText('Depth');
        this.hud.add(altitudeLabel);
        this.altitudeText = this.add.bitmapText(70, 10, 'boxy_bold_8');
        this.altitudeText.setRightAlign();
        this.hud.add(this.altitudeText);

        const speciesLabel = this.add.bitmapText(160, 10, 'boxy_bold_8');
        speciesLabel.setText('Species');
        this.hud.add(speciesLabel);
        this.speciesText = this.add.bitmapText(220, 10, 'boxy_bold_8');
        this.speciesText.setText(0 + '/' + SPECIES_COUNT);
        this.hud.add(this.speciesText);

        const speciesContainer = this.add.graphics();
        speciesContainer.lineStyle(1, 0xffffff, 1);
        speciesContainer.strokeRect(110.5, 6.5, 136, 16);
        this.hud.add(speciesContainer);

        const oxygenLabel = this.add.bitmapText(10, 206, 'boxy_bold_8');
        oxygenLabel.setText('Oxygen');
        this.hud.add(oxygenLabel);
        this.oxygenContainer = this.add.rectangle(
            OXYBAR_X - OXYBAR_MARGIN,
            OXYBAR_Y - OXYBAR_MARGIN,
            OXYBAR_UNIT_WIDTH + (OXYBAR_MARGIN * 2),
            OXYBAR_HEIGHT + (OXYBAR_MARGIN * 2),
            0x000000
        );
        this.oxygenContainer.setOrigin(0, 0);
        this.hud.add(this.oxygenContainer);
        this.oxygenBar = this.add.rectangle(
            OXYBAR_X,
            OXYBAR_Y,
            OXYBAR_UNIT_WIDTH,
            OXYBAR_HEIGHT,
            0xffffff
        );
        this.oxygenBar.setOrigin(0, 0);
        this.hud.add(this.oxygenBar);

        this.timerLabel = this.add.bitmapText(180, 206, 'boxy_bold_8');
        this.timerLabel.setText('Time');
        this.timerLabel.visible = false;
        this.hud.add(this.timerLabel);
        this.timerText = this.add.bitmapText(220, 206, 'boxy_bold_8');
        this.timerText.setText('0:00');
        this.timerText.visible = false;
        this.hud.add(this.timerText);

        // Title Screen
        this.gameTitle = this.add.container(0, 0);
        const titleText = this.add.bitmapText(30, 30, 'boxy_bold_8');
        titleText.setText('The\nLife Aquatic');
        titleText.depth = 40;
        titleText.scale = 2;
        this.gameTitle.add(titleText);
        // this.gameTitle.visible = false;

        // Fail Screen
        this.failScreen = this.add.container(0, 0);
        this.failScreen.setScrollFactor(0);
        const failOverlay = this.add.graphics();
        failOverlay.fillStyle(0xFF0000); // deep ocean
        failOverlay.fillRect(0, 0, camera.width, camera.height);
        failOverlay.depth = 30;
        failOverlay.setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.failScreen.add(failOverlay);
        const failText = this.add.bitmapText(40, 100, 'boxy_bold_8');
        failText.setText('Mission Failed');
        failText.depth = 40;
        failText.scale = 2;
        this.failScreen.add(failText);
        this.failScreen.visible = false;


        // Win Screen
        this.winScreen = this.add.container(0, 0);
        this.winScreen.setScrollFactor(0);
        const winText = this.add.bitmapText(10, 100, 'boxy_bold_8');
        winText.setText('Mission Completed!');
        winText.depth = 40;
        winText.scale = 2;
        this.winScreen.add(winText);
        this.winTime = this.add.bitmapText(128, 120, 'boxy_bold_8');
        this.winTime.setOrigin(0.5, 0);
        this.winTime.setText('0:00');
        this.winTime.depth = 40;
        this.winTime.scale = 4;
        this.winScreen.add(this.winTime);
        const ctoText = this.add.bitmapText(128, 157, 'boxy_bold_8');
        ctoText.setText('Share Your Time');
        ctoText.setOrigin(0.5, 0);
        ctoText.depth = 40;
        this.winScreen.add(ctoText);
        const continueText = this.add.bitmapText(128, 177, 'boxy_bold_8');
        continueText.setText('Press SPACE to play again');
        continueText.setOrigin(0.5, 0);
        continueText.depth = 40;
        this.tweens.add({
            targets: continueText,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            yoyo: true,
            loop: 1000000,
            ease: function (t) {
                return (t > 0.5) ? 1 : 0;
            }
        });
        this.winScreen.add(continueText);
        this.winScreen.visible = false;


        // Depth Overlay
        this.depthOverlay = this.add.graphics();
        this.depthOverlay.fillStyle(0x000066); // deep ocean
        this.depthOverlay.fillRect(0, 0, camera.width, camera.height);
        this.depthOverlay.setScrollFactor(0);
        this.depthOverlay.alpha = 0.0;
        this.depthOverlay.depth = 30;

        camera.roundPixels = true;
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        camera.setDeadzone(40, 20);
        camera.startFollow(this.player, true);

        this.startY = this.startPoint.y;
        this.foundFish = [];
        this.oxygenCapacity = 1;
        this.oxygenLevel = this.oxygenCapacity;
        this.submarineDiving = false;
        this.startTime = undefined;
    }

    update (time, delta) {
        if (this.physics.world.isPaused) {
            return;
        }

        this.player.update(time, delta);

        this.fishies.getChildren().forEach((fish) => {
            if (fish.update) {
                fish.update(time, delta);
            }
        });

        if (this.submarineDiving && (this.player.y < DIVING_Y)) {
            this.submarineDiving = false;
            this.oxygenLevel = this.oxygenCapacity;
            this.sound.play('powerUp');
            if (this.foundFish.length >= SPECIES_COUNT) {
                this.endTime = time;
                this.onWin()
            }
        } else if (!this.submarineDiving && (this.player.y >= DIVING_Y)) {
            this.submarineDiving = true;
            if (!this.startTime) {
                this.startTime = time;
                this.timerLabel.visible = true;
                this.timerText.visible = true;
                this.tweens.add({
                    targets: this.gameTitle,
                    alpha: { start: 1, to: 0 },
                    duration: 1000,
                    ease: 'Linear'
                });
                ga('send', 'event', 'start', 'begin')
            }
        }

        if (this.submarineDiving) {
            this.oxygenLevel -= OXYBAR_RATE * (delta / 1000);
            if (this.oxygenLevel <= 0) {
                this.oxygenLevel = 0;
                this.onLose();
            }
        }
        this.updateOxygenBar();

        const progress = Math.max(0, this.player.y - this.startY);
        this.depthOverlay.alpha = progress / 8000;
        this.altitudeText.setText(Math.floor(progress / 1) + 'm');

        this.timerText.setText(formatTime((time - this.startTime) / 1000));
    }

    updateOxygenBar() {
        this.oxygenBar.width = OXYBAR_UNIT_WIDTH * this.oxygenLevel;
        this.oxygenContainer.width = OXYBAR_UNIT_WIDTH * this.oxygenCapacity + (OXYBAR_MARGIN * 2);
        const percent = this.oxygenLevel / this.oxygenCapacity;
        if (percent < 0.25) {
            this.oxygenBar.fillColor = 0xff0000;
        } else if (percent < 0.5) {
            this.oxygenBar.fillColor = 0xffff00;
        } else {
            this.oxygenBar.fillColor = 0xaaaaff;
        }
    }

    doesWorldXYCollide (x, y) {
        const tile = this.worldLayer.getTileAtWorldXY(x, y);
        return tile && tile.collides;
    }

    playerGotFish(player, fish) {
        if (!this.foundFish.includes(fish.type)) {
            this.foundFish.push(fish.type);
            this.speciesText.setText(this.foundFish.length + '/' + SPECIES_COUNT);
            this.sound.play('coinPickup');

            if (fish.type === 'shark') {
                this.sound.play('response-shark');
            } else if (fish.type === 'rainbow-fish') {
                this.sound.play('response-rainbow');
            } else if (['piranha-fish', 'angler-fish'].includes(fish.type)) {
                this.sound.play('response-aggresive');
            } else {
                this.sound.play('response-' + (Math.ceil(Math.random() * 3)));
            }
        }
        if (['piranha-fish', 'angler-fish', 'shark'].includes(fish.type)) {
            this.onCrash();
        }
        // this.player.gotFish()
    }

    playerGotPowerUp(player, powerup) {
        this.sound.play('powerUp');
        powerup.destroy();
        this.oxygenLevel++;
        this.oxygenCapacity++;
    }

    onCrash() {
        if (!(this.player.hurtCount > 0)) {
            this.cameras.main.shake(300, 0.01);
            this.sound.play('hit');
            this.player.hurtCount = 2;
        }
    }

    onWin() {
        this.winTime.setText(formatTime((this.endTime - this.startTime) / 1000));
        this.winScreen.visible = true;
        this.physics.pause();
        this.sound.play('win');
        this.input.keyboard.on('keydown-SPACE', function (event) {
            this.music.stop();
            this.scene.restart();
        }, this);
        ga('send', 'event', 'gameover', 'win')
    }

    onLose() {
        this.sound.play('hit');
        this.failScreen.visible = true;
        this.physics.pause();
        this.time.delayedCall(3000, () => {
            this.failScreen.visible = false;
            this.physics.resume();
            this.oxygenLevel = this.oxygenCapacity;
            this.player.x = this.startPoint.x;
            this.player.y = this.startPoint.y;
            this.player.setVelocity(0, 0)
            this.player.setFlipX(false);
        }, this);
        ga('send', 'event', 'gameover', 'lose')
    }
}

export default Play;
