import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js';
import { Cube } from '../modules/Cube.js';
import { CubeFace } from './CubeFace.js';

export class App {
	constructor(canvas){
		this.init(canvas);
	}

	async init(canvas){
		let texture;
		const textureLoader = new THREE.TextureLoader();
		
		await new Promise((resolve, reject) => {
			textureLoader.load(
					'images/1-10.png',
					_texture => {
						texture = _texture;
						resolve(texture)
					},
					undefined,
					err => reject(err)
			);
		});

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(0x333333);

		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.z = 3;
		this.controls = new OrbitControls(this.camera, canvas);

		this.renderer = new WebGPURenderer({ canvas });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);
		
		this.cube = new Cube([
			new CubeFace(texture),
			new CubeFace(texture),
			new CubeFace(texture),
			new CubeFace(texture),
			new CubeFace(texture),
			new CubeFace(texture),
		]);

		
		this.scene.add(this.cube);

		this.update();

		this.count = 0;
		this.colorInvert = 0;

		setTimeout(() => {
			this.tween();
		}, 2000);

		window.addEventListener('resize', () => this.resize());
	}


	async tween(){
		const duration = 0.3
		const index = this.count % 6;
		
		let params = [
			{
				axis: "x",
				isClockwise: false,
				colorInvert: 0,
				amount: 5,
			},
			{
				axis: "z",
				isClockwise: false,
				colorInvert: 0,
				amount: 5,
			},
			{
				axis: "y",
				isClockwise: false,
				colorInvert: 0,
				amount: 7,
			},
			{
				axis: "y",
				isClockwise: true,
				colorInvert: 1.0,
				amount: 7,
			},
			{
				axis: "z",
				isClockwise: true,
				colorInvert: 1.0,
				amount: 5,
			},												
			{
				axis: "x",
				isClockwise: true,
				colorInvert: 1.0,
				amount: 5,
			},												
		]
		const {axis, isClockwise, colorInvert, amount} = params[index]

		await this.cube.tween(axis, isClockwise, {colorInvert, amount, duration})
		
		this.count += 1;
	
		this.tween();
	}


	update(){
		requestAnimationFrame(() => this.update());
		this.controls.update();
		this.cube.rotation.x = -Math.PI * 0.25;
		this.cube.rotation.y = -Math.PI * 0.25;
		this.renderer.render(this.scene, this.camera);
	}

	resize(){
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}
