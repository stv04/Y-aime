// aqui exportaras las funciones que necesites
let currUser = firebase.auth().currentUser,
	gustosPropios = [];
	if(currUser) {
		
	}
	

//Funciones de Acceso y registro
export function acceder() {
	let email = document.getElementById('ingreso-email').value;
	let password = document.getElementById('ingreso-clave').value;
	document.querySelector('.msj-ingreso').style.display = 'none';
	firebase.auth().signInWithEmailAndPassword(email, password)
	.catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  switch(errorCode) {
  	case 'auth/invalid-email':
  	//mala direccion de correo
  		document.querySelector('.msj-ingreso').textContent ='El email ingresado no es '
  		+ 'válido.';
  		document.querySelector('.msj-ingreso').style.display = 'block';
  	break;
  	case 'auth/user-not-found':
  	//No existe usuario
  		document.querySelector('.msj-ingreso').textContent ='El usuario ingresado '
  		+ 'no existe...';
  		document.querySelector('.msj-ingreso').style.display = 'block';
  	break;
  	case 'auth/wrong-password':
  	//clave Invalida
  		document.querySelector('.msj-ingreso').textContent ='La contraseña ingresada no es' 
  		+ ' válida.';
  		document.querySelector('.msj-ingreso').style.display = 'block';
  		document.querySelector('#restablecer-clave').textContent = 'Restablecer contraseña';
  		document.querySelector('#restablecer-clave').style.cursor = 'pointer';
  		document.querySelector('#restablecer-clave').style.display = 'block';
  	break;
  }
  // ...
});
}

function singOut() {
	document.getElementById('cerrar-sesion').addEventListener('click', () => {
		firebase.auth().signOut().then(function() {
  			// Sign-out successful.
  			location.reload();
		}).catch(function(error) {
  		// An error happened.
		});	
	})
}	
	

export function registroPorEmail() {
	let email = document.getElementById('email').value,
	password = document.getElementById('clave').value
	

	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then(() => {
		cambiarPerfilDeUsuario('nombre', 'apellido');
		subirGustos();
		document.getElementById('seccion-de-registro').style.display = 'none';
	})
	.then(() => {
		let nuevoUsusario = db.collection('users');
		let datosBasicos = firebase.auth().currentUser;
		nuevoUsusario.doc(datosBasicos.uid).set({
			id: datosBasicos.uid,
			name: datosBasicos.displayName,
			foto: 'https://d500.epimg.net/cincodias/imagenes/2016/07/04/lifestyle/1467646262_522853_1467646344_noticia_normal.jpg'
		})
	}).then(() => {
		mensajeDeVerificacion();
	})
	.catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  switch(errorCode) {
	  	case "auth/invalid-email":
	  	document.querySelectorAll('.msj-registro')[3].textContent = `Ausencia de 
	  	correo electrónico válido`;
	  	document.querySelectorAll('.msj-registro')[3].style.display = 'block';
	  	break;
	  	case "auth/email-already-in-use":
	  	document.querySelectorAll('.msj-registro')[3].textContent = `La direccion de
	  	correo ya está en uso`;
	  	document.querySelectorAll('.msj-registro')[3].style.display = 'block';
	  }
	  
	  console.log(error);
	  // ...
});
	
}

export function registroConGoogle() {
	let provider = new firebase.auth.GoogleAuthProvider();
	firebase.auth().signInWithPopup(provider)
	.then(function(result) {
  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = result.credential.accessToken;
  // The signed-in user info.
  var user = result.user;
  document.getElementById('seccion-de-registro').style.display = 'none';
  // ...
	}).then(() => {
		let nuevoUsusario = db.collection('users');
		let datosBasicos = firebase.auth().currentUser;
		nuevoUsusario.doc(datosBasicos.uid).set({
			id: datosBasicos.uid,
			name: datosBasicos.displayName
		})
	}).catch(function(error) {
  	// Handle Errors here.
  		var errorCode = error.code;
  		var errorMessage = error.message;
  	// The email of the user's account used.
  		var email = error.email;
  	// The firebase.auth.AuthCredential type that was used.
  		var credential = error.credential;
  	// ...
});

function accederConGoogle() {
	firebase.auth().signInWithRedirect(provider);
	}}


