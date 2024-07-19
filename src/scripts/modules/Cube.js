import * as THREE from 'three';
import { CubeFace } from '../webgpu/CubeFace.js';
import gsap from 'gsap';

const HALF_PI = Math.PI * 0.5;


export class Cube extends THREE.Object3D {
	constructor(faces){
		super();

		const faceX1 = faces[0]
		const faceX2 = faces[1]
		const faceY1 = faces[2]
		const faceY2 = faces[3]
		const faceZ1 = faces[4]
		const faceZ2 = faces[5]

		faceX1.rotation.set(0, -HALF_PI, 0);
		faceX2.rotation.set(Math.PI, HALF_PI, 0);
		faceY1.rotation.set(-HALF_PI, 0, 0);
		faceY2.rotation.set(HALF_PI, 0, 0);
		faceZ2.rotation.set(-Math.PI, 0, 0);

		faceX1.position.x = -0.5;
		faceX2.position.x = 0.5;
		faceY1.position.y = 0.5;
		faceY2.position.y = -0.5;
		faceZ1.position.z = 0.5;
		faceZ2.position.z = -0.5;		

		this.groupX = new THREE.Group();
		this.groupY = new THREE.Group();
		this.groupZ = new THREE.Group();

		this.groupX.add(faceX1, faceX2); // x: red
		this.groupY.add(faceY1, faceY2); // y: green
		this.groupZ.add(faceZ1, faceZ2); // z: blue
		this.cubeGroup = new THREE.Group();
		this.cubeGroup.add(this.groupX, this.groupY, this.groupZ);
		this.add(this.cubeGroup);		

		const axesHelper = new THREE.AxesHelper(2); 
		this.cubeGroup.add(axesHelper);
	}


	/**
	 * tween animation
	 * @param {string} axis x | y | z
	 * @param {boolean} isClockwise 
	 * @param {number} options.colorInvert 0 | 1
	 * @param {number} options.amount int
	 * @param {number} options.duration 
	 */
	async tween(axis, isClockwise, options){
		const {colorInvert, amount, duration} = Object.assign({
			colorInvert: 0,
			amount: 3,
			duration: 0.4,
		}, options);

		let axisGroup;
		let slideGroups = [];

		if(axis === "x"){
			axisGroup = this.groupX;
			slideGroups = [this.groupY, this.groupZ];
		} else if(axis === "y"){
			axisGroup = this.groupY;
			slideGroups = [this.groupX, this.groupZ];
		} else if(axis === "z"){
			axisGroup = this.groupZ;
			slideGroups = [this.groupX, this.groupY];
		}
 
		axisGroup.children.forEach((face, i) => {
			let rotateType = i % 2 === 0 ? 4 : 5;
			if(!isClockwise){
				rotateType = i % 2 === 0 ? 5 : 4;
			}
			face.tween(rotateType, amount, colorInvert, duration);
		});

		slideGroups.forEach((group, j) => {
			group.children.forEach((face, i) => {
				let sideType;
				if(axis === "x"){
					sideType = isClockwise ? 0 : 2;
				} else if(axis === "y"){
					const n = isClockwise ? 0 : 1;
					sideType = i % 2 == n ? 1 : 3;
				} else if(axis === "z"){
					if(j === 0){
						sideType = isClockwise ? 2 : 0;
					} else {
						const n = isClockwise ? 1 : 0;
						sideType = i % 2 === n ? 1 : 3;
					}
			}
				face.tween(sideType, amount, colorInvert, duration);
			});			
		});

		await gsap.delayedCall(amount * duration, () => {});
	}
}