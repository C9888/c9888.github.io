window.addEventListener("DOMContentLoaded",app);

function app() {
	var scene,
		camera,
		renderer,
		present,
		raycaster = new THREE.Raycaster(),
		intersects,
		pointer = new THREE.Vector2(),
		
		init = () => {
			// setup
			scene = new THREE.Scene();
			camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
			renderer = new THREE.WebGLRenderer();
			renderer.setClearColor(new THREE.Color(0xf98686));
			renderer.setSize(window.innerWidth, window.innerHeight);
			renderer.shadowMap.enabled = true;

			// present
			present = new Present(12,7);
			scene.add(present.mesh);
			
			// ambient light
			let ambientLight = new THREE.AmbientLight(0xffffff);
			ambientLight.name = "Ambient Light";
			scene.add(ambientLight);
			
			// directional light
			let directionLight = new THREE.DirectionalLight(0xffffff,0.7);
			directionLight.name = "Directional Light";
			directionLight.position.set(10,20,0);
			directionLight.castShadow = true;
			directionLight.shadow.mapSize = new THREE.Vector2(1024,1024);
			scene.add(directionLight);
			
			// camera
			camera.position.set(30,30,30);
			camera.lookAt(scene.position);
			
			// render
			document.body.appendChild(renderer.domElement);
			renderScene();
		},
		renderScene = () => {
			if (present)
				present.openLoop();

			renderer.render(scene,camera);
			requestAnimationFrame(renderScene);
		},
		adjustWindow = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth,window.innerHeight);
		},
		updateRaycaster = e => {
			pointer.x = (e.clientX / window.innerWidth ) * 2 - 1;
			pointer.y = -(e.clientY / window.innerHeight ) * 2 + 1;
			raycaster.setFromCamera(pointer,camera);
			intersects = raycaster.intersectObjects(present.mesh.children,true);
			intersects = intersects.filter(
				child => child.object.type == "Mesh"
			);
		},
		presentActive = e => {
			if (present && (intersects.length || e.keyCode == 32))
				present.open();
		},
		presentHover = e => {
			updateRaycaster(e);
			renderer.domElement.style.cursor = intersects.length ? "pointer" : "default";
		};
		
	init();
	window.addEventListener("resize",adjustWindow);
	document.addEventListener("click",presentActive);
	window.addEventListener("keydown",presentActive);
	window.addEventListener("mousemove",presentHover,false);
}

