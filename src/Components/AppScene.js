import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [isARActive, setIsARActive] = useState(false);
  let camera, scene, renderer, controller, model, hitTestSource, hitTestSourceRequested;

  useEffect(() => {
    if (!navigator.xr) return;

    init();
    animate();

    return () => {
      if (renderer && renderer.domElement) {
        sceneRef.current?.removeChild(renderer.domElement);
      }
    };
  }, []);

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

    loadModel();

    window.addEventListener('resize', onWindowResize, false);
  };

  const loadModel = () => {
    const loader = new GLTFLoader();
    loader.load(
      '/3DModels/tshirt.glb',
      (gltf) => {
        model = gltf.scene;
        model.scale.set(0.01, 0.01, 0.01);
        model.rotation.x = Math.PI / -2;
        model.visible = false; // Hide until AR starts
        scene.add(model);
      },
      undefined,
      (error) => console.error('Error loading model:', error)
    );
  };

  const startAR = async () => {
    if (navigator.xr) {
      try {
        const session = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hit-test'] });
        renderer.xr.setSession(session);
        setIsARActive(true);

        session.addEventListener('end', () => {
          setIsARActive(false);
          if (model) model.visible = false;
          onClose();
        });

        const referenceSpace = await session.requestReferenceSpace('local-floor');
        renderer.xr.setReferenceSpace(referenceSpace);

        session.addEventListener('select', placeModel);

        session.requestAnimationFrame(onXRFrame);
      } catch (error) {
        console.error('Failed to start AR session:', error);
      }
    }
  };

  const placeModel = () => {
    if (model) {
      model.visible = true;
      model.position.set(0, 0, -1.5); // Place it 1.5m in front of the user
    }
  };

  const onXRFrame = (time, frame) => {
    const session = renderer.xr.getSession();
    if (!session) return;

    if (!hitTestSourceRequested) {
      session.requestReferenceSpace('viewer').then((referenceSpace) => {
        session.requestHitTestSource({ space: referenceSpace }).then((source) => {
          hitTestSource = source;
        });
      });

      session.addEventListener('end', () => {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });

      hitTestSourceRequested = true;
    }

    if (hitTestSource) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0 && model) {
        const hitPose = hitTestResults[0].getPose(renderer.xr.getReferenceSpace());
        model.position.copy(hitPose.transform.position);
        model.visible = true;
      }
    }

    session.requestAnimationFrame(onXRFrame);
  };

  const onWindowResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };

  return (
    <>
      {/* Close Button */}
      {isARActive && (
        <button
          onClick={() => renderer.xr.getSession().end()}
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'red',
            color: 'white',
            border: 'none',
            padding: '10px',
            fontSize: '16px',
            cursor: 'pointer',
            zIndex: 10000,
            borderRadius: '50%',
          }}
        >
          ✕
        </button>
      )}

      {/* AR Scene */}
      <div ref={containerRef} style={{ position: 'relative' }} />
    </>
  );
};

export default AppScene;
