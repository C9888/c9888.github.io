let camera,
renderer,
scene,
meshes = [],
axes = ["x", "y", "z"];

let x = 0,
y = 0,
heart = new THREE.Shape();

heart.moveTo(x + 0.5, y + 0.5);
heart.bezierCurveTo(x + 0.5, y + 0.5, x + 0.4, y, x, y);
heart.bezierCurveTo(x - 0.6, y, x - 0.6, y + 0.7, x - 0.6, y + 0.7);
heart.bezierCurveTo(x - 0.6, y + 1.1, x - 0.3, y + 1.54, x + 0.5, y + 1.9);
heart.bezierCurveTo(x + 1.2, y + 1.54, x + 1.6, y + 1.1, x + 1.6, y + 0.7);
heart.bezierCurveTo(x + 1.6, y + 0.7, x + 1.6, y, x + 1, y);
heart.bezierCurveTo(x + 0.7, y, x + 0.5, y + 0.5, x + 0.5, y + 0.5);

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("aqua");

  createCamera();
  createLights();
  for (let i = 0; i < 30; i++) {
    createMeshes();
  }
  createRenderer();

  renderer.setAnimationLoop(() => {
    update();
    render();
  });
}

function createCamera() {
  let fov = 45,
  aspect = window.innerWidth / window.innerHeight,
  near = 0.1,
  far = 40;

  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(15, 7.5, 30);
}

function createLights() {
  let light = new THREE.DirectionalLight();
  light.position.set(3, 2, 4);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
}

function createMeshes() {
  let geometry = new THREE.ExtrudeBufferGeometry(heart, {
    steps: 2,
    depth: 0.4,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.3,
    bevelOffset: 0,
    bevelSegments: 15 });


  let material = new THREE.MeshPhongMaterial({
    color: 0xfa6775 });


  let mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(Math.random() * 30, Math.random() * -40, Math.random() * 20);
  mesh.rotation.z = Math.PI;
  scene.add(mesh);
  meshes.push(mesh);
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);
}

function update() {
  meshes.forEach(mesh => {
    mesh.position.y = (mesh.position.y + 0.05) % 30;
  });
}

function render() {
  renderer.render(scene, camera);
}

init();

function onWindowResize() {
  let w = window.innerWidth,
  h = window.innerHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
}
window.addEventListener("resize", onWindowResize);