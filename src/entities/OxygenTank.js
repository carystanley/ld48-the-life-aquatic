export default class OxygenTank extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        super(scene, x, y, 'o2tank');
        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.setMaxVelocity(500, 500)
            .setSize(16, 32)
            .setOffset(0, 0)
            .setCollideWorldBounds(true);
    }
}