//funciones de manipulacion de publicaciones
export function observador() {
	firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    console.log('el usuario esta conectado');
	    var displayName = user.displayName;
	    var email = user.email;
	    var emailVerified = user.emailVerified;
	    var photoURL = user.photoURL;
	    var isAnonymous = user.isAnonymous;
	    var uid = user.uid;
	    var providerData = user.providerData;
	    ventanaDeUsuario(user);
	    singOut();

    if(emailVerified){
	        db.collection('users').doc(uid).get()
			.then((doc) => {
				if(doc.data().gustos === undefined){
					let ventanaEditora = document.getElementById('seccion-emergente');
					ventanaEditora.innerHTML = `<h2>Algo anda mal</h2>
					<p>para acceder a todas las herramientas disponibles para ti, 
					escoje al menos una cosa que te guste y reinicia la pagina.<br><br>
					Espera un momento! te ayudaremos a resolverlo...</p>`;
					ventanaEditora.style.display = 'block';
					document.getElementById('publicar').setAttribute('disabled', '');
					setTimeout(editarPerfil, 10000);
				} else {
					doc.data().gustos.forEach((gusto) => {
						gustosPropios.push(gusto);
					})	
				}
				
			}).then(obtenerPublicaciones);
		} else {
			console.log(document.querySelector('#seccion-emergente'));
			document.querySelector('#seccion-emergente').innerHTML = `
		<h2>Ups! Al parecer esta cuenta aún no está verificada, por favor, revise su 
		bandeja	de entrada del correo electrónico para verificar la cuenta, luego 
		vuelva y recargue la página.</h2>`;
			document.querySelector('#seccion-emergente').style.display = 'block';
		}
	    
    // ...
  } else {
  	console.log('el usuario no esta conectado');
    // User is signed out.
    // ...
  }
});

}

function ventanaDeUsuario(user) {
	header(user);
	const registro = document.querySelector('section');
	let paraPostear = document.createElement('div');	
	let posters = document.createElement('div');	
	let idButtonInput = 'enlace-al-input';
	let idDelInput = 'archivo-a-publicar';
	
	posters.setAttribute('id', 'posters');
	paraPostear.innerHTML = `
		<h2>Bienvenido ${user.displayName}</h2>
		<textarea id='texto-a-publicar'>Escribe lo que deseas publicar a tu grupo
		</textarea><br>
		<input type='file' id='archivo-a-publicar' accept='image/*'
		name="archivos" style='display: none'>
		<button id='${idButtonInput}' class='btn-orange'>Agrega Imagen</button>
		<button id='publicar'>Publicar</button><br>`

	paraPostear.style.minWidth = '60%';
	document.body.appendChild(paraPostear);
	document.body.appendChild(posters);
	let texto = document.getElementById('texto-a-publicar')
	texto.addEventListener('focus', () => {
		texto.textContent = '';
	})


	let botonInput = document.getElementById(idButtonInput);
	botonInput.addEventListener('click', () => {
		document.getElementById(idDelInput).click();
	})
	document.getElementById(user.uid)
	.addEventListener('click', () => {
		obtenerPublicaciones(user)
	});
	let imagen = document.getElementById('archivo-a-publicar');
	imagen.addEventListener('change', () => {
		console.log(imagen.files[0].name)
		if(imagen.files.length > 0){
			botonInput.textContent = imagen.files[0].name;
		}
	})
	
}

