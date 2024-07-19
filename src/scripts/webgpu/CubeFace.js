import * as THREE from 'three';
import * as NODES from 'three/nodes';
import gsap from 'gsap';

const HALF_PI = Math.PI * 0.5;

export class CubeFace extends THREE.Object3D {
	constructor(_texture){
		super();
		
		this.texture = _texture;
		this.texture.wrapS = THREE.RepeatWrapping;
		this.texture.wrapT = THREE.RepeatWrapping;

		this.geometry = new THREE.PlaneGeometry( 1, 1, 1 );
		this.material = new NODES.MeshBasicNodeMaterial();


		this.uniforms = {
			uX: NODES.uniform( 0 ),
			uY: NODES.uniform( 0 ),
			uRotate: NODES.uniform( 0 ),
			uColorInvert: NODES.uniform( 0 ),
		}

		const shaderNode = NODES.tslFn(()=>{
			let uv = NODES.uv()
			uv = uv.add(NODES.vec2(this.uniforms.uX, this.uniforms.uY))
			uv = NODES.rotateUV(uv, this.uniforms.uRotate);
			let color = NODES.texture( this.texture, uv);
			color.rgb = NODES.abs(NODES.sub(color.rgb, NODES.vec3(this.uniforms.uColorInvert)));
			return color
		})
		this.material.colorNode = shaderNode()

		this.mesh = new THREE.Mesh( this.geometry, this.material );
		this.add(this.mesh);
	}


	/**
	 * tween animation
	 * @param {number} animationType 0: top, 1: right, 2: bottom, 3: left, 4: clockwise, 5: counterclockwise
	 * @param {number} amount int
	 * @param {number} colorInvert 0 or 1 
	 */
	tween(animationType = 0, amount = 3, colorInvert = 0, duration = 0.4){
		duration = duration * amount;
		const ease = 'expo.out';

		let target, value;
		switch(animationType){
			case 0:
				target = this.uniforms.uY;
				value = this.uniforms.uY.value + amount
				console.log(value);
				break;
			case 1:
				target = this.uniforms.uX;
				value = this.uniforms.uX.value + amount
				break;
			case 2:
				target = this.uniforms.uY;
				value = this.uniforms.uY.value - amount
				break;
			case 3:
				target = this.uniforms.uX;
				value = this.uniforms.uX.value - amount
				break;
			// MEMO: WebGLと上下反対なので回転は逆方向にする
			case 4:
				target = this.uniforms.uRotate;
				value = this.uniforms.uRotate.value + (HALF_PI * amount)
				break;
			case 5:
					target = this.uniforms.uRotate;
					value = this.uniforms.uRotate.value + (-HALF_PI * amount)
				break;
		}

		gsap.to(target, {
			value,
			duration,
			ease,
			onComplete: () => {
				if(animationType != 4 && animationType != 5){
					this.resetUxy();
				}
			}
		});

		if(this.uniforms.uColorInvert != colorInvert){
			gsap.to(this.uniforms.uColorInvert, {
				value: colorInvert,
				duration,
				// ease: 'none'
			});
		}
	}

	resetUxy(){
		this.uniforms.uX.value = 0
		this.uniforms.uY.value = 0		
	}
}