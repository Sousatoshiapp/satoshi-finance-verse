import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { cityConfig } from '@/constants/city3d';

interface GoogleMapsCameraProps {
  target?: [number, number, number];
  onCameraMove?: (position: [number, number, number]) => void;
  enableControls?: boolean;
}

export function GoogleMapsCamera({ 
  target = [0, 0, 0], 
  onCameraMove,
  enableControls = true 
}: GoogleMapsCameraProps) {
  const { camera, gl } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [cameraState, setCameraState] = useState({
    position: new THREE.Vector3(0, 80, 120),
    target: new THREE.Vector3(0, 0, 0),
    zoom: 1,
    pitch: 45, // Ângulo vertical (0-90)
    rotation: 0 // Ângulo horizontal
  });

  const previousMouse = useRef({ x: 0, y: 0 });
  const dampingRef = useRef({
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    needsUpdate: false
  });

  // Sistema de navegação estilo Google Maps
  useEffect(() => {
    if (!enableControls) return;

    const handleMouseDown = (event: MouseEvent) => {
      setIsDragging(true);
      previousMouse.current = { x: event.clientX, y: event.clientY };
      gl.domElement.style.cursor = 'grabbing';
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = event.clientX - previousMouse.current.x;
      const deltaY = event.clientY - previousMouse.current.y;

      setCameraState(prev => {
        const sensitivity = 0.5;
        const newRotation = prev.rotation - deltaX * sensitivity * 0.01;
        const newPitch = Math.max(10, Math.min(85, prev.pitch + deltaY * sensitivity * 0.1));

        // Calcular nova posição da câmera baseada no target
        const distance = prev.position.distanceTo(prev.target);
        const pitchRad = (newPitch * Math.PI) / 180;
        const rotationRad = newRotation;

        const newPosition = new THREE.Vector3();
        newPosition.x = prev.target.x + Math.sin(rotationRad) * Math.cos(pitchRad) * distance;
        newPosition.y = prev.target.y + Math.sin(pitchRad) * distance;
        newPosition.z = prev.target.z + Math.cos(rotationRad) * Math.cos(pitchRad) * distance;

        dampingRef.current.needsUpdate = true;

        return {
          ...prev,
          position: newPosition,
          rotation: newRotation,
          pitch: newPitch
        };
      });

      previousMouse.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      gl.domElement.style.cursor = 'grab';
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setIsZooming(true);

      setCameraState(prev => {
        const zoomSensitivity = 0.1;
        const delta = event.deltaY > 0 ? 1 + zoomSensitivity : 1 - zoomSensitivity;
        
        // Calcular nova distância
        const currentDistance = prev.position.distanceTo(prev.target);
        const newDistance = Math.max(20, Math.min(500, currentDistance * delta));
        
        // Manter ângulos, apenas mudar distância
        const pitchRad = (prev.pitch * Math.PI) / 180;
        const rotationRad = prev.rotation;

        const newPosition = new THREE.Vector3();
        newPosition.x = prev.target.x + Math.sin(rotationRad) * Math.cos(pitchRad) * newDistance;
        newPosition.y = prev.target.y + Math.sin(pitchRad) * newDistance;
        newPosition.z = prev.target.z + Math.cos(rotationRad) * Math.cos(pitchRad) * newDistance;

        dampingRef.current.needsUpdate = true;

        return {
          ...prev,
          position: newPosition,
          zoom: 500 / newDistance // Zoom inverso à distância
        };
      });

      setTimeout(() => setIsZooming(false), 100);
    };

    const handleDoubleClick = (event: MouseEvent) => {
      // Implementar zoom para ponto específico (como Google Maps)
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      
      // Simular clique no terreno para mover o target
      const targetY = 0;
      const direction = raycaster.ray.direction;
      const origin = raycaster.ray.origin;
      const t = (targetY - origin.y) / direction.y;
      
      if (t > 0) {
        const newTarget = new THREE.Vector3(
          origin.x + direction.x * t,
          targetY,
          origin.z + direction.z * t
        );

        // Limitar target aos limites da cidade
        newTarget.x = Math.max(cityConfig.cameraLimits.min.x, Math.min(cityConfig.cameraLimits.max.x, newTarget.x));
        newTarget.z = Math.max(cityConfig.cameraLimits.min.z, Math.min(cityConfig.cameraLimits.max.z, newTarget.z));

        setCameraState(prev => {
          const distance = prev.position.distanceTo(prev.target);
          const pitchRad = (prev.pitch * Math.PI) / 180;
          const rotationRad = prev.rotation;

          const newPosition = new THREE.Vector3();
          newPosition.x = newTarget.x + Math.sin(rotationRad) * Math.cos(pitchRad) * distance;
          newPosition.y = newTarget.y + Math.sin(pitchRad) * distance;
          newPosition.z = newTarget.z + Math.cos(rotationRad) * Math.cos(pitchRad) * distance;

          dampingRef.current.needsUpdate = true;

          return {
            ...prev,
            position: newPosition,
            target: newTarget
          };
        });
      }
    };

    const canvas = gl.domElement;
    canvas.style.cursor = 'grab';
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('dblclick', handleDoubleClick);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      canvas.style.cursor = 'default';
    };
  }, [enableControls, isDragging, gl, camera]);

  // Aplicar damping suave para movimentos fluidos
  useFrame((state, delta) => {
    if (dampingRef.current.needsUpdate) {
      const dampingFactor = 1 - Math.exp(-10 * delta);
      
      camera.position.lerp(cameraState.position, dampingFactor);
      
      // Atualizar target da câmera
      const tempTarget = new THREE.Vector3().copy(cameraState.target);
      camera.lookAt(tempTarget);

      // Notificar mudança de posição
      if (onCameraMove) {
        onCameraMove([camera.position.x, camera.position.y, camera.position.z]);
      }

      // Verificar se chegou próximo o suficiente ao target
      if (camera.position.distanceTo(cameraState.position) < 0.1) {
        dampingRef.current.needsUpdate = false;
      }
    }
  });

  // Função para mover para um target específico (para teleporte)
  const flyToTarget = (newTarget: [number, number, number], duration = 2000) => {
    const startPosition = camera.position.clone();
    const startTarget = cameraState.target.clone();
    const endTarget = new THREE.Vector3(newTarget[0], newTarget[1], newTarget[2]);
    
    // Calcular posição ideal da câmera para o novo target
    const idealDistance = 100;
    const idealPitch = 45;
    const idealRotation = cameraState.rotation;

    const pitchRad = (idealPitch * Math.PI) / 180;
    const endPosition = new THREE.Vector3();
    endPosition.x = endTarget.x + Math.sin(idealRotation) * Math.cos(pitchRad) * idealDistance;
    endPosition.y = endTarget.y + Math.sin(pitchRad) * idealDistance;
    endPosition.z = endTarget.z + Math.cos(idealRotation) * Math.cos(pitchRad) * idealDistance;

    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Usar easing para movimento suave
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentPosition = startPosition.clone().lerp(endPosition, easeProgress);
      const currentTarget = startTarget.clone().lerp(endTarget, easeProgress);
      
      setCameraState(prev => ({
        ...prev,
        position: currentPosition,
        target: currentTarget,
        pitch: idealPitch
      }));
      
      dampingRef.current.needsUpdate = true;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  // Expor função de teleporte
  useEffect(() => {
    (window as any).flyToTarget = flyToTarget;
  }, []);

  return null;
}