function obtenerPublicaciones(user) {
	let publicaciones = db.collection("publicaciones").orderBy('organizador', 'desc')
		.limit(20)
	publicaciones.get().then((querySnapshot) => {
		let posters = document.getElementById('posters');
		posters.innerHTML = '';
		let capturarPublicacion = [];
    querySnapshot.forEach((doc) => {
    	if(user !== undefined){
    		if(doc.data().idDelPublicador === user.uid){
        	publicacionesDelPerfil(posters, doc);
    		capturarPublicacion.push(doc.id);
    		}
    	} else {
			for(let meGusta of doc.data().gustosDelPublicador){
				switch(meGusta) {
					case gustosPropios[0]:
						publicacionesDelMuro(posters, doc);
        				capturarPublicacion.push(doc.id);
					break;
					case gustosPropios[1]:
						publicacionesDelMuro(posters, doc);
        				capturarPublicacion.push(doc.id);  
					break;
					case gustosPropios[2]:
						publicacionesDelMuro(posters, doc);
        				capturarPublicacion.push(doc.id);  
					break;
				}
				if(meGusta == gustosPropios[0] || meGusta == gustosPropios[1] || 
					meGusta == gustosPropios[2]) {
					break;
				}
			}      		
    	}	
    }); 
    
    capturarPublicacion.forEach((publicacion) => {
    	let post = document.getElementById(publicacion + 'post'),
    		botonMeGusta = document.getElementById(publicacion + 'like'),
    		like = db.collection('publicaciones').doc(publicacion).collection('likes')
    		.doc(firebase.auth().currentUser.uid),
    		cargarPost = db.collection('publicaciones').doc(publicacion);
    	
    	cargarPost.get().then((doc) => {
    		if(doc.data().imagen){
        		obtenerImagen('publicaciones', post, doc.id)
	    	}
    	})

    	like.get().then((doc) => {
    		if(doc.data() === undefined){	
    			botonMeGusta.textContent = 'No me Gusta';
    			botonMeGusta.classList.remove('btn-orange')
    		} else {
    			botonMeGusta.textContent = 'Me Gusta';
    			botonMeGusta.classList.add('btn-orange');
    		}    		
    	})
    	botonMeGusta.addEventListener('click', () => {
    		let usuarioActivo = firebase.auth().currentUser.uid;
    		if(botonMeGusta.textContent === 'Me Gusta'){
    			console.log('like');
    			manejadorDeLikes(publicacion, -1, usuarioActivo);
    			botonMeGusta.textContent = 'No Me Gusta';
    			botonMeGusta.classList.remove('btn-orange');
    		} else {
    			console.log('dislike');
    			manejadorDeLikes(publicacion, 1, usuarioActivo);
    			botonMeGusta.textContent = 'Me Gusta';
    			botonMeGusta.classList.add('btn-orange');
    		}	
    	});

    	if(user !== undefined){
    	optionsPost(publicacion);
    	}
    });		  
});
}

function publicacionesDelMuro(posters, doc){
	posters.innerHTML += `
        <div id='${doc.id}post' class='post'>
        <div>
        <h3 id='${doc.id}nombre'>${doc.data().nombreDeUsuario}<br>
        <em>Publicado el ${doc.data().fecha}<br>A las ${doc.data().hora}</em>
        </h3><img src='${doc.data().fotoDelPublicador}' width='60px' height='60px'>
        </div>
        <p style='margin-top: 0px'>${doc.data().post}</p>
        <h5 style='text-align: end; margin: 0px'>Esta publicacion tiene: 
        ${doc.data().likes} Me Gusta</h5>
        </div>`;
        let button = document.createElement('button');
        button.setAttribute('id', doc.id+'like');
        document.getElementById(doc.id+'post').appendChild(button);

}

function publicacionesDelPerfil(posters, doc) {
	posters.innerHTML += `
        <div id='${doc.id}post' class='post'>
        <span>...</span>
        <div><h3 id='${doc.id}nombre'>${doc.data().nombreDeUsuario}<br>
        <em>Publicado el ${doc.data().fecha}<br>A las ${doc.data().hora}</em>
        </h3><img src='${doc.data().fotoDelPublicador}' width='60px' height='60px'>
        </div>
        <p style='margin-top: 0px'>${doc.data().post}</p>
        <h5 style='text-align: end'>Tienes: ${doc.data().likes} Me Gusta</h5>
        </div>`;
        let button = document.createElement('button');
        	button.setAttribute('id', doc.id+'like');
        	button.style.marginBottom = '30px';
        posters.appendChild(button);


}

