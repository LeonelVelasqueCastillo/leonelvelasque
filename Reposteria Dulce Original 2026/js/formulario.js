 (function () {
	const carrito = window.DulceSaborCarrito;
	const modalPedido = document.getElementById('modalGracias');
	// Busca y devuelve un elemento HTML por su identificador.
	const porId = function (id) {
		return document.getElementById(id);
	};

	// Cierra el modal donde se muestran el formulario y la confirmación del pedido.
	function cerrarModalPedido() {
		carrito.cambiarEstado(modalPedido, false);
	}

	// Comprueba que el carrito tenga productos y abre el formulario del cliente.
	function abrirDatosCliente() {
		if (carrito.productos.length === 0) {
			alert('Tu carrito está vacío. Agrega un producto antes de finalizar.');
			return;
		}

		porId('formularioCliente').hidden = false;
		porId('confirmacionExito').classList.remove('visible');
		carrito.cambiarEstado(modalPedido, true);
		porId('nombreCliente').focus();
	}

	// Evita el envío normal del formulario y valida el nombre y el teléfono.
	// Si los datos son válidos, prepara el resumen del pedido y el mensaje de WhatsApp.
	function prepararPedido(evento) {
		evento.preventDefault();

		const campoNombre = porId('nombreCliente');
		const campoTelefono = porId('telefonoCliente');
		const nombre = campoNombre.value.trim();
		const telefono = campoTelefono.value.trim();
		const digitosTelefono = telefono.replace(/\D/g, '').length;

		campoNombre.setCustomValidity(nombre ? '' : 'Escribe el nombre del cliente.');
		campoTelefono.setCustomValidity(digitosTelefono >= 9 ? '' : 'Ingresa un teléfono con al menos 9 dígitos.');

		if (!evento.target.reportValidity()) {
			return;
		}

		const resumen = carrito.calcularResumen();
		const detallesPedido = carrito.productos.map(function (producto) {
			return `- ${producto.nombre} x ${producto.cantidad}: ${carrito.mostrarPrecio(producto.precio * producto.cantidad)}`;
		});
		const mensaje = [
			'Hola, quiero realizar este pedido:',
			`Cliente: ${nombre}`,
			`Número de contacto: ${telefono}`,
			'Pedido:',
			...detallesPedido,
			`Subtotal (sin IGV): ${carrito.mostrarPrecio(resumen.subtotal)}`,
			`IGV incluido: ${carrito.mostrarPrecio(resumen.igv)}`,
			`Descuento: ${carrito.mostrarPrecio(resumen.descuento)}`,
			`Total neto: ${carrito.mostrarPrecio(resumen.totalNeto)}`,
			'Por favor, avísenme a este número cuando esté listo.'
		].join('\n');

		porId('nombreClienteConfirmacion').textContent = nombre;
		porId('totalCompraConfirmada').textContent = carrito.mostrarPrecio(resumen.totalNeto);
		porId('enlaceWhatsappPedido').href =
			'https://wa.me/51912478167?text=' + encodeURIComponent(mensaje);

		evento.target.hidden = true;
		porId('confirmacionExito').classList.add('visible');
		carrito.productos.length = 0;
		carrito.actualizar();
		carrito.cambiarEstado(porId('carritoPanel'), false);
	}

	// Al pulsar "Finalizar", abre el formulario de datos del cliente.
	document.querySelector('.boton-finalizar').addEventListener('click', abrirDatosCliente);
	// Al enviar el formulario, valida los datos y muestra la confirmación del pedido.
	porId('formularioCliente').addEventListener('submit', prepararPedido);
	// Los botones de cerrar y cancelar ocultan el modal del pedido.
	porId('btnCerrarGracias').addEventListener('click', cerrarModalPedido);
	porId('btnCancelarCheckout').addEventListener('click', cerrarModalPedido);

	// Cierra el modal si se hace clic en el fondo, fuera de su contenido.
	modalPedido.addEventListener('click', function (evento) {
		if (evento.target === modalPedido) {
			cerrarModalPedido();
		}
	});

	// Al editar el nombre o el teléfono, borra el mensaje de validación anterior.
	['nombreCliente', 'telefonoCliente'].forEach(function (id) {
		porId(id).addEventListener('input', function () {
			this.setCustomValidity('');
		});
	});

	// Cierra el modal cuando el cliente pulsa el enlace para continuar en WhatsApp.
	porId('enlaceWhatsappPedido').addEventListener('click', cerrarModalPedido);
})();
