import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';

const AppScene = () => {
  const containerRef = useRef(null);
  let camera, scene, renderer, controller, model;

  useEffect(() => {
    if (!navigator.xr) {
      showWebXrSupportMessage();
      return;
    }

    init();
    animate();

    return () => {
      if (renderer) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  const showWebXrSupportMessage = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let message = "WEBXr isn't supported on this device.";
    let link = '';

    if (userAgent.includes('windows')) {
      link = 'https://chromewebstore.google.com/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje?hl=en';
      message += ` Use Chrome with this extension: <a href="${link}" target="_blank">WebXR API Emulator</a>.`;
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      link = 'https://apps.apple.com/us/app/webxr-viewer/id1295998056';
      message += ` Use this app: <a href="${link}" target="_blank">WebXR Viewer</a>.`;
    } else if (userAgent.includes('android')) {
      message += ` Use Mozilla Firefox with the WebXR extension.`;
    }

    document.body.innerHTML = `<div style="text-align: center; margin-top: 20px; font-size: 18px; color: red;">${message}</div>`;
  };

  const init = () => {
    const container = document.createElement('div');
    containerRef.current.appendChild(container);

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
      (error) => {
        console.error('An error occurred while loading the model:', error);
      }
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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    renderer.setAnimationLoop(render);
  };

  const render = () => {
    renderer.render(scene, camera);
  };

  return <div ref={containerRef} />;
};

export default AppScene;