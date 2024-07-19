import * as THREE from 'three';
import gsap from 'gsap';

const HALF_PI = Math.PI * 0.5;

const vertexShader = `
varying vec2 vUv;
void main() {
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uX;
uniform float uY;
uniform float uAngle;
uniform float uColorInvert;

vec2 rotateUV(vec2 uv, float angle) {
	uv -= 0.5;
	float cosA = cos(angle);
	float sinA = sin(angle);
	mat2 rotationMatrix = mat2(cosA, -sinA, sinA, cosA);
	uv = rotationMatrix * uv;
	uv += 0.5;
	return uv;
}
	
void main() {
	vec2 uv = vUv;
	uv.x += uX;
	uv.y += uY; 
	uv = rotateUV(uv, uAngle);
	vec4 color = texture2D(uTexture, uv);
	color.rgb = abs(color.rgb - vec3(uColorInvert));
	gl_FragColor = color;
}
`;

export class CubeFace extends THREE.Object3D {
	constructor(texture){
		super();
		
		this.texture = texture;
		this.texture.wrapS = THREE.RepeatWrapping;
		this.texture.wrapT = THREE.RepeatWrapping;

		this.geometry = new THREE.PlaneGeometry( 1, 1, 1 );
		this.material = new THREE.ShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			uniforms: {
				uTexture: { type: 't', value: texture },
				uX: { type: 'f', value: 0.0 },
				uY: { type: 'f', value: 0.0 },
				uAngle: { type: 'f', value: 0.0},
				uColorInvert: { type: 'f', value: 0.0}
			}
		});

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
				target = this.material.uniforms.uY;
				value = this.material.uniforms.uY.value + amount
				break;
			case 1:
				target = this.material.uniforms.uX;
				value = this.material.uniforms.uX.value + amount
				break;
			case 2:
				target = this.material.uniforms.uY;
				value = this.material.uniforms.uY.value - amount
				break;
			case 3:
				target = this.material.uniforms.uX;
				value = this.material.uniforms.uX.value - amount
				break;
			case 4:
				target = this.material.uniforms.uAngle;
				value = this.material.uniforms.uAngle.value + (-HALF_PI * amount)
				break;
			case 5:
					target = this.material.uniforms.uAngle;
					value = this.material.uniforms.uAngle.value + (HALF_PI * amount)
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

		if(this.material.uniforms.uColorInvert != colorInvert){
			gsap.to(this.material.uniforms.uColorInvert, {
				value: colorInvert,
				duration,
				// ease: 'none'
			});
		}
	}

	resetUxy(){
		this.material.uniforms.uX.value = 0
		this.material.uniforms.uY.value = 0		
	}
}