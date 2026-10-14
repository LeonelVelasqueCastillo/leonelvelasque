// Nombre de la clave usada para recordar quién inició sesión en este navegador.
const claveUsuario = 'nombreUsuario';

// Busca el formulario; solo existe en login.html, no en la página principal.
const formularioLogin = document.getElementById('formLogin');

// Cuentas de demostración aceptadas por el formulario de inicio de sesión.
const cuentas = [
	{ usuario: 'leonel', contrasena: 'Ginger' },
	{ usuario: 'francis', contrasena: 'Bro' },
	{ usuario: 'angel', contrasena: 'Papa' },
	{ usuario: 'jhonny', contrasena: 'Elmejorprofe2026' }
];

// Detecta en qué página estamos. En login.html prepara el formulario para validar
// las credenciales; en index.html busca la sesión y muestra al usuario.
function iniciarSesion() {
	if (formularioLogin) {
		// Al enviar el formulario, ejecuta la comprobación de usuario y contraseña.
		formularioLogin.addEventListener('submit', validarCredenciales);
		return;
	}

	// Si no estamos en el login, estamos en index.html y debemos revisar la sesión.
	mostrarUsuario();
}

// Evita el envío normal del formulario, compara el usuario y la contraseña con
// las cuentas permitidas y, si coinciden, guarda el usuario en localStorage
// y lo envía a index.html. Si no coinciden, muestra un error y limpia la contraseña.
function validarCredenciales(evento) {
	// Evita que el navegador recargue la página al enviar el formulario.
	evento.preventDefault();

	// Lee los campos, quitando espacios del usuario e ignorando sus mayúsculas.
	const usuarioEscrito = document.getElementById('usuario').value.trim().toLowerCase();
	const contrasenaEscrita = document.getElementById('password').value;
	const mensaje = document.getElementById('mensaje');

	// Busca una cuenta en la que coincidan usuario y contraseña.
	const cuentaValida = cuentas.find(function (cuenta) {
		return cuenta.usuario === usuarioEscrito && cuenta.contrasena === contrasenaEscrita;
	});

	if (!cuentaValida) {
		// Informa del error, borra la contraseña y devuelve el cursor a ese campo.
		mensaje.hidden = false;
		document.getElementById('password').value = '';
		document.getElementById('password').focus();
		return;
	}

	// Guarda el usuario para que index.html pueda reconocer y mostrar la sesión.
	localStorage.setItem(claveUsuario, cuentaValida.usuario);
	// Abre la página principal después de validar correctamente.
	window.location.href = 'index.html';
}

// Comprueba que exista un usuario guardado. Si no existe, vuelve al login;
// si existe, lo muestra en la página principal y activa el botón para cerrar sesión.
function mostrarUsuario() {
	// Recupera el nombre que se guardó al iniciar sesión.
	const nombreUsuario = localStorage.getItem(claveUsuario);
	if (!nombreUsuario) {
		// Si falta la sesión, impide continuar y vuelve al formulario de acceso.
		window.location.replace('login.html');
		return;
	}

	const nombre = document.getElementById('nombre');
	if (nombre) {
		// Inserta el nombre de usuario en el saludo del encabezado.
		nombre.textContent = nombreUsuario;
	}

	// Conecta el enlace de cerrar sesión con su función correspondiente.
	const botonCerrarSesion = document.getElementById('cerrarSesion');
	if (botonCerrarSesion) {
		botonCerrarSesion.addEventListener('click', cerrarSesion);
	}
}

// Cancela la navegación normal del enlace, elimina el usuario de localStorage
// y regresa a login.html para finalizar la sesión.
function cerrarSesion(evento) {
	// Evita seguir el enlace antes de limpiar el dato de sesión.
	evento.preventDefault();
	localStorage.removeItem(claveUsuario);
	// Vuelve al login, que pedirá las credenciales en el siguiente acceso.
	window.location.href = 'login.html';
}

// Ejecuta el flujo adecuado según la página donde se cargó este archivo.
iniciarSesion();
