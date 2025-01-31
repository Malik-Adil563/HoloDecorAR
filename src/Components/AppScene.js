import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerMessage, setBannerMessage] = useState("");

  let camera, scene, renderer, controller, model;

  useEffect(() => {
    checkARSupport();
    if (!navigator.xr) return;

    init();
    animate();

    // Automatically start AR without button
    startAR();

    return () => {
      sceneRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const checkARSupport = async () => {
    if (!navigator.xr) {
      let message = "Your device does not support WebXR.";
      if (/Windows|Mac/i.test(navigator.userAgent)) {
        message += " Use Chrome and install this extension: ";
        message += `<a href="https://chromewebstore.google.com/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje?hl=en" target="_blank">WebXR Emulator</a>`;
      } else if (/Android/i.test(navigator.userAgent)) {
        message += " Use Mozilla Firefox.";
      } else if (/iPhone|iPad/i.test(navigator.userAgent)) {
        message += ` Use <a href="https://apps.apple.com/us/app/webxr-viewer/id1295998056" target="_blank">WebXR Viewer</a>.`;
      }
      setBannerMessage(message);
      setShowBanner(true);
    }
  };

  const startAR = async () => {
    if (navigator.xr) {
      try {
        const session = await navigator.xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['local-floor']
        });

        renderer.xr.setSession(session);
      } catch (error) {
        console.error("Failed to start AR session", error);
      }
    }
  };

  const init = () => {
    const container = document.createElement('div');
    containerRef.current.appendChild(container);
    sceneRef.current = container;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    const loader = new GLTFLoader();
    loader.load(
      '/3DModels/tshirt.glb',
      (gltf) => {
        model = gltf.scene;
        model.scale.set(0.01, 0.01, 0.01);
        model.rotation.x = Math.PI / -2;
        model.position.set(0, 0, -2);
        scene.add(model);
      },
      undefined,
      (error) => console.error('An error occurred while loading the model:', error)
    );

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('wheel', onZoom);
  };

  const onSelect = () => {
    if (model) {
      const position = new THREE.Vector3();
      position.set(0, 0, -0.5).applyMatrix4(controller.matrixWorld);
      model.position.copy(position);

      const originalScale = model.scale.clone();
      const originalRotation = model.rotation.clone();

      model.quaternion.setFromRotationMatrix(controller.matrixWorld);
      model.rotation.x = originalRotation.x;
      model.rotation.y = originalRotation.y;
      model.rotation.z = originalRotation.z;
      model.scale.copy(originalScale);
    }
  };

  const onZoom = (event) => {
    if (model) {
      const zoomFactor = 1 - event.deltaY * 0.001;
      const newScale = model.scale.clone().multiplyScalar(zoomFactor);

      if (newScale.x > 0.01 && newScale.x < 1) {
        model.scale.copy(newScale);
      }
    }
  };

  const onWindowResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    renderer.setAnimationLoop(render);
  };

  const render = () => {
    renderer.render(scene, camera);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {showBanner && (
        <div style={{
          position: 'fixed',
          top: '0',
          width: '100%',
          backgroundColor: '#ff4444',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          zIndex: '1000',
        }}>
          <span dangerouslySetInnerHTML={{ __html: bannerMessage }} />
        </div>
      )}

      
    </div>
  );
};

export default AppScene;