export function postearAlgo(nombre, uid){
	let textoAPublicar = document.getElementById('texto-a-publicar').value,
		foto = firebase.auth().currentUser.photoURL;
	nombre = nombre || firebase.auth().currentUser.displayName;
	uid = uid || firebase.auth().currentUser.uid;
	let f = new Date();
	let meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 
				'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
	db.collection("publicaciones").add({
    	nombreDeUsuario: nombre, 
    	post: textoAPublicar,
    	fecha: `${f.getDate()} De ${meses[f.getMonth()]} Del ${f.getFullYear()}`,
    	hora: `${f.getHours()} : ${f.getMinutes()}`,
    	organizador: f.getTime(),
    	idDelPublicador: uid,
    	fotoDelPublicador: foto,
    	gustosDelPublicador: gustosPropios,
    	likes: 0
	})
	.then(function(docRef) {
    	console.log("Document written with ID: ", docRef.id);
    	let imagen = document.getElementById('archivo-a-publicar');
		let file = imagen.files;
		if(file.length > 0) {
			agregarImagen('publicaciones', docRef.id, 'enlace-al-input');
			db.collection("publicaciones").doc(docRef.id).update({
				imagen:true
			})
		}
	})
	.catch(function(error) {
    	console.error("Error adding document: ", error);
	});	
}


function editarPublicacion(docu) {
	var docRef = db.collection("publicaciones").doc(docu);

	docRef.get().then(function(doc) {
    if (doc.exists) {
    	
		let editor = document.querySelector('#seccion-emergente');
		editor.style.display = 'block';
		editor.innerHTML = `
		<span style="float: right;" id="cerrar">&times;</span>
		<textarea id='actualizar-post'>${doc.data().post}</textarea>
		<button id='nueva-imagen'>Actualizar imagen</button>
		<button id='edicion-completa'>Enviar</button>`;
        
        document.getElementById('cerrar').addEventListener('click', () => {
			document.getElementById('seccion-emergente').style.display = 'none';
		})

		let botonInput = document.getElementById('nueva-imagen');
		botonInput.addEventListener('click', () => {
			document.getElementById('archivo-a-publicar').click();
		})

		let imagen = document.getElementById('archivo-a-publicar');
		imagen.addEventListener('change', () => {
			if(imagen.files.length > 0){
				botonInput.textContent = imagen.files[0].name;
			}
		})

		document.getElementById('edicion-completa')
		.addEventListener('click', () => {
			let nuevoPost = document.getElementById('actualizar-post').value;
			db.collection("publicaciones").doc(docu).update({ 
    			post: nuevoPost
			})
			.then(function() {
    			console.log("Document successfully written!");
    			console.log('nuevo post ' + doc.data().post);
    			let imagen = document.getElementById('archivo-a-publicar');
				let file = imagen.files;
				if(file.length > 0) {
					agregarImagen('publicaciones', docRef.id, 'nueva-imagen');
				}
    			document.getElementById('seccion-emergente').style.display = 'none';
			})
			.catch(function(error) {
    			console.error("Error writing document: ", error);
			});
			
		})
    } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
    }
	}).catch(function(error) {
   	 console.log("Error getting document:", error);
	});	
}

