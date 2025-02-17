import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  let camera, scene, renderer, controller, model;

  useEffect(() => {
    checkARSupport();
  }, []);

  const showWarningNotification = (message) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("⚠️ WebXR Warning", { body: message });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("⚠️ WebXR Warning", { body: message });
          }
        });
      }
    } else {
      console.warn("Notifications are not supported on this browser.");
    }
  };

  const checkARSupport = async () => {
    if (!navigator.xr || !(await navigator.xr.isSessionSupported('immersive-ar'))) {
      let message = "Your device does not support WebXR.";
      
      if (/Windows|Mac/i.test(navigator.userAgent)) {
        message += "\nUse Chrome and install WebXR Emulator extension.";
      } else if (/Android/i.test(navigator.userAgent)) {
        message += "\nUse Mozilla Firefox with WebXR extension.";
      } else if (/iPhone|iPad/i.test(navigator.userAgent)) {
        message += "\nUse WebXR Viewer.";
      }

      showWarningNotification(message);
      return;
    }

    init();
    animate();
    startAR();
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
      '/3DModels/chairs.glb',
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
      <button onClick={onClose} style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'red',
        color: 'white',
        border: 'none',
        padding: '10px',
        fontSize: '16px',
        cursor: 'pointer',
        zIndex: 1000,
        borderRadius: '50%',
      }}>
        ✕
      </button>
    </div>
  );
};

export default AppScene;