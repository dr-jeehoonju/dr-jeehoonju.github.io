import * as THREE from "three";
export function mountConstellation(
  canvas: HTMLCanvasElement,
  button: HTMLButtonElement | null,
) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 7;
  const small = innerWidth < 700;
  const count = small ? 2600 : 7000;
  const pos = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 0.4 + Math.pow(rand(), 0.62) * 2.3;
    const spread = (rand() - 0.5) * 0.55;
    pos[i * 3] = Math.cos(angle) * radius * 0.75 + Math.sin(angle * 2) * 0.13;
    pos[i * 3 + 1] = Math.sin(angle) * radius + spread;
    pos[i * 3 + 2] = (rand() - 0.5) * 0.45 + Math.sin(angle) * 0.3;
    const warm = rand();
    colors[i * 3] = 0.55 + warm * 0.4;
    colors[i * 3 + 1] = 0.5 + warm * 0.35;
    colors[i * 3 + 2] = 0.75 + warm * 0.25;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: small ? 0.012 : 0.009,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.rotation.z = -0.35;
  scene.add(points);
  let frame = 0,
    paused = false,
    visible = true,
    dead = false,
    tx = 0,
    ty = 0,
    t = 0;
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const move = (e: PointerEvent) => {
    tx = (e.clientX / innerWidth - 0.5) * 0.12;
    ty = (e.clientY / innerHeight - 0.5) * 0.1;
  };
  window.addEventListener("pointermove", move, { passive: true });
  function draw() {
    frame = 0;
    if (dead || paused || !visible || document.hidden) return;
    t += 0.001;
    points.rotation.y += (tx - points.rotation.y) * 0.025;
    points.rotation.x += (ty - points.rotation.x) * 0.025;
    points.rotation.z = -0.35 + Math.sin(t) * 0.025;
    renderer.render(scene, camera);
    canvas.classList.add("ready");
    frame = requestAnimationFrame(draw);
  }
  const resume = () => {
    if (!frame && !dead && !paused && visible && !document.hidden)
      frame = requestAnimationFrame(draw);
  };
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  });
  observer.observe(canvas);
  const visibility = () => resume();
  document.addEventListener("visibilitychange", visibility);
  const pause = () => {
    paused = !paused;
    if (button) {
      button.setAttribute("aria-pressed", String(paused));
      button.textContent = paused ? "Resume motion" : "Pause motion";
    }
    resume();
  };
  button?.addEventListener("click", pause);
  const lost = (e: Event) => {
    e.preventDefault();
    dispose();
  };
  canvas.addEventListener("webglcontextlost", lost);
  resize();
  resume();
  function dispose() {
    dead = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener("pointermove", move);
    document.removeEventListener("visibilitychange", visibility);
    button?.removeEventListener("click", pause);
    canvas.removeEventListener("webglcontextlost", lost);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    canvas.classList.remove("ready");
    if (button) button.hidden = true;
  }
  return dispose;
}
