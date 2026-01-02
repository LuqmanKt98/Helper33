
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Repeat, Trophy, Zap } from "lucide-react";
import * as THREE from "three";

const SimpleRacing3D = ({ onComplete }) => {
  const mountRef = useRef(null);
  const gameRef = useRef({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [position, setPosition] = useState(1);
  const [raceFinished, setRaceFinished] = useState(false);

  const handleComplete = useCallback(() => {
    if (onComplete) onComplete();
  }, [onComplete]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 300);
    renderer.setClearColor(0x87CEEB); // Sky blue background
    
    if (currentMount.children.length === 0) {
      currentMount.appendChild(renderer.domElement);
    }

    // Create player car
    const carGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.8);
    const carMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const playerCar = new THREE.Mesh(carGeometry, carMaterial);
    playerCar.position.set(0, 0.1, 0);
    scene.add(playerCar);

    // Create opponent cars
    const opponentCars = [];
    const colors = [0x00ff00, 0x0000ff, 0xffff00];
    for (let i = 0; i < 3; i++) {
      const opponentGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.8);
      const opponentMaterial = new THREE.MeshBasicMaterial({ color: colors[i] });
      const opponent = new THREE.Mesh(opponentGeometry, opponentMaterial);
      opponent.position.set((i - 1) * 1.5, 0.1, 10 + Math.random() * 20);
      scene.add(opponent);
      opponentCars.push(opponent);
    }

    // Create road
    const roadSegments = [];
    for (let i = 0; i < 50; i++) {
      const roadGeometry = new THREE.PlaneGeometry(4, 2);
      const roadMaterial = new THREE.MeshBasicMaterial({ 
        color: i % 2 === 0 ? 0x333333 : 0x444444 
      });
      const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
      roadSegment.rotation.x = -Math.PI / 2;
      roadSegment.position.set(0, 0, i * 2);
      scene.add(roadSegment);
      roadSegments.push(roadSegment);
    }

    // Create trees for scenery
    const trees = [];
    for (let i = 0; i < 20; i++) {
      const treeGeometry = new THREE.ConeGeometry(0.3, 1, 8);
      const treeMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
      const tree = new THREE.Mesh(treeGeometry, treeMaterial);
      tree.position.set(
        (Math.random() - 0.5) * 20,
        0.5,
        Math.random() * 100
      );
      scene.add(tree);
      trees.push(tree);
    }

    // Camera position
    camera.position.set(0, 3, -5);
    camera.lookAt(0, 0, 0);

    // Game state
    gameRef.current = {
      scene,
      camera,
      renderer,
      playerCar,
      opponentCars,
      roadSegments,
      trees,
      playerZ: 0,
      gameSpeed: 0
    };

    // Controls
    const keys = {};
    const handleKeyDown = (event) => {
      keys[event.code] = true;
    };
    const handleKeyUp = (event) => {
      keys[event.code] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Game loop
    const animate = () => {
      if (!gameRef.current.scene) return;

      requestAnimationFrame(animate);

      if (isPlaying) {
        // Player controls
        if (keys['ArrowLeft'] && playerCar.position.x > -1.5) {
          playerCar.position.x -= 0.1;
        }
        if (keys['ArrowRight'] && playerCar.position.x < 1.5) {
          playerCar.position.x += 0.1;
        }
        if (keys['ArrowUp']) {
          gameRef.current.gameSpeed = Math.min(gameRef.current.gameSpeed + 0.01, 0.5);
        } else {
          gameRef.current.gameSpeed = Math.max(gameRef.current.gameSpeed - 0.02, 0);
        }

        // Move world towards player
        gameRef.current.playerZ += gameRef.current.gameSpeed;

        // Update road
        roadSegments.forEach(segment => {
          segment.position.z -= gameRef.current.gameSpeed;
          if (segment.position.z < -10) {
            segment.position.z += 100;
          }
        });

        // Update opponents
        opponentCars.forEach((opponent, index) => {
          opponent.position.z -= gameRef.current.gameSpeed * (0.8 + Math.random() * 0.4);
          if (opponent.position.z < -10) {
            opponent.position.z = 50 + Math.random() * 50;
            opponent.position.x = (Math.random() - 0.5) * 3;
          }
        });

        // Update trees
        trees.forEach(tree => {
          tree.position.z -= gameRef.current.gameSpeed;
          if (tree.position.z < -10) {
            tree.position.z += 100;
          }
        });

        // Update UI
        setSpeed(Math.round(gameRef.current.gameSpeed * 200));
        setScore(Math.round(gameRef.current.playerZ * 10));

        // Check for race finish
        if (gameRef.current.playerZ > 100) {
          setIsPlaying(false);
          setRaceFinished(true);
          setPosition(Math.floor(Math.random() * 4) + 1); // Random position for demo
          handleComplete();
        }
      }

      gameRef.current.renderer.render(gameRef.current.scene, gameRef.current.camera);
    };

    animate();

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (currentMount && gameRef.current.renderer && currentMount.contains(gameRef.current.renderer.domElement)) {
        currentMount.removeChild(gameRef.current.renderer.domElement);
      }
    };
  }, [isPlaying, handleComplete]);

  const startRace = () => {
    setIsPlaying(true);
    setScore(0);
    setSpeed(0);
    setPosition(1);
    setRaceFinished(false);
    if (gameRef.current.playerZ) {
      gameRef.current.playerZ = 0;
      gameRef.current.gameSpeed = 0;
    }
  };

  const resetRace = () => {
    setIsPlaying(false);
    setScore(0);
    setSpeed(0);
    setRaceFinished(false);
    if (gameRef.current.playerZ) {
      gameRef.current.playerZ = 0;
      gameRef.current.gameSpeed = 0;
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {!isPlaying && !raceFinished ? (
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">3D Racing Challenge</h3>
          <p className="text-gray-600 mb-4">Use arrow keys to steer and accelerate!</p>
          <p className="text-sm text-gray-500 mb-6">
            ← → to steer, ↑ to accelerate
          </p>
          <Button onClick={startRace} size="lg" className="bg-gradient-to-r from-red-500 to-orange-500">
            <Play className="w-4 h-4 mr-2" />
            Start Race
          </Button>
        </div>
      ) : (
        <>
          {/* Game Stats */}
          <div className="flex gap-4 mb-4">
            <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">
              Speed: {speed} mph
            </Badge>
            <Badge className="bg-orange-100 text-orange-800 text-lg px-4 py-2">
              Distance: {score}m
            </Badge>
          </div>

          {/* 3D Game View */}
          <div 
            ref={mountRef} 
            className="border-4 border-gray-300 rounded-lg mb-4 bg-gray-100"
            style={{ width: 400, height: 300 }}
          />

          {/* Controls Reminder */}
          <div className="text-center text-sm text-gray-600 mb-4">
            Use arrow keys: ← → to steer, ↑ to accelerate
          </div>

          {/* Race Finished */}
          {raceFinished && (
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Race Complete!</h3>
              <p className="text-gray-600 mb-4">
                You finished in position #{position}!
              </p>
              <p className="text-gray-600 mb-4">
                Final distance: {score}m
              </p>
              <Button onClick={resetRace} variant="outline">
                <Repeat className="w-4 h-4 mr-2" />
                Race Again
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SimpleRacing3D;
