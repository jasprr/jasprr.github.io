"use strict";
var scene, camera, controls, renderer;
var sun;
var floor;
var width = window.innerWidth, height = window.innerHeight;
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.lookAt(scene.position);
    camera.position.z = 500;
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    // renderer.setClearColor(0x5c91d5);
    renderer.shadowMap.enabled = true;
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    var ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);
    var shadowLight = new THREE.DirectionalLight(0xfff, 0.8);
    shadowLight.position.set(200, 200, 200);
    shadowLight.castShadow = true;
    scene.add(shadowLight);
    var light = new THREE.DirectionalLight();
    light.position.set(200, 100, 200);
    light.castShadow = true;
    scene.add(light);
    drawSun();
    document.getElementById('app').appendChild(renderer.domElement);
    window.addEventListener('resize', onResize);
}
function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}
function animate() {
    requestAnimationFrame(animate);
    render();
}
function render() {
    sun.rotation.y += 0.005;
    renderer.render(scene, camera);
}
function drawSun() {
    var sunSize = 130;
    var sunGeometry = new THREE.IcosahedronGeometry(sunSize, 1);
    var sunMaterial = new THREE.MeshPhongMaterial({
        color: 0xffd927,
        shading: THREE.FlatShading
    });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.castShadow = true;
    sun.receiveShadow = true;
    sun.position.set(0, 50, 0);
    scene.add(sun);
}
init();
animate();