class Present {
	constructor(sideWidth = 7,divisions = 5) {
		this.sideWidth = sideWidth;
		this.divisions = divisions;
		this.effectFadeSpeed = 0.02;
		this.effectMoveSpeed = 0.8;
		this.effectRotateSpeed = 0.1;
		this.openSpeed = 4;
		this.openTime = 0;
		this.timeToOpen = 120;
		this.opacity = 1;
		this.opening = false;
		this.opened = false;
		this.wireframe = false;
		this.pieces = [];

		this.materials = [
			// wrapping
			new THREE.MeshStandardMaterial({
				color: 0x123a99,
				side: THREE.DoubleSide,
				transparent: true,
				wireframe: this.wireframe
			}),
			// ribbon
			new THREE.MeshStandardMaterial({
				color: 0xff1c54,
				side: THREE.DoubleSide,
				transparent: true,
				wireframe: this.wireframe
			}),
			// bow
			new THREE.MeshStandardMaterial({
				color: 0xff1c54,
				transparent: true,
				wireframe: this.wireframe
			})
		];
		this.mesh = new THREE.Object3D();
		this.mesh.name = "Present";

		let getTails = () => Math.random() < 0.5,
			randDecimal = (min,max) => Math.random() * (max - min) + min,
			S = this.sideWidth,
			HS = S/2,
			fracS = S/divisions,
			fracHS = fracS/2,
			HD = divisions/2,

			pieceGeo = new THREE.PlaneBufferGeometry(fracS,fracS),

			wrappingMat = this.materials[0],
			wrappingPiece = new THREE.Mesh(pieceGeo,wrappingMat),

			ribbonMat = this.materials[1],
			ribbonPiece = new THREE.Mesh(pieceGeo,ribbonMat);

		wrappingPiece.receiveShadow = true;
		ribbonPiece.receiveShadow = true;

		for (let s = 0; s < 6; ++s) {
			// place sides
			let side = new THREE.Object3D();
			switch (s) {
				// bottom
				case 0:
					side.position.set(0,-HS,0);
					side.rotation.x = Math.PI/2;
					break;
				// back
				case 1:
					side.position.set(0,0,-HS);
					side.rotation.y = Math.PI;
					break;
				// left
				case 2:
					side.position.set(-HS,0,0);
					side.rotation.y = -Math.PI/2;
					break;
				// right
				case 3:
					side.position.set(HS,0,0);
					side.rotation.y = Math.PI/2;
					break;
				// front
				case 4:
					side.position.set(0,0,HS);
					break;
				// top
				default:
					side.position.set(0,HS,0);
					side.rotation.x = -Math.PI/2;
					break;
			}

			// assemble box
			for (let h = -HD; h < HD; ++h) {
				for (let w = -HD; w < HD; ++w) {
					let isMiddleX = w >= -1 && w <= 0,
						isMiddleY = h >= -1 && h <= 0,
						topOrBottom = s == 0 || s == 5,
						onBow = isMiddleX || (isMiddleY && topOrBottom),
						piece = onBow ? ribbonPiece.clone() : wrappingPiece.clone();

					piece.firstPosition = {
						x: fracS*w + fracHS,
						y: fracS*h + fracHS,
						z: 0
					};
					piece.position.set(piece.firstPosition.x,piece.firstPosition.y,0);

					// adjust movements while adhereing to star–like direction
					piece.xMoveBias = randDecimal(0.3,1);
					piece.yMoveBias = randDecimal(0.3,1);
					piece.zMoveBias = randDecimal(0.3,1);

					piece.xRotateDir = getTails() ? -1 : 1;
					piece.yRotateDir = getTails() ? -1 : 1;
					piece.zRotateDir = getTails() ? -1 : 1;

					side.add(piece);
					this.pieces.push(piece);
				}
			}
			this.mesh.add(side);
		}

		// add bow
		let bowRad = this.divisions % 2 == 0 ? 4 : 3,
			bowGeo = new THREE.DodecahedronBufferGeometry(bowRad),
			bowMat = this.materials[2];

		this.bow = new THREE.Mesh(bowGeo,bowMat);
		this.bow.castShadow = true;

		this.bow.firstPosition = {
			 y: HS + bowRad/4
		};
		this.bow.position.set(0,this.bow.firstPosition.y,0);

		this.bow.xMoveDir = Math.random() * this.effectMoveSpeed * (getTails() ? -1 : 1);
		this.bow.yMoveDir = 1;
		this.bow.zMoveDir = Math.random() * this.effectMoveSpeed * (getTails() ? -1 : 1);

		this.bow.xRotateDir = getTails() ? -1 : 1;
		this.bow.yRotateDir = getTails() ? -1 : 1;
		this.bow.zRotateDir = getTails() ? -1 : 1;

		this.bow.scale.y = 0.5;
		this.mesh.add(this.bow);
	}
	open() {
		if (!this.opening && !this.opened)
			this.opening = true;
			this.openTime = 0;
            this.restore(); // 重置状态
			setTimeout(() => {
				window.location.href = 'firework.html';
			}, 430);
	}
	openLoop() {
		if  (this.opening) {
			let openSpeed = this.openSpeed,
				sineCurve = n => 0.03 * Math.sin(8 * Math.PI * n/100),
				scaleBy = 1 - sineCurve(this.openTime);

			this.mesh.scale.x = scaleBy;
			this.mesh.scale.y = scaleBy;
			this.mesh.scale.z = scaleBy;

			this.openTime += this.openSpeed;
			if (this.openTime >= this.timeToOpen) {
				this.openTime = 0;
				this.opening = false;
				this.opened = true;
			}

		} else if (this.opened) {
			let moveSpeed = this.effectMoveSpeed,
				rotateSpeed = this.effectRotateSpeed,
				divs = this.divisions;

			// pieces
			if (this.opacity > 0) {
				this.opacity -= this.effectFadeSpeed;

				this.pieces.forEach((e,i) => {
					let angleXZ = -45 + (90 * (i % divs)/(divs - 1)),
						angleY = -45 + (90/(divs - 1) * Math.floor((i % divs**2)/divs));

					e.position.x += moveSpeed * Math.sin(angleXZ * Math.PI/180) * e.xMoveBias;
					e.position.y += moveSpeed * Math.sin(angleY * Math.PI/180) * e.yMoveBias;
					e.position.z += moveSpeed * Math.cos(angleXZ * Math.PI/180) * e.zMoveBias;

					e.rotation.x += rotateSpeed * e.xRotateDir;
					e.rotation.y += rotateSpeed * e.yRotateDir;
					e.rotation.z += rotateSpeed * e.zRotateDir;
				});

				// bow
				this.bow.position.x += moveSpeed * this.bow.xMoveDir;
				this.bow.position.y += moveSpeed * this.bow.yMoveDir;
				this.bow.position.z += moveSpeed * this.bow.xMoveDir;

				this.bow.rotation.x += rotateSpeed * this.bow.xRotateDir;
				this.bow.rotation.y += rotateSpeed * this.bow.yRotateDir;
				this.bow.rotation.z += rotateSpeed * this.bow.zRotateDir;

			} else {
				this.opacity = 0;
				this.restore();
			}

			this.materials.forEach(e => {
				e.opacity = this.opacity;
			});
		}
	}
	restore() {
		this.opened = false;
		this.opacity = 1;

		// pieces
		this.pieces.forEach(e => {
			e.position.set(e.firstPosition.x,e.firstPosition.y,e.firstPosition.z);
			e.rotation.set(0,0,0);
		});
		// bow
		this.bow.position.set(0,this.bow.firstPosition.y,0);
		this.bow.rotation.set(0,0,0);
	}
}