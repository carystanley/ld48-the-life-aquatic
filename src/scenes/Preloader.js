class Preloader extends Phaser.Scene {
    constructor () {
        super({ key: 'preloader' });
    }

    preload () {
        this.load.setPath('assets');

        let progress = this.add.graphics();

        this.load.on('progress', function (value) {
            progress.clear();
            progress.fillStyle(0xdff9fb, 1);
            progress.fillRect(0, (220 / 2) - 30, 256 * value, 60);
        });

        this.load.on('complete', function () {
            progress.destroy();
        });

        // Load assets
        this.load.image('tiles', 'tiles.png');
        this.load.spritesheet('submarine', 'submarine.png', { frameWidth: 72, frameHeight: 48 });
        this.load.spritesheet('fish16', 'fish16.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('shark', 'shark.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('o2tank', 'o2tank.png', { frameWidth: 16, frameHeight: 32 });
        this.load.spritesheet('collection', 'collection.png', { frameWidth: 12, frameHeight: 12 });
        this.load.tilemapTiledJSON('world', 'world.json');

        this.load.audio('hit', ['sfx/hit.mp3', 'sfx/hit.ogg']);
        this.load.audio('coinPickup', ['sfx/coinPickup.mp3', 'sfx/coinPickup.ogg']);
        this.load.audio('powerUp', ['sfx/powerUp.mp3', 'sfx/powerUp.ogg']);

        this.load.audio('response-1', ['audio/response-1.mp3', 'audio/response-1.ogg']);
        this.load.audio('response-2', ['audio/response-2.mp3', 'audio/response-2.ogg']);
        this.load.audio('response-3', ['audio/response-3.mp3', 'audio/response-3.ogg']);
        this.load.audio('response-aggresive', ['audio/response-aggresive.mp3', 'audio/response-aggresive.ogg']);
        this.load.audio('response-rainbow', ['audio/response-rainbow.mp3', 'audio/response-rainbow.ogg']);
        this.load.audio('response-shark', ['audio/response-shark.mp3', 'audio/response-shark.ogg']);
        this.load.audio('win', ['audio/win.mp3', 'audio/win.ogg']);

        this.load.audio('mainMusic', ['music/main.mp3', 'music/main.ogg']);

        this.load.bitmapFont('boxy_bold_8', 'fonts/boxy_bold_8.png', 'fonts/boxy_bold_8.xml');
    }

    create () {
        // Define Animations
        this.setupAnimations([
            { key: 'red-fish', image: 'fish16', start: 0, end: 1, frameRate: 3, repeat: -1 },
            { key: 'blue-fish', image: 'fish16', start: 2, end: 3, frameRate: 3, repeat: -1 },
            { key: 'piranha-fish', image: 'fish16', start: 4, end: 5, frameRate: 3, repeat: -1 },
            { key: 'angler-fish', image: 'fish16', start: 6, end: 7, frameRate: 3, repeat: -1 },
            { key: 'duck-fish', image: 'fish16', start: 8, end: 9, frameRate: 3, repeat: -1 },
            { key: 'clown-fish', image: 'fish16', start: 10, end: 11, frameRate: 3, repeat: -1 },
            { key: 'minnow-fish', image: 'fish16', start: 12, end: 13, frameRate: 3, repeat: -1 },
            { key: 'crab', image: 'fish16', start: 14, end: 15, frameRate: 3, repeat: -1 },
            { key: 'rainbow-fish', image: 'fish16', start: 16, end: 17, frameRate: 3, repeat: -1 },
            { key: 'shark', image: 'shark', start: 0, end: 0, frameRate: 3, repeat: -1 },

            { key: 'found-red-fish', image: 'collection', start: 0, end: 0, frameRate: 3, repeat: -1 },
            { key: 'found-blue-fish', image: 'collection', start: 1, end: 1, frameRate: 3, repeat: -1 },
            { key: 'found-piranha-fish', image: 'collection', start: 2, end: 2, frameRate: 3, repeat: -1 },
            { key: 'found-angler-fish', image: 'collection', start: 3, end: 3, frameRate: 3, repeat: -1 },
            { key: 'found-duck-fish', image: 'collection', start: 4, end: 4, frameRate: 3, repeat: -1 },
            { key: 'found-clown-fish', image: 'collection', start: 5, end: 5, frameRate: 3, repeat: -1 },
            { key: 'found-minnow-fish', image: 'collection', start: 6, end: 6, frameRate: 3, repeat: -1 },
            { key: 'found-crab', image: 'collection', start: 7, end: 7, frameRate: 3, repeat: -1 },
            { key: 'found-rainbow-fish', image: 'collection', start: 8, end: 8, frameRate: 3, repeat: -1 },
            { key: 'found-shark', image: 'collection', start: 9, end: 9, frameRate: 3, repeat: -1 },
            { key: 'found-empty', image: 'collection', start: 10, end: 10, frameRate: 3, repeat: -1 }
        ]);

        this.scene.start('play');
    }

    setupAnimations(animations) {
        animations.forEach(({ key, image, start, end, frameRate, repeat }) => {
            this.anims.create({
                key,
                frames: this.anims.generateFrameNumbers(image, { start, end }),
                frameRate,
                repeat
            });
        })
    }
}

export default Preloader;