function eliminarPublicacion(docu) {
	var cityRef = db.collection('publicaciones').doc(docu);

	// Remove the 'capital' field from the document
	var removeData = cityRef.update({
    	fecha: firebase.firestore.FieldValue.delete(),
    	hora: firebase.firestore.FieldValue.delete(),
    	idDelPublicador: firebase.firestore.FieldValue.delete(),
    	nombreDeUsuario: firebase.firestore.FieldValue.delete(),
    	organizador: firebase.firestore.FieldValue.delete(),
    	post: firebase.firestore.FieldValue.delete()
	});

	cityRef.delete()
	.then(function() {
    	console.log("Document successfully deleted!");
	}).catch(function(error) {
    	console.error("Error removing document: ", error);
	});
}
function optionsPost(doc) {
    let option = document.getElementById(doc+'post').querySelector('span');
    option.addEventListener('click', ($event) => {
    	if(option.textContent === '...'){
    		option.innerHTML = `
		    	<div style='display: flex'>
			        <button id='${doc}edit' style='margin-right: 30px;'>Editar</button>
			        <button id='${doc}delete' class='btn-orange'>Eliminar</button>
			    </div>
		    	`;

		    	document.getElementById(doc + 'edit').addEventListener('click', () => {
		    		editarPublicacion(doc);
		    	});	

		    	document.getElementById(doc + 'delete').addEventListener('click', () => {
		    		ventanaDeConfirmacion(doc);
	    		});	
	    	option.style.cursor = 'zoom-out';
    	} else {
    		option.textContent = '...';
    		option.style.cursor = 'zoom-in';
    	}
    });
}


function agregarImagen(tipo, id, boton) {
	
	let archivo = document.getElementById('archivo-a-publicar');
	let file = archivo.files[0];
	let storageRef = storage.ref();
	let ref = storageRef.child(tipo + '/' + id + '/' +  'imagen');

	ref.put(file).then(function(snapshot) {
	  console.log('Uploaded a blob or file!');
	  let botonInput = document.getElementById(boton);
	  botonInput.textContent = 'Imagen publicada';
	  setTimeout(() => {
	  	botonInput.textContent = 'Agregar Imagen';
	  }, 4000)
	  document.getElementById('archivo-a-publicar').value = '';
	});
}

function obtenerImagen(tipo, poster, id) {
	let storageRef = storage.ref();
	let ubicacionDeImagen = storageRef.child(tipo + '/' + id + '/' + 'imagen');

	ubicacionDeImagen.getDownloadURL().then(function(url) {
	  // Or inserted into an <img> element:
	  let img = document.createElement('img');
	  img.src = url;
	  img.setAttribute('style', 'width: 80%; heigth: 300px');
	  poster.appendChild(img);	  
	}).catch(function(error) {
	  // Handle any errors
	  console.log(error);
	});
}


//fuciones de manipulacionde Datos de Usuario

function cambiarPerfilDeUsuario(dato1, dato2, foto){
	let user = firebase.auth().currentUser,
		nombre = document.getElementById(dato1).value;
		let apellido = '';
		if( dato2 === 'apellido'){
			apellido = document.getElementById(dato2).value;
		}
		console.log(apellido);
	foto = foto || 'https://d500.epimg.net/cincodias/imagenes/2016/07/04/lifestyle/1467646262_522853_1467646344_noticia_normal.jpg';
	user.updateProfile({
  		displayName: nombre + ' ' + apellido,
  		photoURL: foto
	}).then(function() {
  // Update successful.
  		console.log('cambio de nombre registrado con exito');
  		let nuevoUsusario = db.collection('users');
		let datosBasicos = firebase.auth().currentUser;
		nuevoUsusario.doc(datosBasicos.uid).update({
			name: datosBasicos.displayName
		})
	}).catch(function(error) {
		console.log(error);
  // An error happened.
	});
}

function header(user){
	const header = document.querySelector('header');
	header.innerHTML = `
		<h1 style="float: left; width: 40%;" id='ir-ventanaPricipal'>Y'aime</h1>
		<div class='perfil' id='${user.uid}'>
		<h2>${user.displayName}</h2>
		<img src='${user.photoURL}' width='80px' height='100px' style='margin: 5px'></div>
		<div><button id='editar-perfil'>Editar perfil</button>
		<button id='cerrar-sesion' class='btn-orange'>Cerrar Sesion</button></div>`
	document.getElementById('ir-ventanaPricipal')
	.addEventListener('click', () => {
		obtenerPublicaciones();
	})
	document.getElementById('editar-perfil')
	.addEventListener('click', editarPerfil)
}

