
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Repeat, Star, Sparkles } from "lucide-react";
import * as THREE from "three";

const KidsCarRace = ({ onComplete }) => {
  const mountRef = useRef(null);
  const gameRef = useRef({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [stars, setStars] = useState(0);
  const [raceFinished, setRaceFinished] = useState(false);
  const [encouragement, setEncouragement] = useState("");

  const encouragements = [
    "You're doing great! 🌟",
    "Keep going, superstar! ⭐",
    "Wow, you're fast! 🚗💨",
    "Amazing driving! 🎉",
    "You're the best! 🏆"
  ];

  const handleComplete = useCallback(() => {
    if (onComplete) onComplete();
  }, [onComplete]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene setup with bright, kid-friendly colors
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 300);
    renderer.setClearColor(0x87CEEB); // Bright sky blue
    
    if (currentMount.children.length === 0) {
      currentMount.appendChild(renderer.domElement);
    }

    // Create colorful player car
    const carGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.8);
    const carMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4 }); // Pink car
    const playerCar = new THREE.Mesh(carGeometry, carMaterial);
    playerCar.position.set(0, 0.1, 0);
    scene.add(playerCar);

    // Create rainbow road
    const roadSegments = [];
    const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];
    for (let i = 0; i < 50; i++) {
      const roadGeometry = new THREE.PlaneGeometry(4, 2);
      const roadMaterial = new THREE.MeshBasicMaterial({ 
        color: colors[i % colors.length] 
      });
      const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
      roadSegment.rotation.x = -Math.PI / 2;
      roadSegment.position.set(0, 0, i * 2);
      scene.add(roadSegment);
      roadSegments.push(roadSegment);
    }

    // Create fun collectible stars
    const collectibleStars = [];
    for (let i = 0; i < 15; i++) {
      const starGeometry = new THREE.ConeGeometry(0.2, 0.5, 5);
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const star = new THREE.Mesh(starGeometry, starMaterial);
      star.position.set(
        (Math.random() - 0.5) * 3,
        0.5,
        Math.random() * 80 + 5
      );
      scene.add(star);
      collectibleStars.push(star);
    }

    // Create friendly cloud scenery
    const clouds = [];
    for (let i = 0; i < 10; i++) {
      const cloudGeometry = new THREE.SphereGeometry(1, 8, 8);
      const cloudMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
      cloud.position.set(
        (Math.random() - 0.5) * 40,
        5 + Math.random() * 3,
        Math.random() * 100
      );
      scene.add(cloud);
      clouds.push(cloud);
    }

    // Camera position - closer for kids
    camera.position.set(0, 2, -3);
    camera.lookAt(0, 0, 0);

    gameRef.current = {
      scene,
      camera,
      renderer,
      playerCar,
      roadSegments,
      collectibleStars,
      clouds,
      playerZ: 0,
      gameSpeed: 0.15 // Slower speed for kids
    };

    // Simple controls for kids
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
        // Simple controls
        if (keys['ArrowLeft'] && playerCar.position.x > -1.5) {
          playerCar.position.x -= 0.08;
        }
        if (keys['ArrowRight'] && playerCar.position.x < 1.5) {
          playerCar.position.x += 0.08;
        }

        // Constant forward movement
        gameRef.current.playerZ += gameRef.current.gameSpeed;

        // Move world
        roadSegments.forEach(segment => {
          segment.position.z -= gameRef.current.gameSpeed;
          if (segment.position.z < -10) {
            segment.position.z += 100;
          }
        });

        // Move stars and check for collection
        collectibleStars.forEach((star, index) => {
          star.position.z -= gameRef.current.gameSpeed;
          star.rotation.y += 0.1; // Spinning stars
          
          // Check collision with player
          const distance = star.position.distanceTo(playerCar.position);
          if (distance < 1) {
            setStars(prev => prev + 1);
            setEncouragement(encouragements[Math.floor(Math.random() * encouragements.length)]);
            // Move star to new position
            star.position.set(
              (Math.random() - 0.5) * 3,
              0.5,
              star.position.z + 100
            );
          }

          if (star.position.z < -10) {
            star.position.z += 100;
            star.position.x = (Math.random() - 0.5) * 3;
          }
        });

        // Move clouds
        clouds.forEach(cloud => {
          cloud.position.z -= gameRef.current.gameSpeed * 0.5;
          if (cloud.position.z < -10) {
            cloud.position.z += 100;
          }
        });

        // Finish race after collecting enough stars or distance
        if (stars >= 10 || gameRef.current.playerZ > 50) {
          setIsPlaying(false);
          setRaceFinished(true);
          handleComplete();
        }
      }

      gameRef.current.renderer.render(gameRef.current.scene, gameRef.current.camera);
    };

    animate();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (currentMount && gameRef.current.renderer && currentMount.contains(gameRef.current.renderer.domElement)) {
        currentMount.removeChild(gameRef.current.renderer.domElement);
      }
    };
  }, [isPlaying, stars, handleComplete]);

  const startRace = () => {
    setIsPlaying(true);
    setStars(0);
    setRaceFinished(false);
    setEncouragement("");
    if (gameRef.current) {
      gameRef.current.playerZ = 0;
    }
  };

  const resetRace = () => {
    setIsPlaying(false);
    setStars(0);
    setRaceFinished(false);
    setEncouragement("");
    if (gameRef.current) {
      gameRef.current.playerZ = 0;
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl">
      {!isPlaying && !raceFinished ? (
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-purple-800 mb-2">Rainbow Car Adventure!</h3>
          <p className="text-purple-600 mb-4">Drive on the rainbow road and collect golden stars! ⭐</p>
          <p className="text-sm text-purple-500 mb-6">
            Use ← → arrow keys to steer your pink car!
          </p>
          <Button onClick={startRace} size="lg" className="bg-gradient-to-r from-pink-400 to-purple-400">
            <Play className="w-4 h-4 mr-2" />
            Start Adventure! 🚗
          </Button>
        </div>
      ) : (
        <>
          {/* Game Stats */}
          <div className="flex gap-4 mb-4">
            <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
              ⭐ Stars: {stars}
            </Badge>
            {encouragement && (
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2 animate-bounce">
                {encouragement}
              </Badge>
            )}
          </div>

          {/* 3D Game View */}
          <div 
            ref={mountRef} 
            className="border-4 border-purple-300 rounded-lg mb-4 shadow-lg"
            style={{ width: 400, height: 300 }}
          />

          {/* Controls Reminder */}
          <div className="text-center text-sm text-purple-600 mb-4 font-semibold">
            Drive with ← → arrow keys to collect stars! ⭐
          </div>

          {/* Race Finished */}
          {raceFinished && (
            <div className="text-center bg-white/80 p-6 rounded-xl">
              <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-purple-800 mb-2">Amazing Job! 🎉</h3>
              <p className="text-purple-600 mb-4">
                You collected {stars} golden stars! You're a superstar driver! 🌟
              </p>
              <Button onClick={resetRace} className="bg-gradient-to-r from-pink-400 to-purple-400">
                <Repeat className="w-4 h-4 mr-2" />
                Drive Again! 🚗
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default KidsCarRace;
