function init() {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        5000
    );
    camera.position.set(0, 150, 500);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("threeContainer").appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const audioPlayer = document.getElementById("audioPlayer");
    const infoBox = document.getElementById("infoBox");
    const infoText = document.getElementById("infoText");
    const exitBtn = document.getElementById("exitBtn");

    const loader = new THREE.TextureLoader();

    const planetData = {
        mercury: { size: 8, texture: "media/texture/mercury.jpg", sound: "media/sounds/mercury.mp3", info: "Mercury is the planet nearest to the Sun, and the smallest planet in our solar system." },
        venus:   { size: 10, texture: "media/texture/venus.jpg", sound: "media/sounds/venus.mp3", info: "Venus is the second planet from the Sun, and the sixth largest planet." },
        earth:   { size: 12, texture: "media/texture/earth.jpg", sound: "media/sounds/earth.mp3", info: "Earth – our home planet – is the third planet from the Sun, and the fifth largest planet." },
        mars:    { size: 10, texture: "media/texture/mars.jpg", sound: "media/sounds/mars.mp3", info: "Mars is the fourth planet from the Sun, and the seventh largest planet." },
        jupiter: { size: 20, texture: "media/texture/jupiter.jpg", sound: "media/sounds/jupiter.mp3", info: "Jupiter is the fifth planet from the Sun, and the largest planet in our solar system." },
        saturn:  { size: 18, texture: "media/texture/saturn.jpg", sound: "media/sounds/saturn.mp3", info: "Saturn is the sixth planet from the Sun, the second largest planet in our solar system." },
        uranus:  { size: 15, texture: "media/texture/uranus.jpg", sound: "media/sounds/uranus.mp3", info: "Uranus is the seventh planet from the Sun, and the third largest planet in our solar system." },
        neptune: { size: 15, texture: "media/texture/neptune.jpg", sound: "media/sounds/neptune.mp3", info: "Neptune is the eighth and most distant planet in our solar system. It's the fourth largest planet." }
    };

    const colors = {
        mercury: 0xaaaaaa,
        venus: 0xffcc99,
        earth: 0x3399ff,
        mars: 0xff3300,
        jupiter: 0xffcc66,
        saturn: 0xffff99,
        uranus: 0x66ffff,
        neptune: 0x3333ff
    };

    let selectedPlanet = null;
    const planets = [];

    // Yıldız Arka Planı
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const phi = Math.random() * Math.PI;
        const theta = Math.random() * 2 * Math.PI;
        const radius = 2000;
        starVertices.push(radius * Math.sin(phi) * Math.cos(theta));
        starVertices.push(radius * Math.sin(phi) * Math.sin(theta));
        starVertices.push(radius * Math.cos(phi));
    }
    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Güneş
    const sunGeometry = new THREE.SphereGeometry(30, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial();
    loader.load("media/texture/sun.jpg", function(texture) {
        sunMaterial.map = texture;
        sunMaterial.needsUpdate = true;
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const baseDistance = 60;
    const spacing = 50;

    // Gezegenleri ekleme
    Object.entries(planetData).forEach(([name, planetInfo], index) => {
        const geometry = new THREE.SphereGeometry(planetInfo.size, 64, 64);
        const material = new THREE.MeshStandardMaterial({
            color: colors[name],
            roughness: 0.5,
            metalness: 0.2
        });
        const planet = new THREE.Mesh(geometry, material);

        const distance = baseDistance + spacing * index;
        const angle = Math.random() * Math.PI * 2;

        planet.position.set(distance * Math.cos(angle), 0, distance * Math.sin(angle));
        planet.name = name;
        planet.userData = { distance, angle, speed: 0.001 + index * 0.0005 };

        scene.add(planet);
        planets.push(planet);

        loader.load(planetInfo.texture, function(texture) {
            planet.material.map = texture;
            planet.material.needsUpdate = true;
        });

        // Yörünge çizimi
        const orbitGeometry = new THREE.RingGeometry(distance - 0.2, distance + 0.2, 64);
        const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x888888, side: THREE.DoubleSide });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);

        // Saturn halkası
        if (name === "saturn") {
            const ringGeometry = new THREE.RingGeometry(planetInfo.size + 2, planetInfo.size + 5, 64);
            const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xdddd88, side: THREE.DoubleSide, opacity: 0.7, transparent: true });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
        }
    });

    // Işıklandırma
    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const pointLight = new THREE.PointLight(0xffffff, 2, 3000);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    function animate() {
        requestAnimationFrame(animate);

        planets.forEach(p => {
            p.userData.angle += p.userData.speed;
            p.position.x = Math.cos(p.userData.angle) * p.userData.distance;
            p.position.z = Math.sin(p.userData.angle) * p.userData.distance;
            p.rotation.y += 0.01;

            if (p === selectedPlanet) {
                p.scale.lerp(new THREE.Vector3(2, 2, 2), 0.05);
            } else {
                p.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
            }
        });

        stars.rotation.y += 0.0005;
        renderer.render(scene, camera);
    }

    // Başlangıç ekranı butonu
    document.getElementById("startBtn").addEventListener("click", () => {
        document.getElementById("startScreen").style.display = "none";
        animate();
    });

    // Tıklama
    window.addEventListener("click", (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(planets);

        if (intersects.length > 0) {
            selectedPlanet = intersects[0].object;
            infoBox.style.display = "block";
            infoText.textContent = planetData[selectedPlanet.name].info;
            audioPlayer.src = planetData[selectedPlanet.name].sound;
            audioPlayer.play();
        }
    });

    // Exit butonu
    exitBtn.addEventListener("click", () => {
        selectedPlanet = null;
        infoBox.style.display = "none";
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    });

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

init();