function irA(callback) {
	firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
    callback();

    // ...
  } else {
  	console.log('el usuario no esta conectado');
    // User is signed out.
    // ...
  }
}); }

function editarPerfil() {
	let ventanaEditora = document.getElementById('seccion-emergente');
	let datos = firebase.auth().currentUser;
	
	ventanaEditora.innerHTML = `
	<span style="float: right;" id="cerrar">&times;</span>
	<label for='edit-nombre'>Nombe y Apellido</label>
	<input type='text' id='edit-nombre' value='${datos.displayName}' class='input input-corto'>
	<h3>Editar Gustos</h3>
	<div id='editar-gustos' class='gustos'>${gustos()}</div>
	<button id='cambiar-clave' class='btn-orange'>Cambiar contraseña</button>
	<button id='foto-de-perfil' class='btn-orange'>Cambiar Foto</button><br>
	<button id='cancelar'>Cancelar</button>
	<button id='actualizar-perfil'>Actualizar perfil</button>
	`;
	ventanaEditora.style.display = 'block';
	limitarGustos('editar-gustos');
	let botonInput = document.getElementById('foto-de-perfil'),
		imagen = document.getElementById('archivo-a-publicar')

	document.getElementById('cambiar-clave').addEventListener('click', editarClave)

	botonInput.addEventListener('click', () => {
		imagen.click();
	})
	imagen.addEventListener('change', () => {
		botonInput.textContent = imagen.files[0].name;
	})
	document.getElementById('cerrar').addEventListener('click', () => {
		ventanaEditora.style.display = 'none';
	})
	document.getElementById('cancelar').addEventListener('click', () => {
		ventanaEditora.textContent = 'CANCELADO';
		setTimeout(() => {
			ventanaEditora.style.display = 'none';	
		}, 3000)
	})
	document.getElementById('actualizar-perfil').addEventListener('click', () => {
		
		let file = imagen.files;
		if(file.length > 0) {
			agregarImagen('Fotos de Perfil', datos.uid, 'foto-de-perfil');
			let storageRef = storage.ref();
			storageRef.child('Fotos de Perfil' + '/' + datos.uid + '/' + 'imagen')
			.getDownloadURL().then(function(url) {
	  		// Or inserted into an <img> element:
	  			cambiarPerfilDeUsuario('edit-nombre', 'nada' , url);
	  			subirGustos();

			}).catch(function(error) {
	  		// Handle any errors
	  
			});
		} else {
			cambiarPerfilDeUsuario('edit-nombre', 'nada');
			subirGustos();
		}
		ventanaEditora.style.display = 'none';
	})
}

function ventanaDeConfirmacion(docu) {
	console.log('ventanaEmergente')
	let ventanaEmergente = document.getElementById('seccion-emergente');
	ventanaEmergente.innerHTML = `
	<span style="float: right;" id="cerrar">&times;</span>
	<h2>Advertencia!</h2>
	<p>Si eliminas este contenido, no podras recuperarlo de ninguna manera.<br>
	Deseas continuar?</p>
	<button id='cerrar2'>Cancelar</button>
	<button id='eliminar-post'>Continuar</button>`;
	ventanaEmergente.style.display = 'block';
	document.getElementById('cerrar').addEventListener('click', () => {
		ventanaEmergente.style.display = 'none';
	});
	document.getElementById('cerrar2').addEventListener('click', () => {
		ventanaEmergente.style.display = 'none';
	})
	document.getElementById('eliminar-post').addEventListener('click', () => {
		eliminarPublicacion(docu);
		ventanaEmergente.style.display = 'none';
	})
}


