export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'submarine');
        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.setDrag(10, 10)
            .setMaxVelocity(250, 500)
            .setSize(60, 40)
            .setOffset(6, 7)
            .setCollideWorldBounds(true);

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.hurtCount = 0;
        this.jumpTimer = 0;
    }

    update(time, delta) {
        const { cursors } = this;

        const accelerationX = 30;
        const accelerationY = 30;

        if (this.hurtCount > 0) {
            this.hurtCount -= (delta / 1000);
        }

        if (this.y < 30) {
            this.setAccelerationX(0);
            this.setAccelerationY(0);
            this.body.gravity.y = 100;
            return
        } else {
            this.body.gravity.y = 0;
        }

        if (cursors.left.isDown) {
            this.setAccelerationX(-accelerationX);
            this.setFlipX(true);
        } else if (cursors.right.isDown) {
            this.setAccelerationX(accelerationX);
            this.setFlipX(false);
        } else {
            this.setAccelerationX(0);
        }

        if (cursors.up.isDown) {
            this.setAccelerationY(-accelerationY);
        } else if (cursors.down.isDown) {
            this.setAccelerationY(accelerationY);
        } else {
            this.setAccelerationY(0);
        }
    }

    gotFish() {

    }
}
