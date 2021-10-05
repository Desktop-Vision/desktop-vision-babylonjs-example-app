import * as THREE from 'three';
export default class Cubes {
    constructor(scene) {
        this.scene = scene
        this.object3d = new THREE.Object3D()

        this.boxWidth = 0.5;
        this.boxHeight = 0.5;
        this.boxDepth = 0.5;

        this.cubes = [
            this.createCube(0xffffff, { x: 0, y: 1.6, z: -3 }),
            this.createCube(0xffffff, { x: -1, y: 1.6, z: -3 }),
            this.createCube(0xffffff, { x: 1, y: 1.6, z: -3 })
        ];
    }

    createCube(color, coordinates) {
        const material = new THREE.MeshPhongMaterial({ color });
        const geometry = new THREE.BoxGeometry(this.boxWidth, this.boxHeight, this.boxDepth);
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = coordinates.x
        cube.position.y = coordinates.y
        cube.position.z = coordinates.z
        this.object3d.add(cube);
        return cube
    }


    animate(time) {
        time *= 0.001;
        this.cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * 0.1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });
    }

    addToScene(){
        this.scene.add(this.object3d)
    }

}