//funciones importantes para el desarrolo de la app
function manejadorDeLikes(docu, l, user) {
	var like = db.collection('publicaciones').doc(docu).collection('likes');
	let likeCount = db.collection('publicaciones').doc(docu);
	let usuario = db.collection('users').doc(user);
	usuario.get().then((doc) => {
		if(l === 1) {
			like.doc(user).set({
				estado: 'A ' + doc.data().name + ' le gusta tu publicacion'
			})
		} else {
			like.doc(user).update({
				estado: firebase.firestore.FieldValue.delete()
			})
			like.doc(user).delete()
		}
		
	})
	
	

	// Atomically increment the population of the city by 50.
	likeCount.update({
    	likes: firebase.firestore.FieldValue.increment(l)
	});
}

function gustos() {
	let gustos = `
		<label><input type='checkbox' id='musica' value='Musica'>Musica</label>
		<label><input type='checkbox' id='moda' value='Moda'>Moda</label>
		<label><input type='checkbox' id='comida' value='Comida'>Comida</label>
		<label><input type='checkbox' id='marketing' value='Marketing'>Marketing</label>
		<label><input type='checkbox' id='autos-motos' value='Autos y Motos'>Autos y Motos</label>
		<label><input type='checkbox' id='arte' value='Arte'>Arte</label>
		<label><input type='checkbox' id='belleza' value='Belleza'>Belleza</label>
		<label><input type='checkbox' id='tecnologia' value='Tecnologia'>Tecnologia</label>
		<label><input type='checkbox' id='deportes' value='Deportes'>Deporte</label>
		<label><input type='checkbox' id='literatura' value='Literatura'>Literatura</label>
		<label><input type='checkbox' id='hogar' value='Hogar'>Hogar</label>
		<label><input type='checkbox' id='cine' value='Cine'>Cine</label>
		<label><input type='checkbox' id='religion' value='Religion'>Religión</label>
		<label><input type='checkbox' id='ciencias' value='Ciencias'>Ciencias</label>
		<label><input type='checkbox' id='naturaleza' value='Naturaleza'>Naturaleza</label>
	`
	return gustos;
}

export function limitarGustos(editor) {
	editor = editor;
	let contador = 0;
	let selectores = document.querySelector('#' + editor).children;
	for(let i = 0; i < selectores.length; i++){
		selectores[i].children[0].checked = false;
	}
	document.querySelector('#' + editor).addEventListener('change', ($event) => {
		if($event.target.checked === true){
			contador++;
			$event.target.classList.add('seleccionado');
		} else if ($event.target.checked === false) {
			$event.target.classList.remove('seleccionado')
			contador--;
		}

		if(contador > 3){
			$event.target.checked = false;
			contador--
		}
	})
}

function subirGustos() {
	let user = firebase.auth().currentUser,
		gustosSeleccionados = document.querySelectorAll('.seleccionado'),
		arreglosDeGustos = [];
	for (let i = 0; i < gustosSeleccionados.length; i++){
		arreglosDeGustos.push(gustosSeleccionados[i].value)
	}

	if(arreglosDeGustos.length !== 0){
		user.updateProfile({
  		gustos: arreglosDeGustos
	}).then(function() {
  // Update successful.
  		console.log('Tus gustos se han subido con exito');
  		let nuevoUsusario = db.collection('users');
		let datosBasicos = firebase.auth().currentUser;
		nuevoUsusario.doc(datosBasicos.uid).update({
			gustos: arreglosDeGustos
		})
	}).then(() => {irA(obtenerPublicaciones)}).catch(function(error) {
		console.log(error);
  // An error happened.
	});
	} 	
}

function mensajeDeVerificacion() {
	var user = firebase.auth().currentUser;
	user.sendEmailVerification().then(function() {
	  // Email sent.
	  document.getElementById('seccion-emergente').innerHTML = `
		<h2>Su cuenta ha sido creada Exitósamente, para continuar con su registro,
		dirigase a la bandeja de entrada para autenticar su cuenta, luego vuelva
		y recargue la página.</h2>`
	}).catch(function(error) {
	  // An error happened.
	  console.log(error)
	});
}

