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
    'crab'
];
const SPECIES_COUNT = fishTypes.length;

const OXYBAR_X = 57;
const OXYBAR_Y = 208;
const OXYBAR_MARGIN = 1;
const OXYBAR_HEIGHT = 5;
const OXYBAR_UNIT_WIDTH = 20;
const OXYBAR_RATE = 1/10;

const DIVING_Y = 40;


class Play extends Phaser.Scene {
    constructor (config) {
        super({ key: 'play' });
    }

    create (config) {
        const camera = this.cameras.main;
        /*
        const music = this.sound.add('mainMusic');
        music.play({
            mute: false,
            volume: 1,
            loop: true,
            delay: 0
        });
        */

        const map = this.make.tilemap({ key: 'world' });
        const tileset = map.addTilesetImage('tiles', 'tiles');

        const worldLayer = map.createLayer('world', tileset);
        worldLayer.setCollisionByProperty({ collides: true });

        this.physics.world.gravity.y = 0;
        this.worldLayer = worldLayer;

        const startPoint = map.findObject('objects', obj => obj.name === 'start');
        this.player = new Player(this, startPoint.x, startPoint.y);
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

        this.startY = startPoint.y;
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
        this.depthOverlay.alpha = progress / 20000;
        this.altitudeText.setText(Math.floor(progress / 1) + 'm');

        const diff = (time - this.startTime) / 1000;
        const minutes = Math.floor(diff / 60);
        const secounds = Math.floor(diff % 60);
        this.timerText.setText(minutes + ':' + (secounds + '').padStart(2, '0'));
    }

    updateOxygenBar() {
        this.oxygenBar.width = OXYBAR_UNIT_WIDTH * this.oxygenLevel;
        this.oxygenContainer.width = OXYBAR_UNIT_WIDTH * this.oxygenCapacity + (OXYBAR_MARGIN * 2);
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
            this.player.hurtCount = 4;
        }
    }

    onWin() {
        this.winScreen.visible = true;
        this.physics.pause();
    }

    onLose() {
        this.failScreen.visible = true;
        this.physics.pause();
    }
}

export default Play;
