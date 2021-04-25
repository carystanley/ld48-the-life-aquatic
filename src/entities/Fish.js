const XVELOCITY = 16;
const RIGHT = 1;
const LEFT = -1;

export default class Fish extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, 'fish16');
        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.setMaxVelocity(500, 500)
            .setSize(16, 16)
            .setOffset(0, 0)
            .setCollideWorldBounds(true);

        this.setMovement();

        this.type = type;
        this.anims.play(type, true);
    }

    setMovement() {
        this.direction = (Math.random() > 0.5) ? LEFT : RIGHT;
        this.setFlipX((this.direction === RIGHT));
        this.setVelocity(XVELOCITY * this.direction, 0)
        this.swimCounter = Math.random() * 5 + 2 * 1000;
    }

    update(time, delta) {
        this.swimCounter -= delta;
        if (this.swimCounter < 0) {
            this.setMovement();
        }
    }
}