function configurarClave(nuevaClave) {
	var user = firebase.auth().currentUser;
	var newPassword = nuevaClave;

	user.updatePassword(newPassword).then(function() {
	  // Update successful.
	  let notificador = document.getElementById('seccion-emergente');
		notificador.innerHTML = `<h2>
		Su clave se ha cambiado de manera Exitosa!</h2>`;
	  	notificador.style.display = 'block';
	  	setTimeout(() => {
	  		notificador.style.display = 'none';
	  	}, 4000);
	}).catch(function(error) {
	  // An error happened.
	  let notificador = document.getElementById('seccion-emergente');
		notificador.innerHTML = `<h2>Por motivos de seguridad, para poder cambiar 
		la clave, es necesario haber iniciado sesion recientemente.</h2>`;
	  	notificador.style.display = 'block';
	  	setTimeout(() => {
	  		notificador.style.display = 'none';
	  	}, 4000);
	});
}

function editarClave() {
	let ventanaEditora = document.getElementById('seccion-emergente');
	ventanaEditora.innerHTML = `
		<span style="float: right;" id="cerrar">&times;</span>
		<label for='nueva-clave'>Ingresa tu nueva contraseña</label>
		<input type='password' id='nueva-clave' class='input input-corto'><br>
		<label for='confirmar-nueva-clave'>Confirmar contraseña</label>
		<input type='password' id='confirmar-nueva-clave' class='input input-corto'><br>
		<button id='cambio-de-clave' disabled=''>OK</button>
	`

	let nuevaClave = document.getElementById('nueva-clave'),
		nuevaClaveConfirm = document.getElementById('confirmar-nueva-clave'),
		nuevaClaveButton = document.getElementById('cambio-de-clave');

	nuevaClaveConfirm.addEventListener('input', () => {
		if (nuevaClave.value.length < 6 || nuevaClaveConfirm.value.length < 6) {
			nuevaClaveButton.setAttribute('disabled', '');
		} else {
			nuevaClaveButton.removeAttribute('disabled')
		}

		if(nuevaClave.value === nuevaClaveConfirm.value) {
			nuevaClave.style.borderColor = 'green';
			nuevaClaveConfirm.style.borderColor = 'green';
		} else {
			nuevaClave.style.borderColor = 'red';
			nuevaClaveConfirm.style.borderColor = 'red';
		}
	})
		
	nuevaClaveButton.addEventListener('click', () => {
		configurarClave(nuevaClave.value);
	})

	document.getElementById('cerrar').addEventListener('click', () => {
		ventanaEditora.style.display = 'none';
	})
}


export function restablecerClave(email){
	var auth = firebase.auth();
	let emailAddress = email;
	console.log()
	auth.sendPasswordResetEmail(emailAddress).then(function() {
	  // Email sent.
		let notificador = document.getElementById('seccion-emergente');
		notificador.innerHTML = `<h2>
		Se ha enviado exitósamente un correo electrónico a ${email} para
	  restablecer la contraseña...</h2>`;
	  	notificador.style.display = 'block';
	  	setTimeout(() => {
	  		notificador.style.display = 'none';
	  	}, 4000);
	}).catch(function(error) {
	  // An error happened.

	  let errorCode = error.code;
	  switch(errorCode) {
	  	case 'auth/invalid-email':
	  		document.querySelector('.msj-ingreso').textContent ='El email ingresado no es '
	  		+ 'válido.';
	  		document.querySelector('.msj-ingreso').style.display = 'block';
	  	break;
	  	case 'auth/user-not-found':
	  		document.querySelector('.msj-ingreso').textContent ='El usuario ingresado '
	  		+ 'no existe...';
	  		document.querySelector('.msj-ingreso').style.display = 'block';
	  	break;
	  	default: 
	  		document.querySelector('.msj-ingreso').textContent ='Algo anda mal, por '
	  		+ 'favor, verifique los datos ingresados.';
	  		document.querySelector('.msj-ingreso').style.display = 'block';
	  }
	}); 
}