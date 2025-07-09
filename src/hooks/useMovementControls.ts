import { useState, useEffect } from 'react';
import { district3DPositions } from '@/constants/city3d';

export function useMovementControls() {
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowDown: false,
    ArrowRight: false
  });
  
  const [playerPosition, setPlayerPosition] = useState<[number, number, number]>([0, 0, 15]);
  const [playerRotation, setPlayerRotation] = useState(0);
  const [nearbyDistrict, setNearbyDistrict] = useState<string | null>(null);
  const [movementSpeed, setMovementSpeed] = useState(0.3);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key in keys || ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(event.key)) {
        setKeys(prev => ({ ...prev, [event.key]: true }));
        event.preventDefault();
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key in keys || ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(event.key)) {
        setKeys(prev => ({ ...prev, [event.key]: false }));
        event.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSpeed = nearbyDistrict ? movementSpeed * 0.6 : movementSpeed;
      
      let newX = playerPosition[0];
      let newZ = playerPosition[2];
      let newRotation = playerRotation;
      
      if (keys.w || keys.ArrowUp) {
        newX += Math.sin(playerRotation) * currentSpeed;
        newZ += Math.cos(playerRotation) * currentSpeed;
      }
      if (keys.s || keys.ArrowDown) {
        newX -= Math.sin(playerRotation) * currentSpeed;
        newZ -= Math.cos(playerRotation) * currentSpeed;
      }
      
      if (keys.a || keys.ArrowLeft) {
        newRotation -= 0.05;
      }
      if (keys.d || keys.ArrowRight) {
        newRotation += 0.05;
      }
      
      newX = Math.max(-40, Math.min(40, newX));
      newZ = Math.max(-40, Math.min(40, newZ));
      
      let closestDistrict = null;
      let minDistance = Infinity;
      
      Object.entries(district3DPositions).forEach(([theme, pos]) => {
        const distance = Math.sqrt(
          Math.pow(newX - pos.x, 2) + Math.pow(newZ - pos.z, 2)
        );
        if (distance < 8 && distance < minDistance) {
          minDistance = distance;
          closestDistrict = theme;
        }
      });
      
      setNearbyDistrict(closestDistrict);
      setPlayerPosition([newX, 0, newZ]);
      setPlayerRotation(newRotation);
    }, 16);
    
    return () => clearInterval(interval);
  }, [keys, playerPosition, playerRotation, nearbyDistrict, movementSpeed]);
  
  return { playerPosition, playerRotation, nearbyDistrict, setPlayerPosition };
}