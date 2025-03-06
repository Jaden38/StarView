import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

const useCameraControls = (
  camera,
  containerRef,
  isFreeCamera,
  orbitControls
) => {
  const isMouseDownRef = useRef(false);
  const moveRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    rotateLeft: false,
    rotateRight: false,
  });

  const speedRef = useRef(50);
  const movementSensitivity = useRef(1.0);
  const pointerControlsRef = useRef(null);

  const handleKeyDown = (event) => {
    if (!isFreeCamera) return;
    switch (event.key.toLowerCase()) {
      case "z":
        moveRef.current.forward = true;
        break;
      case "s":
        moveRef.current.backward = true;
        break;
      case "q":
        moveRef.current.left = true;
        break;
      case "d":
        moveRef.current.right = true;
        break;
      case "arrowup":
        moveRef.current.up = true;
        break;
      case "arrowdown":
        moveRef.current.down = true;
        break;
      case "arrowleft":
        moveRef.current.rotateLeft = true;
        break;
      case "arrowright":
        moveRef.current.rotateRight = true;
        break;
      case "shift":
        speedRef.current = 100;
        break;
      case "+":
        movementSensitivity.current = Math.min(
          movementSensitivity.current + 0.1,
          5.0
        );
        console.log(`Sensibilité augmentée : ${movementSensitivity.current}`);
        break;
      case "-":
        movementSensitivity.current = Math.max(
          movementSensitivity.current - 0.1,
          0.1
        );
        console.log(`Sensibilité diminuée : ${movementSensitivity.current}`);
        break;
    }
  };

  const handleKeyUp = (event) => {
    if (!isFreeCamera) return;
    switch (event.key.toLowerCase()) {
      case "z":
        moveRef.current.forward = false;
        break;
      case "s":
        moveRef.current.backward = false;
        break;
      case "q":
        moveRef.current.left = false;
        break;
      case "d":
        moveRef.current.right = false;
        break;
      case "arrowup":
        moveRef.current.up = false;
        break;
      case "arrowdown":
        moveRef.current.down = false;
        break;
      case "arrowleft":
        moveRef.current.rotateLeft = false;
        break;
      case "arrowright":
        moveRef.current.rotateRight = false;
        break;
      case "shift":
        speedRef.current = 50;
        break;
    }
  };

  const handleMouseDown = () => {
    isMouseDownRef.current = true;
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const handleMouseMovement = (event) => {
    if (isFreeCamera && isMouseDownRef.current && camera) {
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      const horizontalRotation = new THREE.Quaternion();
      horizontalRotation.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -movementX * 0.002
      );

      const right = new THREE.Vector3(1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      const verticalRotation = new THREE.Quaternion();
      verticalRotation.setFromAxisAngle(right, -movementY * 0.002);

      camera.quaternion.multiplyQuaternions(
        verticalRotation,
        camera.quaternion
      );
      camera.quaternion.multiplyQuaternions(
        horizontalRotation,
        camera.quaternion
      );

      camera.quaternion.normalize();
    }
  };

  const updateCameraPosition = () => {
    if (!isFreeCamera || !camera) return;

    const direction = new THREE.Vector3();
    const sideVector = new THREE.Vector3();

    camera.getWorldDirection(direction);
    camera.getWorldDirection(sideVector);
    sideVector.cross(camera.up);

    const {
      forward,
      backward,
      left,
      right,
      up,
      down,
      rotateLeft,
      rotateRight,
    } = moveRef.current;
    const speed = speedRef.current * movementSensitivity.current;

    if (forward) camera.position.addScaledVector(direction, speed);
    if (backward) camera.position.addScaledVector(direction, -speed);
    if (left) camera.position.addScaledVector(sideVector, -speed);
    if (right) camera.position.addScaledVector(sideVector, speed);
    if (up) camera.position.y += speed;
    if (down) camera.position.y -= speed;
    if (rotateLeft) {
      const rotation = new THREE.Quaternion();
      rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.03);
      camera.quaternion.multiplyQuaternions(rotation, camera.quaternion);
    }
    if (rotateRight) {
      const rotation = new THREE.Quaternion();
      rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.03);
      camera.quaternion.multiplyQuaternions(rotation, camera.quaternion);
    }
  };

  useEffect(() => {
    if (!camera || !containerRef.current) return;

    pointerControlsRef.current = new PointerLockControls(
      camera,
      containerRef.current
    );
    pointerControlsRef.current.pointerSpeed = 0.5;

    if (isFreeCamera) {
      orbitControls.enabled = false;
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      orbitControls.enabled = true;

      camera.position.set(0, 2000, 4000);
      camera.lookAt(0, 0, 0);
      orbitControls.target.set(0, 0, 0);
    }

    containerRef.current.addEventListener("mousedown", handleMouseDown);
    containerRef.current.addEventListener("mouseup", handleMouseUp);
    containerRef.current.addEventListener("mousemove", handleMouseMovement);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousedown", handleMouseDown);
        containerRef.current.removeEventListener("mouseup", handleMouseUp);
        containerRef.current.removeEventListener(
          "mousemove",
          handleMouseMovement
        );
      }
    };
  }, [camera, isFreeCamera, orbitControls]);

  return {
    updateCameraPosition,
    pointerControls: pointerControlsRef.current,
  };
};

export default useCameraControls;
