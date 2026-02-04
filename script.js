let selectedObject = null;

(function () {
    'use strict';
    var scene, camera, renderer;
    var container, HEIGHT,
        WIDTH, fieldOfView, aspectRatio,
        nearPlane, farPlane,
        geometry, particleCount,
        i, size,
        materials = [],
        mouseX = 0,
        mouseY = 0,
        windowHalfX, windowHalfY, cameraZ,
        fogHex, fogDensity, parameters = {},
        parameterCount, particles;

    init();
    animate();

    function init() {

        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        windowHalfX = WIDTH / 2;
        windowHalfY = HEIGHT / 2;

        fieldOfView = 75; // was 120
        aspectRatio = WIDTH / HEIGHT;
        nearPlane = 1; // this is render nearplane not camera nearplane.
        farPlane = 3000;

        cameraZ = farPlane / 2;

        fogHex = 0x000000;
        fogDensity = 0.0006;
        camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        camera.position.z = cameraZ;
        camera.layers.enable(1);

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(fogHex, fogDensity);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
        ambientLight.castShadow = true;
        scene.add(ambientLight);

        container = document.createElement('div');
        document.body.appendChild(container);
        document.body.style.margin = 0;
        document.body.style.overflow = 'visible';

        geometry = new THREE.Geometry();
        particleCount = 1000;

        const paintGeometry = new THREE.BoxGeometry(50, 50, 0);
        const paintTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/GanyuHail/recyclerabbit/main/src/WhiteRabbit.png');
        paintTexture.colourSpace = THREE.SRGBColorSpace;

        // Material for the front and back faces (with texture)
        const material = new THREE.MeshPhongMaterial({
          map: paintTexture,
        });

        const paintMesh = new THREE.Mesh(paintGeometry, material);
        scene.add(paintMesh);

        for (i = 0; i < particleCount; i++) {

            var vertex = new THREE.Vector3();
            vertex.x = Math.random() * 2000 - 1000;
            vertex.y = Math.random() * 2000 - 1000;
            vertex.z = Math.random() * 2000 - 1000;
            geometry.vertices.push(vertex);
        }

        parameters = [
            [
                [1, 1, 0.5], 5
            ],
            [
                [0.95, 1, 0.5], 4
            ],
            [
                [0.90, 1, 0.5], 3
            ],
            [
                [0.85, 1, 0.5], 2
            ],
            [
                [0.80, 1, 0.5], 1
            ]
        ];
        parameterCount = parameters.length;
        for (i = 0; i < parameterCount; i++) {

            size = parameters[i][1];

            materials[i] = new THREE.PointsMaterial({
                transparent: true,
                size: .5,
            });

            particles = new THREE.Points(geometry, materials[i]);

            particles.rotation.x = Math.random() * 10;
            particles.rotation.y = Math.random() * 6;
            particles.rotation.z = Math.random() * 6;

            scene.add(particles);
        }

        renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#bg'),
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(WIDTH, HEIGHT);
        container.appendChild(renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);
        document.addEventListener('touchend', onDocumentTouchEnd, false);
        // document.addEventListener('touchcancel', onDocumentTouchCancel, false);

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        window.addEventListener('pointermove', onPointerMove);
        // window.addEventListener('click', onMouseDown);
        // window.addEventListener('touchend', touchEnd);
        // window.addEventListener('touchcancel', touchCancel);
        // Use the defined touch-start handler instead of the undefined `touchStart`
        window.addEventListener('touchstart', onDocumentTouchStart);

        function onDocumentTouchStart(event) {
            if (event.touches.length === 1) {
                event.preventDefault();
                // Convert screen coords to normalized device coords (-1 to +1)
                mouse.x = (event.touches[0].pageX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.touches[0].pageY / window.innerHeight) * 2 + 1;
            }

        } function onPointerMove(event) {
            if (selectedObject) {
                selectedObject.material.colgitor.set('white');
                selectedObject = null;
            }

            raycaster.layers.set(0);

            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            for (let i = 0; i < intersects.length; i++) {
                const intersect = intersects[i];

                if (intersect && intersect.object) {
                    selectedObject = intersect.object;
                    intersect.object.material.color.set('hotpink');
                }

                else if (intersect = null) {
                    selectedObject = null;
                }
            }
        };

    // Handle clicks or touch events for navigation
    function handleNavigation(event) {
        if (selectedObject && selectedObject.material) {
          console.log('Object clicked:', selectedObject);  // Test if the object is clicked
          window.location.href = "/recyclerabbit/page.html";  // Navigate to another page
        }
      }
      window.addEventListener('click', handleNavigation);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('touchend', handleNavigation);
      window.addEventListener('touchstart', handleNavigation);

    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {
        var time = Date.now() * 0.000005;

        // Smooth camera movement based on mouse position
        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.position.z += (mouseY - camera.position.z) * 0.0065;

        // Define a minimum distance from the camera to the scene objects
        const minDistance = 400; // Adjust this value based on your needs
        const lerpFactor = 0.05;  // Lerp factor for smooth transition (adjust as necessary) was 0.1

        // Calculate the distance between the camera and the scene's center (or target point)
        const cameraPosition = camera.position.clone();
        const distanceToCenter = cameraPosition.distanceTo(scene.position); // Distance to the scene center

        // If the camera is closer than the minimum distance, smoothly adjust its position
        if (distanceToCenter < minDistance) {
            const direction = cameraPosition.sub(scene.position).normalize(); // Direction from scene to camera
            const targetPosition = direction.multiplyScalar(minDistance).add(scene.position); // Target position at min distance

            // Smoothly interpolate between current and target position
            camera.position.lerp(targetPosition, lerpFactor);
        }

        // Make the camera look at the scene's center
        camera.lookAt(scene.position);

        // Rotate the objects in the scene
        for (let i = 0; i < scene.children.length; i++) {
            var object = scene.children[i];
            if (object instanceof THREE.Points) {
                object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
            }
        }
        renderer.render(scene, camera);
    }


    function onDocumentMouseMove(e) {
        mouseX = e.clientX - windowHalfX;
        mouseY = e.clientY - windowHalfY;
    }

    function onDocumentTouchEnd(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    function onDocumentTouchMove(e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    // function onDocumentTouchEnd(e) {
    //     selectedObject = null;
    // }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
})();