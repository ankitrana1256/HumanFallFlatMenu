import * as THREE from "./three.module.js";
import { OrbitControls } from "./OrbitControls.js";
import { GLTFLoader } from "./GLTFLoader.js";

class Screen {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x01131e, 0.025);
    this.listener = new THREE.AudioListener();

    this.loader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();

    var sound = new THREE.Audio( this.listener );
    var audioLoader = new THREE.AudioLoader();

    const sky = this.textureLoader.load("./sky.jpg");

    const Alight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(Alight);

    this.sphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry(50, 50, 50),
      new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide })
    );
    this.scene.add(this.sphere);

    this.loadCharacter(this.loader);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(-2.702278652279275, 0.8748791086656065, 3.454312758083175);
    this.camera.add( this.listener );

    // Light
    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 100;
    light.position.set(0, 10, 14);
    this.scene.add(light);

    // Renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.updateShadowMap.enabled = true;
    document.getElementById("canvas").appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = false;
    this.controls.enabled = false;

    // Plane
    var plane = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    plane.receiveShadow = true;
    plane.castShadow = true;
    plane.rotation.x = Math.PI / 2;
    this.scene.add(plane);


    this.box = new THREE.Mesh(
      new THREE.BoxGeometry(0.5,0.5,0.5),
      new THREE.MeshPhongMaterial({color:0xff0000, transparent: true, opacity:0})
    )
    this.box.position.set(-4,0.5,0)
    this.scene.add(this.box)

    this.box2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.5,0.5,0.5),
      new THREE.MeshPhongMaterial({color:0xff0000, transparent: true, opacity:0})
    )
    this.box2.position.set(0,0.5,4)
    this.scene.add(this.box2)

    // Clock
    this.clock = new THREE.Clock();

    // Animation
    this.tween0 = new TWEEN.Tween(this.camera.position)
      .to({ x: this.box.position.x, y: 0.8748791086656065, z:this.box.position.z }, 3000)
      .delay(100);
    this.tween1 = new TWEEN.Tween(this.camera.position)
      .to({ x: -2.702278652279275, y: 0.8748791086656065, z:3.454312758083175 }, 3000)
      .delay(100);


    // Get Button Input
    this.play = document.getElementById('play');
    this.play.addEventListener('click',()=>{
      this.action.reset();
      this.action.play();
    })

    this.toggle = document.getElementById('toggle');
    this.toggle.addEventListener('click',()=>{
      this.tween0.start();
    })

    this.toggle1 = document.getElementById('toggle1');
    this.toggle1.addEventListener('click',()=>{
      this.tween1.start();
    })

    this.toggle2 = document.getElementById('toggle2');
    this.toggle2.addEventListener('click',()=>{
      audioLoader.load( './Music.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
      });
    })

    window.addEventListener("keypress", this.update.bind(this));
    this.renderer.setAnimationLoop(this.render.bind(this));
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

  }

  update() {
      if (event.key == "x" || event.key == "X") {
        console.log(this.camera.position);
    }
  }

  render() {
    this.elapsedTime = this.clock.getElapsedTime();
    this.deltaTime = this.elapsedTime - this.previousTime;
    this.previousTime = this.elapsedTime;

    if (this.mixer != undefined) {
      this.mixer.update(this.deltaTime);
    }

    this.sphere.rotation.y = this.elapsedTime * 0.09;
    TWEEN.update();
    this.controls.update();
    this.renderer.clear();
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.render(this.scene, this.camera);
  }

  loadCharacter(loader) {
    loader.load("./Character/scene.glb", (gltf) => {
      gltf.scene.position.set(0, 0.001, 0);
      gltf.scene.traverse(function (object) {
        if (object.isMesh) {
          object.castShadow = true;
          object.receiveShadow = false;
        }
      });
      this.scene.add(gltf.scene);
      this.mixer = new THREE.AnimationMixer(gltf.scene);
      this.action = this.mixer.clipAction(gltf.animations[0]);
      this.action.setLoop(THREE.LoopOnce);
      this.action.clampWhenFinished = true;
      this.action.enable = true;
    });
  }

}

export { Screen };
