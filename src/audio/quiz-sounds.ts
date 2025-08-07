/**
 * Sons mais agradáveis para o quiz usando Web Audio API
 * Inspirados em jogos casuais e apps de gamificação
 */

// Frequências musicais mais harmoniosas
const FREQUENCIES = {
  C4: 261.63,
  E4: 329.63,
  G4: 392.00,
  C5: 523.25,
  E5: 659.25,
  G5: 783.99,
  C6: 1046.50
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Som de resposta correta - acorde ascendente alegre
 */
export function playCorrectSound(intensity: number = 1) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Acorde C major ascendente
  const frequencies = [FREQUENCIES.C4, FREQUENCIES.E4, FREQUENCIES.G4];
  
  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(freq, now + index * 0.1);
    oscillator.type = 'sine';
    
    const volume = 0.15 * intensity;
    gainNode.gain.setValueAtTime(0, now + index * 0.1);
    gainNode.gain.linearRampToValueAtTime(volume, now + index * 0.1 + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.4);
    
    oscillator.start(now + index * 0.1);
    oscillator.stop(now + index * 0.1 + 0.4);
  });
}

/**
 * Som de resposta errada - acorde descendente suave
 */
export function playWrongSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Acorde menor descendente mais suave
  const frequencies = [FREQUENCIES.G4, FREQUENCIES.E4, FREQUENCIES.C4];
  
  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(freq, now + index * 0.15);
    oscillator.type = 'triangle'; // Tom mais suave
    
    gainNode.gain.setValueAtTime(0, now + index * 0.15);
    gainNode.gain.linearRampToValueAtTime(0.08, now + index * 0.15 + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.15 + 0.6);
    
    oscillator.start(now + index * 0.15);
    oscillator.stop(now + index * 0.15 + 0.6);
  });
}

/**
 * Som de streak - sequência crescente empolgante
 */
export function playStreakSound(streakLevel: number = 1) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Arpejo ascendente mais rápido e empolgante
  const baseFreqs = [FREQUENCIES.C5, FREQUENCIES.E5, FREQUENCIES.G5, FREQUENCIES.C6];
  const volume = Math.min(0.2, 0.1 + streakLevel * 0.02);
  
  baseFreqs.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(freq, now + index * 0.08);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, now + index * 0.08);
    gainNode.gain.linearRampToValueAtTime(volume, now + index * 0.08 + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.08 + 0.25);
    
    oscillator.start(now + index * 0.08);
    oscillator.stop(now + index * 0.08 + 0.25);
  });
}

/**
 * Som de BTZ ganho - "ca-ching" sintético
 */
export function playBTZSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  
  // Som de dinheiro sintético mais agradável
  const oscillator1 = ctx.createOscillator();
  const oscillator2 = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  // Frequências que lembram "ca-ching"
  oscillator1.frequency.setValueAtTime(800, now);
  oscillator1.frequency.linearRampToValueAtTime(600, now + 0.1);
  oscillator1.type = 'sine';
  
  oscillator2.frequency.setValueAtTime(1200, now + 0.05);
  oscillator2.frequency.linearRampToValueAtTime(800, now + 0.15);
  oscillator2.type = 'triangle';
  
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.12, now + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  oscillator1.start(now);
  oscillator1.stop(now + 0.3);
  oscillator2.start(now + 0.05);
  oscillator2.stop(now + 0.3);
}