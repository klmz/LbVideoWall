var Viewer = function(){
	this.W = window.innerWidth;
	this.H = window.innerHeight;
	this.scene = null;
	this.camera = null;
	this.controls = null;
	this.renderer = null;
	EventBus.subscribe("bluePoint", this, this.handleBluePoint);
	EventBus.subscribe("model", this, this.handleModel);
}

Viewer.prototype.constructor = Viewer;

Viewer.prototype.handleBluePoint = function(action){
	if(action ===  "add"){
		console.log("adding bluepoint");
		this.scene.add(this.bluePoint);
	}else{
		console.log("removing bluepoint");
		this.scene.remove(this.bluePoint);
	}
};

Viewer.prototype.handleModel = function(model){
	console.log("This model: ", model);
};


Viewer.prototype.init = function() {
	this.scene =new THREE.Scene();

	 // Add the camera
    this.camera = new THREE.PerspectiveCamera( 70, this.W / this.H, 1, 1000);
    this.camera.position.set(0, 100, 250);
 
    // Add test elements
    this.addTestSceneElements();
 
    // Create the WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.W, this.H);
 
    // Append the renderer to the body
    document.body.appendChild(this.renderer.domElement );
 
    // Add a resize event listener
    window.addEventListener( 'resize', this.onWindowResize, false );
 
    // Add the orbit controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target = new THREE.Vector3(0, 100, 0);

    //Start animation loop
    this.animate();
};

Viewer.prototype.addDefaultLights = function() {
	var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(100, 100, 50);
        // this.scene.add(dirLight);

        var ambLight = new THREE.AmbientLight(0x404040);
        // this.scene.add(ambLight);
       	this.bluePoint = new THREE.PointLight(0x0033ff, 3, 150);
        this.bluePoint.position.set( 70, 50, 70 );
        // this.scene.add(new THREE.PointLightHelper(bluePoint, 3));
         
        var greenPoint = new THREE.PointLight(0x33ff00, 1, 150);
        greenPoint.position.set( -70, 5, 70 );
        this.scene.add(greenPoint);
        this.scene.add(new THREE.PointLightHelper(greenPoint, 3));

        spotLight = new THREE.SpotLight(0xffffff, 1, 200, 20, 10);
        spotLight.position.set( 0, 150, 0 );
         
        var spotTarget = new THREE.Object3D();
        spotTarget.position.set(0, 0, 0);
        spotLight.target = spotTarget;
         
        this.scene.add(spotLight);
        this.scene.add(new THREE.PointLightHelper(spotLight, 1));

        var hemLight = new THREE.HemisphereLight(0xffe5bb, 0xFFBF00, .1);
        // this.scene.add(hemLight);
};

Viewer.prototype.addTestSceneElements = function() {
        // Create a cube used to build the floor and walls
        var cube = new THREE.CubeGeometry( 200, 1, 200);
     
        // create different materials
        var floorMat = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/wood-floor.jpg') } );
        var wallMat = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('images/bricks.jpg') } );
        var redMat = new THREE.MeshPhongMaterial( { color: 0xff3300, specular: 0x555555, shininess: 30 } );
        var purpleMat = new THREE.MeshPhongMaterial( { color: 0x6F6CC5, specular: 0x555555, shininess: 30 } );
     
        // Floor
        var floor = new THREE.Mesh(cube, floorMat );
        this.scene.add( floor );
     
        // Back wall
        var backWall = new THREE.Mesh(cube, wallMat );
        backWall.rotation.x = Math.PI/180 * 90;
        backWall.position.set(0,100,-100);
        this.scene.add( backWall );
     
        // Left wall
        var leftWall = new THREE.Mesh(cube, wallMat );
        leftWall.rotation.x = Math.PI/180 * 90;
        leftWall.rotation.z = Math.PI/180 * 90;
        leftWall.position.set(-100,100,0);
        this.scene.add( leftWall );
     
        // Right wall
        var rightWall = new THREE.Mesh(cube, wallMat );
        rightWall.rotation.x = Math.PI/180 * 90;
        rightWall.rotation.z = Math.PI/180 * 90;
        rightWall.position.set(100,100,0);
        this.scene.add( rightWall );
     
        // Sphere
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(20, 70, 20), redMat);
        sphere.position.set(-25, 100, -20);
        this.scene.add(sphere);
     
        // Knot thingy
        var knot = new THREE.Mesh(new THREE.TorusKnotGeometry( 40, 3, 100, 16 ), purpleMat);
        knot.position.set(0, 60, 30);
        this.scene.add(knot);

         // Add lights
    	this.addDefaultLights();


}

Viewer.prototype.onWindowResize = function(first_argument) {
        this.camera.aspect = this.W/this.H;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( this.W, this.H );
};

Viewer.prototype.animate = function() {
	this.renderer.render(this.scene, this.camera );
    requestAnimationFrame(function(v){
    	return function(){
		    		v.animate()
		    	};
		    }(this));
    this.controls.update();
};
module.exports = Viewer;