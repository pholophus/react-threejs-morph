// three.js front page spinning cube with minor changes:

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer;
let geometry, material, mesh;

init();

function init() {

	scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x8FBCD4 );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 20 );
				camera.position.z = 10;
				scene.add( camera );

				scene.add( new THREE.AmbientLight( 0x8FBCD4, 0.4 ) );

				const pointLight = new THREE.PointLight( 0xffffff, 1 );
				camera.add( pointLight );

				geometry = createGeometry();

				material = new THREE.MeshPhongMaterial( {
					color: 0xff0000,
					flatShading: true
				} );

				mesh = new THREE.Mesh( geometry, material );

				// mesh.updateMorphTargets();
				mesh.morphTargetInfluences[0] = 0;
				scene.add( mesh );

				// initGUI();

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );

				renderer.setAnimationLoop(animation );
				// renderer.setAnimationLoop( function () {

				// 	renderer.render( scene, camera );

				// } );
				
				// container.appendChild( renderer.domElement );

				const controls = new OrbitControls( camera, renderer.domElement );
				controls.enableZoom = false;

}

function createGeometry() {

	const geometry = new THREE.BoxGeometry( 2, 2, 2, 32, 32, 32 );

	// create an empty array to  hold targets for the attribute we want to morph
	// morphing positions and normals is supported
	geometry.morphAttributes.position = [];

	// the original positions of the cube's vertices
	const positionAttribute = geometry.attributes.position;

	// for the first morph target we'll move the cube's vertices onto the surface of a sphere
	const spherePositions = [];

	// for the second morph target, we'll twist the cubes vertices
	const twistPositions = [];
	const direction = new THREE.Vector3( 1, 0, 0 );
	const vertex = new THREE.Vector3();

	for ( let i = 0; i < positionAttribute.count; i ++ ) {

		const x = positionAttribute.getX( i );
		const y = positionAttribute.getY( i );
		const z = positionAttribute.getZ( i );

		spherePositions.push(

			x * Math.sqrt( 1 - ( y * y / 2 ) - ( z * z / 2 ) + ( y * y * z * z / 3 ) ),
			y * Math.sqrt( 1 - ( z * z / 2 ) - ( x * x / 2 ) + ( z * z * x * x / 3 ) ),
			z * Math.sqrt( 1 - ( x * x / 2 ) - ( y * y / 2 ) + ( x * x * y * y / 3 ) )

		);

		// stretch along the x-axis so we can see the twist better
		vertex.set( x * 2, y, z );

		vertex.applyAxisAngle( direction, Math.PI * x / 2 ).toArray( twistPositions, twistPositions.length );

	}

	// add the spherical positions as the first morph target
	geometry.morphAttributes.position[ 0 ] = new THREE.Float32BufferAttribute( spherePositions, 3 );

	// add the twisted positions as the second morph target
	geometry.morphAttributes.position[ 1 ] = new THREE.Float32BufferAttribute( twistPositions, 3 );
	

	return geometry;

}

function animation( time ) {

	// do not render if not in DOM:

	if( !renderer.domElement.parentNode ) return;

	mesh.rotation.x = time / 2000;
	mesh.rotation.y = time / 1000;

	mesh.morphTargetInfluences[ 0 ] = 0.1;
	mesh.morphTargetInfluences[ 1 ] = 1;

	renderer.render( scene, camera );

}

// respond to size changes:

function resize() {

	
	const container = renderer.domElement.parentNode;

	if( container ) {

		
		const width = container.offsetWidth;
		const height = container.offsetHeight;

		renderer.setSize( width, height );

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

	}

}

window.addEventListener( 'resize', resize );

resize();


// expose a function to interact with react.js:

export function mount( container ) {

	if( container ) {

		container.insertBefore( renderer.domElement, container.firstChild );
		resize();

	} else {

		renderer.domElement.remove();

	}

}