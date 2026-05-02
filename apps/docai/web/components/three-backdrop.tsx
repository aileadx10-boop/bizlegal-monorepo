"use client";

import { useEffect, useRef } from "react";
import type { Line, Mesh } from "three";

export function ThreeBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let canceled = false;
    let cleanup = () => {};

    const mount = async () => {
      const THREE = await import("three");
      const canvas = canvasRef.current;

      if (!canvas || canceled) {
        return;
      }

      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
      camera.position.z = 32;

      const resize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        renderer.setSize(width, height, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };

      resize();
      window.addEventListener("resize", resize);

      const totalParticles = 400;
      const positions = new Float32Array(totalParticles * 3);
      const colors = new Float32Array(totalParticles * 3);

      for (let index = 0; index < totalParticles; index += 1) {
        positions[index * 3] = (Math.random() - 0.5) * 100;
        positions[index * 3 + 1] = (Math.random() - 0.5) * 80;
        positions[index * 3 + 2] = (Math.random() - 0.5) * 50;

        const tint = Math.random();
        colors[index * 3] = tint < 0.5 ? 0 : tint * 0.4;
        colors[index * 3 + 1] = tint < 0.5 ? tint * 0.8 + 0.2 : 0.5 + tint * 0.3;
        colors[index * 3 + 2] = 1;
      }

      const particlesGeometry = new THREE.BufferGeometry();
      particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.18,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        vertexColors: true,
      });

      const particles = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particles);

      const gridMaterial = new THREE.LineBasicMaterial({
        color: 0x001428,
        transparent: true,
        opacity: 0.7,
      });

      const gridLines: Line[] = [];
      for (let index = -8; index <= 8; index += 1) {
        const segments = [
          [
            [-50, index * 6, -15],
            [50, index * 6, -15],
          ],
          [
            [index * 7, -40, -15],
            [index * 7, 40, -15],
          ],
        ] as const;

        segments.forEach(([start, end]) => {
          const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...start),
            new THREE.Vector3(...end),
          ]);
          const line = new THREE.Line(geometry, gridMaterial);
          scene.add(line);
          gridLines.push(line);
        });
      }

      const connectionLines: Line[] = [];
      for (let index = 0; index < 30; index += 1) {
        const pointA = Math.floor(Math.random() * totalParticles);
        const pointB = Math.floor(Math.random() * totalParticles);
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(
            positions[pointA * 3],
            positions[pointA * 3 + 1],
            positions[pointA * 3 + 2],
          ),
          new THREE.Vector3(
            positions[pointB * 3],
            positions[pointB * 3 + 1],
            positions[pointB * 3 + 2],
          ),
        ]);
        const line = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: 0x003366,
            transparent: true,
            opacity: 0.25,
          }),
        );
        scene.add(line);
        connectionLines.push(line);
      }

      const documents: Array<{
        mesh: Mesh;
        speed: number;
        offset: number;
      }> = [];

      for (let index = 0; index < 5; index += 1) {
        const geometry = new THREE.BoxGeometry(2.6, 3.6, 0.06);
        const mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({
            color: 0x020810,
            transparent: true,
            opacity: 0.5,
          }),
        );
        const edgeLines = new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({
            color: 0x00c8ff,
            transparent: true,
            opacity: 0.15,
          }),
        );
        mesh.add(edgeLines);
        mesh.position.set((Math.random() - 0.5) * 55, (Math.random() - 0.5) * 38, (Math.random() - 0.5) * 12 - 6);
        mesh.rotation.set(Math.random(), Math.random(), Math.random());
        scene.add(mesh);
        documents.push({
          mesh,
          speed: Math.random() * 0.002 + 0.0006,
          offset: Math.random() * Math.PI * 2,
        });
      }

      const mouse = { x: 0, y: 0 };
      const handleMouseMove = (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (event.clientY / window.innerHeight - 0.5) * 2;
      };

      window.addEventListener("mousemove", handleMouseMove);

      let time = 0;
      const animate = () => {
        if (canceled) {
          return;
        }

        time += 0.006;
        particles.rotation.y = time * 0.03;
        particles.rotation.x = time * 0.012;
        camera.position.x += (mouse.x * 3 - camera.position.x) * 0.022;
        camera.position.y += (-mouse.y * 2 - camera.position.y) * 0.022;
        camera.lookAt(0, 0, 0);

        documents.forEach((document) => {
          document.mesh.rotation.x += document.speed;
          document.mesh.rotation.y += document.speed * 0.65;
          document.mesh.position.y += Math.sin(time + document.offset) * 0.007;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      };

      animate();

      cleanup = () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", handleMouseMove);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        gridMaterial.dispose();
        gridLines.forEach((line) => line.geometry.dispose());
        connectionLines.forEach((line) => {
          line.geometry.dispose();
          if (Array.isArray(line.material)) {
            line.material.forEach((material) => material.dispose());
          } else {
            line.material.dispose();
          }
        });
      };
    };

    void mount();

    return () => {
      canceled = true;
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} className="three-canvas" aria-hidden="true" />;
}
