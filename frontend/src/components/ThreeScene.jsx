import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Light Editorial Palette
const COLORS = {
  emerald: 0x9EB800, // Lookbook Volt (Slightly deeper for light bg)
  rose: 0xFF3B30,    // Precision Red
  slate: 0x999999,   // Ghost Grey
  accent: 0x111111,  // Ink Black
  floor: 0xF4F4F0,   // Bone White
  graphite: 0x222222 
};

function createFloorGraphic(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024; canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#F4F4F0"; 
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.font = "900 120px sans-serif";
  ctx.fillStyle = "rgba(17, 17, 17, 0.04)"; 
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), 512, 512);
  return new THREE.CanvasTexture(canvas);
}

const ThreeScene = ({ analysis }) => {
  const mountRef = useRef(null);
  const tooltipRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !analysis) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.floor);
    scene.fog = new THREE.Fog(COLORS.floor, 25, 70);

    // Shifted camera slightly to frame things better
    const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(25, 20, 30);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(15, 30, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048; 
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xe0e6ed, 0.5);
    fillLight.position.set(-15, 10, -20);
    scene.add(fillLight);

    const floorGeo = new THREE.PlaneGeometry(150, 150);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: COLORS.floor, roughness: 0.8, metalness: 0.1,
      map: createFloorGraphic(analysis.topic || "INTELLIGENCE")
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    floor.receiveShadow = true;
    scene.add(floor);

    const stageGroup = new THREE.Group();
    // THE FIX: Shift the entire 3D stage to the right by 6 units!
    // This stops it from overlapping your HTML text on the left.
    stageGroup.position.x = 6; 
    scene.add(stageGroup);
    
    const baseMatOpts = { roughness: 0.2, metalness: 0.1 };

    // --- CHAPTER 1: SENTIMENT BARS ---
    const sentimentGroup = new THREE.Group();
    const bars = [];
    const nodes = analysis.nodes || [];
    const sortedNodes = [...nodes].sort((a, b) => a.sentiment.localeCompare(b.sentiment));
    const gridSize = Math.ceil(Math.sqrt(sortedNodes.length || 16));
    const spacing = 1.4; 

    sortedNodes.forEach((node, idx) => {
      const i = idx % gridSize;
      const j = Math.floor(idx / gridSize);
      const isPos = node.sentiment === "Positive";
      const isNeg = node.sentiment === "Negative";
      // THE FIX: Apply colors immediately, not just on hover.
      const targetColor = isPos ? COLORS.emerald : isNeg ? COLORS.rose : COLORS.slate;
      
      const mat = new THREE.MeshStandardMaterial({ color: targetColor, ...baseMatOpts });
      const height = 0.5 + (node.score / 100) * 4; 
      const geo = new THREE.BoxGeometry(0.8, 1, 0.8);
      geo.translate(0, 0.5, 0);
      
      const bar = new THREE.Mesh(geo, mat);
      bar.position.set(i * spacing - (gridSize*spacing)/2, -2, j * spacing - (gridSize*spacing)/2);
      bar.castShadow = true;
      bar.receiveShadow = true;
      
      bar.userData = { 
        targetScale: height, currentScale: 0,
        title: node.title || `Data Node ID-${node.id}`,
        sentiment: node.sentiment,
        score: node.score,
        targetHex: targetColor
      };
      
      bar.scale.y = 0.001;
      bars.push(bar);
      sentimentGroup.add(bar);
    });
    stageGroup.add(sentimentGroup);

    // --- CHAPTER 3 & 4: 3D FORECAST TREND LINE ---
    const forecastGroup = new THREE.Group();
    const vScore = analysis.virality_score || 50;
    
    const points = [
      new THREE.Vector3(-8, -1.5, 8),
      new THREE.Vector3(-4, -0.5, 4),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(4, 2 + (vScore/50), -4),
      new THREE.Vector3(8, 3 + (vScore/25), -8)
    ];
    
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.15, 16, false); 
    const tubeMat = new THREE.MeshStandardMaterial({ 
      color: COLORS.accent, 
      roughness: 0.5, metalness: 0.8
    });
    const trendLine = new THREE.Mesh(tubeGeo, tubeMat);
    trendLine.castShadow = true;
    forecastGroup.add(trendLine);
    
    const nodeSpheres = [];
    const sphereGeo = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({ color: COLORS.accent, roughness: 0.2, metalness: 0.5 });
    
    points.forEach((pt, idx) => {
      const sphere = new THREE.Mesh(sphereGeo, sphereMat.clone());
      sphere.position.copy(pt);
      sphere.castShadow = true;
      sphere.userData = {
        title: `Forecast Trajectory Pt.${idx + 1}`,
        sentiment: "Projected",
        score: Math.min(100, vScore + (idx * 5)),
        targetHex: COLORS.emerald
      };
      nodeSpheres.push(sphere);
      forecastGroup.add(sphere);
    });

    forecastGroup.position.y = -15; 
    stageGroup.add(forecastGroup);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let mouseX = 0; let mouseY = 0;
    let currentHover = null;

    const onMouseMove = (event) => {
      mouseX = event.clientX; mouseY = event.clientY;
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    const interactables = [...bars, ...nodeSpheres];

    let scrollTarget = 0, scrollCurrent = 0;
    const SCROLL_LERP = 0.07;
    let time = 0; let frameId;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.01;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactables);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (currentHover !== hit) {
          if (currentHover) currentHover.material.emissiveIntensity = 0;
          currentHover = hit;
          currentHover.material.emissive.setHex(0xffffff); // Flash white on hover
          currentHover.material.emissiveIntensity = 0.3;
          
          setHoverData(hit.userData);
          if (tooltipRef.current) tooltipRef.current.style.opacity = '1';
        }
        if (tooltipRef.current) {
          tooltipRef.current.style.transform = `translate(${mouseX + 20}px, ${mouseY + 20}px)`;
        }
      } else {
        if (currentHover) {
          currentHover.material.emissiveIntensity = 0;
          currentHover = null;
          setHoverData(null);
          if (tooltipRef.current) tooltipRef.current.style.opacity = '0';
        }
      }

      const maxScroll = document.body.scrollHeight - window.innerHeight;
      scrollTarget = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      scrollCurrent += (scrollTarget - scrollCurrent) * SCROLL_LERP;

      stageGroup.rotation.y = scrollCurrent * Math.PI * 0.5 + Math.sin(time * 0.5) * 0.05;

      const phase1 = scrollCurrent < 0.40;
      const phase3 = scrollCurrent >= 0.60;

      bars.forEach(bar => {
        bar.scale.y += ((phase1 ? bar.userData.targetScale : 0.001) - bar.scale.y) * 0.1;
      });

      const targetForecastY = phase3 ? 0 : -15;
      forecastGroup.position.y += (targetForecastY - forecastGroup.position.y) * 0.05;

      nodeSpheres.forEach((sphere, i) => {
        sphere.position.y = points[i].y + Math.sin(time * 2 + i) * 0.2;
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [analysis]); 

  return (
    <>
      <div ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      <div 
        ref={tooltipRef}
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 100, pointerEvents: "none", opacity: 0,
          transition: "opacity 0.2s ease",
          background: "rgba(17, 17, 17, 0.95)", border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "16px", width: "240px", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", color: "#F4F4F0",
          willChange: "transform"
        }}
      >
        {hoverData && (
          <div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>
              Data Node Inspected
            </div>
            <div style={{ fontSize: "14px", fontWeight: 400, lineHeight: 1.4, marginBottom: "16px", color: "#FFF" }}>
              {hoverData.title}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "12px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{hoverData.sentiment}</span>
              <div style={{ fontSize: "16px", fontWeight: 300, color: "#D4FF00" }}>
                {hoverData.score}<span style={{ fontSize: "10px", color: "#888", marginLeft: "2px" }}>/100</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ThreeScene;