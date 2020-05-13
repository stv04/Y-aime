// Este es el punto de entrada de tu aplicacion

import {registroPorEmail, registroConGoogle, acceder, 
	observador, postearAlgo, limitarGustos, restablecerClave} from './lib/index.js';
let nombre = document.getElementById('nombre'),
	apellido = document.getElementById('apellido'),
	clave = document.getElementById('clave'),
	claveConfirm = document.getElementById('clave-confirm'),
	email = document.getElementById('email'),
	ingresoEmail = document.getElementById('ingreso-email'),
	botonDeRegistro = document.getElementById('registrar'),
	ventanaDeRegistro = document.getElementById('seccion-de-registro');

//Registro del usuario
document.getElementById('google').addEventListener('click', registroConGoogle);

//manejo del dom de registro
botonDeRegistro.addEventListener('click', () =>  {
	let alerta = document.querySelectorAll('.msj-registro');
	for(let i = 0; i < alerta.length; i++){
		alerta[i].style.display = 'none';
	}
	if(nombre.value.length === 0 && apellido.value.length === 0){
		alerta[0].style.display = 'block';
	}else if(clave.value.length < 6) {
		alerta[1].style.display = 'block';
	} else {
		registroPorEmail()
		document.getElementById('restablecer-clave').style.display = 'none';
	}
	
})

claveConfirm.addEventListener('input', () => {
	if(clave.value !== claveConfirm.value && clave.value.length < 6) {
		botonDeRegistro.setAttribute('disabled', 'false');
	}else {
		botonDeRegistro.removeAttribute('disabled');
	}
});

clave.addEventListener('blur', () => {
	if(clave.value.length < 6) {
		document.querySelectorAll('.msj-registro')[1].style.display = 'block';
	} else {
		document.querySelectorAll('.msj-registro')[1].style.display = 'none';
	}
})
claveConfirm.addEventListener('blur', () => {
	if(clave.value !== claveConfirm.value){
		clave.style.borderColor = 'red';
		claveConfirm.style.borderColor = 'red';
		document.querySelectorAll('.msj-registro')[2].style.display = 'block'
	} else {
		clave.style.borderColor = 'green';
		claveConfirm.style.borderColor = 'green';
		document.querySelectorAll('.msj-registro')[2].style.display = 'none'
	}
});


document.getElementById('registrarse').addEventListener('click', () => {
	document.getElementById('seccion-de-registro').style.display = 'block';
	limitarGustos('nuevos-gustos');
})


//acceso del usuario
document.getElementById('acceder').addEventListener('click', acceder)

observador()

document.getElementById('close').addEventListener('click', () => {
	document.getElementById('seccion-de-registro').style.display = 'none';
})
document.getElementById('cerrar').addEventListener('click', () => {
		document.getElementById('seccion-emergente').style.display = 'none';
})

document.getElementById('restablecer-clave').addEventListener('click', () => {
	restablecerClave(ingresoEmail.value);
})



firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    if(user.emailVerified){
    	document.getElementById('publicar').addEventListener('click', () => {
	    	postearAlgo();
	    	});
    }
	    var displayName = user.displayName;
	    var email = user.email;
	    var emailVerified = user.emailVerified;
	    var photoURL = user.photoURL;
	    var isAnonymous = user.isAnonymous;
	    var uid = user.uid;
	    var providerData = user.providerData;
	    // ...
	    
	    document.querySelector('article').style.display = 'none';

  } else {
  	console.log('el usuario no esta conectado');
    // User is signed out.
    // ...
  }
})

// TESTEO DE PRUEBAS


	