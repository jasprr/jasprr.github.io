'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var easeInOut = function easeInOut(t) {
	return Math.cos(t * Math.PI) / -2 + .5;
};
var easeIn = function easeIn(t) {
	return 1 - Math.cos(t * Math.PI * .5);
};

var lerp = function lerp(a, b, t) {
	return a + (b - a) * t;
};
var warp = function warp(tStart, tEnd, t) {
	var toZero = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

	var tDuration = tEnd - tStart;
	var tWarped = (t - tStart) / tDuration;

	if (toZero && tWarped > 1) {
		return 0;
	}

	return Math.min(1, Math.max(0, tWarped));
};

var Box = function () {
	function Box(color) {
		_classCallCheck(this, Box);

		this.material = new THREE.MeshPhongMaterial({
			color: color,
			side: THREE.DoubleSide,
			transparent: true
		});

		this.box = Box.createBoxMesh(this.material);
		this.lid = Box.createLidMesh(this.material);

		this.mesh = new THREE.Object3D();
		this.mesh.add(this.box);
		this.mesh.add(this.lid);
	}

	Box.prototype.setAnimationProgress = function setAnimationProgress(t) {
		var tBoxScale = warp(0, .2, t);
		var tLid = warp(.2, .4, t);
		var tBoxPosition = warp(.6, 1, t);
		var tBoxFade = warp(.8, 1, t);

		this.lid.rotation.x = lerp(Math.PI * .5, 0, easeInOut(tLid));
		this.mesh.position.y = -easeIn(tBoxPosition) * 2;

		var boxScale = .75 + .25 * easeInOut(tBoxScale);
		this.mesh.scale.set(boxScale, boxScale, boxScale);

		this.material.opacity = 1 - easeIn(tBoxFade);
	};

	Box.createBoxMesh = function createBoxMesh(material) {
		var geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);

		geometry.faces.splice(4, 2);
		geometry.computeFaceNormals();

		var mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.receiveShadow = true;

		return mesh;
	};

	Box.createLidMesh = function createLidMesh(material) {
		var geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
		var mesh = new THREE.Mesh(geometry, material);

		mesh.position.y = .5;
		mesh.castShadow = true;
		mesh.receiveShadow = true;

		var lidContainer = new THREE.Object3D();
		lidContainer.add(mesh);
		lidContainer.position.set(0, .5, -0.5);
		lidContainer.rotation.x = Math.PI / 2;

		return lidContainer;
	};

	return Box;
}();

var Simulation = function () {
	function Simulation() {
		_classCallCheck(this, Simulation);

		this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1024);
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});

		this.renderer.setPixelRatio(window.devicePixelRatio);

		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		this.renderer.physicallyCorrectLights = true;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		this.camera.position.set(4, 4, 4);
		this.camera.lookAt(new THREE.Vector3());

		this.boxA = new Box(0x359bf3);
		this.scene.add(this.boxA.mesh);

		this.boxB = new Box(0x303030);
		this.boxB.mesh.rotation.y = Math.PI * .5;
		this.scene.add(this.boxB.mesh);

		this.scene.add(Simulation.LIGHT_AMBIENT);
		this.scene.add(Simulation.LIGHT_POINT);

		this.animationLoop = this.animate.bind(this);
	}

	Simulation.prototype.setSize = function setSize(width, height) {
		var cameraSize = Simulation.CAMERA_SIZE;
		var aspect = width / height;

		this.camera.left = -cameraSize * aspect;
		this.camera.right = cameraSize * aspect;
		this.camera.top = cameraSize;
		this.camera.bottom = -cameraSize;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(width, height);
		this.render();
	};

	Simulation.prototype.animate = function animate() {
		requestAnimationFrame(this.animationLoop);

		this.update();
		this.render();
	};

	Simulation.prototype.update = function update() {
		var duration = 4;
		var now = Date.now() / 1000;
		var progress = now % duration / duration;

		this.boxA.setAnimationProgress(warp(0, .5, progress, true));
		this.boxB.setAnimationProgress(warp(.5, 1, progress, true));
	};

	Simulation.prototype.render = function render() {
		this.renderer.render(this.scene, this.camera);
	};

	_createClass(Simulation, null, [{
		key: 'LIGHT_AMBIENT',
		get: function get() {
			return new THREE.AmbientLight(0xEEEEEEFF, .2);
		}
	}, {
		key: 'LIGHT_POINT',
		get: function get() {
			var light = new THREE.PointLight(0xFFFFFF, 1, 1024, .1);

			light.castShadow = true;
			light.position.set(1.5, 5, 4);
			light.power = 20;
			light.shadow.bias = 0.02;
			light.shadow.mapSize.set(1024, 1024);
			light.shadow.radius = 4;

			return light;
		}
	}, {
		key: 'CAMERA_SIZE',
		get: function get() {
			return 4;
		}
	}]);

	return Simulation;
}();

var sim = new Simulation();
var updateSizeAnimation = undefined;

var updateSize = function updateSize() {
	sim.setSize(window.innerWidth, window.innerHeight);
	sim.render();

	updateSizeAnimation = null;
};

var requestUpdateSize = function requestUpdateSize() {
	if (updateSizeAnimation) return;
	updateSizeAnimation = requestAnimationFrame(updateSize);
};

sim.animate();

document.body.appendChild(sim.renderer.domElement);

window.addEventListener('resize', requestUpdateSize);
updateSize();