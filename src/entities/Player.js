export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'submarine');
        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.setDrag(10, 10)
            .setMaxVelocity(250, 500)
            .setSize(58, 21)
            .setOffset(8, 18)
            .setCollideWorldBounds(true);

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys('W,S,A,D');
        this.hurtCount = 0;
        this.jumpTimer = 0;
    }

    update(time, delta) {
        const { cursors } = this;

        const accelerationX = 40;
        const accelerationY = 40;

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

        if (cursors.left.isDown || this.keys.A.isDown) {
            this.setAccelerationX(-accelerationX);
            this.setFlipX(true);
        } else if (cursors.right.isDown || this.keys.D.isDown) {
            this.setAccelerationX(accelerationX);
            this.setFlipX(false);
        } else {
            this.setAccelerationX(0);
        }

        if (cursors.up.isDown || this.keys.W.isDown) {
            this.setAccelerationY(-accelerationY);
        } else if (cursors.down.isDown || this.keys.S.isDown) {
            this.setAccelerationY(accelerationY);
        } else {
            this.setAccelerationY(0);
        }
    }

    gotFish() {

    }
}
