const RIGHT = 1;
const LEFT = -1;

const fishSettings = {
    default: { w: 16, h: 16, countMin: 2, countRange: 5, vel: 16 },
    'piranha-fish': { w: 16, h: 16, countMin: 2, countRange: 5, vel: 65 },
    'angler-fish': { w: 16, h: 16, countMin: 2, countRange: 5, vel: 65 },
    'clown-fish': { w: 16, h: 16, countMin: 2, countRange: 5, vel: 10 },
    'crab': { w: 16, h: 16, countMin: 2, countRange: 5, vel: 10, gravity: 20 }
}

export default class Fish extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, 'fish16');
        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.settings = fishSettings[type] || fishSettings.default;

        this.setMaxVelocity(500, 500)
            .setSize(this.settings.w, this.settings.h)
            .setOffset(0, 0)
            .setCollideWorldBounds(true);

        if (this.settings.gravity) {
            this.body.gravity.y = this.settings.gravity;
        }

        this.setMovement();

        this.type = type;
        this.anims.play(type, true);
    }

    setMovement() {
        this.direction = (Math.random() > 0.5) ? LEFT : RIGHT;
        this.setFlipX((this.direction === RIGHT));
        this.setVelocity(this.settings.vel * this.direction, 0)
        this.swimCounter = Math.random() * this.settings.countRange + this.settings.countMin * 1000;
    }

    update(time, delta) {
        this.swimCounter -= delta;
        if (this.swimCounter < 0) {
            this.setMovement();
        }
    }
}
