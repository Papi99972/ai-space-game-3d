// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add space background (starfield)
const starFieldGeometry = new THREE.SphereGeometry(500, 32, 32);
const starFieldMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
    map: new THREE.TextureLoader().load('https://example.com/starfield.jpg') // Use your own texture for a starry background
});
const starField = new THREE.Mesh(starFieldGeometry, starFieldMaterial);
scene.add(starField);

// Load spaceship model (GLTF format)
let playerShip;
const loader = new THREE.GLTFLoader();
loader.load('https://example.com/spaceship.glb', (gltf) => {
    playerShip = gltf.scene;
    playerShip.scale.set(0.5, 0.5, 0.5); // Adjust the size
    playerShip.rotation.x = Math.PI / 2;
    scene.add(playerShip);
});

// Add a basic light
const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft light
scene.add(ambientLight);

// Directional light to highlight 3D objects
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10).normalize();
scene.add(directionalLight);

// Add some enemies
const enemies = [];
function createEnemy() {
    const enemyGeometry = new THREE.ConeGeometry(1, 3, 8);
    const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(Math.random() * 30 - 15, Math.random() * 10 - 5, -Math.random() * 50 - 20);
    scene.add(enemy);
    enemies.push(enemy);
}

for (let i = 0; i < 5; i++) {
    createEnemy();
}

// Camera positioning
camera.position.z = 10;
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
    if (e.buttons === 2) {  // Right mouse button for free look
        mouseX = e.clientX / window.innerWidth * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight * 2 - 1);
    }
});

// Key event listeners for ship movement
const keys = {
    w: false, a: false, s: false, d: false, shift: false, ctrl: false
};
window.addEventListener('keydown', (e) => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 'a') keys.a = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'd') keys.d = true;
    if (e.key === 'Shift') keys.shift = true;
    if (e.key === 'Control') keys.ctrl = true;
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 'a') keys.a = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'd') keys.d = false;
    if (e.key === 'Shift') keys.shift = false;
    if (e.key === 'Control') keys.ctrl = false;
});

// Add bullet creation
const bullets = [];
function fireBullet() {
    const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.set(playerShip.position.x, playerShip.position.y, playerShip.position.z);
    bullet.velocity = new THREE.Vector3(0, 0, -0.5);  // Move along z-axis
    scene.add(bullet);
    bullets.push(bullet);
}

window.addEventListener('mousedown', (e) => {
    if (e.button === 0 && playerShip) {
        fireBullet();
    }
});

// Update the game state every frame
function update() {
    // Ship movement based on user input
    if (keys.w) playerShip.position.z -= 0.05;
    if (keys.s) playerShip.position.z += 0.05;
    if (keys.a) playerShip.position.x -= 0.05;
    if (keys.d) playerShip.position.x += 0.05;
    if (keys.shift) playerShip.position.y += 0.05;
    if (keys.ctrl) playerShip.position.y -= 0.05;

    // Update bullets
    bullets.forEach((bullet, index) => {
        bullet.position.add(bullet.velocity);
        if (bullet.position.z < -50) {
            scene.remove(bullet);  // Remove bullet when it goes out of bounds
            bullets.splice(index, 1);
        }
    });

    // Update enemies' movement
    enemies.forEach(enemy => {
        enemy.position.z += 0.1;
        if (enemy.position.z > 50) {
            enemy.position.z = -Math.random() * 50 - 20; // Reset to a random starting point
        }
    });

    // Camera control (mouse look)
    if (playerShip) {
        camera.rotation.x = mouseY * 0.5;
        camera.rotation.y = mouseX * 0.5;
    }

    // Render the scene
    renderer.render(scene, camera);
    requestAnimationFrame(update);  // Call the update function recursively
}

update();
