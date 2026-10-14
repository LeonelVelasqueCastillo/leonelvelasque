// Obtiene un elemento HTML usando su identificador.
const porId = function (id) {
	return document.getElementById(id);
};

// Obtiene el primer elemento que coincide con un selector CSS.
const buscar = function (selector) {
	return document.querySelector(selector);
};

const modalCompra = porId('modalCompra');
const listaCarrito = porId('carritoItems');
const productosCarrito = [];
const IGV = 0.18;
const TASA_DESCUENTO = 0.10;
const CANTIDAD_MINIMA_DESCUENTO = 10;
let productoElegido = null;

// Muestra un importe en soles con dos decimales.
function mostrarPrecio(precio) {
	return `S/ ${Number(precio).toFixed(2)}`;
}

// Redondea un importe a dos decimales.
function redondear(valor) {
	return Number(valor.toFixed(2));
}

// Calcula unidades, subtotal, descuento, IGV incluido y total del carrito.
function calcularResumenCarrito() {
	// Acumula el precio publicado y las unidades de todos los productos.
	const datos = productosCarrito.reduce(function (resumen, producto) {
		resumen.total += producto.precio * producto.cantidad;
		resumen.cantidad += producto.cantidad;
		return resumen;
	}, { total: 0, cantidad: 0 });
	const subtotal = redondear(datos.total / (1 + IGV));
	const descuento = datos.cantidad > CANTIDAD_MINIMA_DESCUENTO
		? redondear(subtotal * TASA_DESCUENTO)
		: 0;
	const baseImponible = redondear(subtotal - descuento);
	const igv = redondear(baseImponible * IGV);

	return {
		cantidad: datos.cantidad,
		subtotal,
		igv,
		descuento,
		totalNeto: redondear(baseImponible + igv)
	};
}

// Actualiza en pantalla los importes del resumen del carrito.
function mostrarResumen(resumen) {
	[
		['subtotalCarrito', resumen.subtotal],
		['igvCarrito', resumen.igv],
		['descuentoCarrito', resumen.descuento],
		['totalNetoCarrito', resumen.totalNeto]
	].forEach(function ([id, valor]) {
		porId(id).textContent = mostrarPrecio(valor);
	});
}

// Abre o cierra un modal o panel y sincroniza su estado accesible.
function cambiarEstado(elemento, abierto) {
	elemento.classList.toggle('active', abierto);
	elemento.setAttribute('aria-hidden', String(!abierto));
}

// Dibuja los productos, el contador, los importes y la vista previa del carrito.
function actualizarCarrito() {
	const resumen = calcularResumenCarrito();
	buscar('.carrito-total').textContent = resumen.cantidad;

	if (productosCarrito.length === 0) {
		listaCarrito.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío.</p>';
		mostrarResumen(resumen);
		porId('carritoProductoPreview').classList.add('hidden');
		return;
	}

	// Convierte cada producto en una fila visible del carrito.
	listaCarrito.innerHTML = productosCarrito.map(function (producto, indice) {
		return `
			<div class="item-carrito">
				<img src="${producto.imagen}" alt="${producto.nombre}">
				<div class="item-carrito-info">
					<p class="nombre-item">${producto.nombre}</p>
					<p class="precio-item">${mostrarPrecio(producto.precio)} x ${producto.cantidad}</p>
				</div>
				<strong class="monto-item">${mostrarPrecio(producto.precio * producto.cantidad)}</strong>
				<button type="button" class="quitar-item" data-indice="${indice}" aria-label="Quitar producto">×</button>
			</div>`;
	}).join('');

	mostrarResumen(resumen);

	const ultimoProducto = productosCarrito[productosCarrito.length - 1];
	const vistaPrevia = porId('carritoProductoPreview');
	vistaPrevia.querySelector('img').src = ultimoProducto.imagen;
	vistaPrevia.querySelector('.carrito-preview-titulo').textContent = ultimoProducto.nombre;
	vistaPrevia.querySelector('.carrito-preview-precio').textContent = mostrarPrecio(ultimoProducto.precio);
	vistaPrevia.classList.remove('hidden');
}

// Cierra el comprobante del producto seleccionado.
function cerrarModalCompra() {
	cambiarEstado(modalCompra, false);
}

// Al pulsar "Pedir", guarda el producto seleccionado y abre su comprobante.
document.querySelectorAll('.pedido-btn').forEach(function (boton) {
	boton.addEventListener('click', function () {
		const tarjeta = this.closest('.producto-card');
		productoElegido = {
			nombre: this.dataset.producto,
			precio: Number(this.dataset.precio),
			imagen: tarjeta.querySelector('img').src
		};

		porId('modalNombreProducto').textContent = productoElegido.nombre;
		porId('modalCantidad').textContent = '1';
		porId('modalPrecio').textContent = mostrarPrecio(productoElegido.precio);
		porId('modalTotal').textContent = mostrarPrecio(productoElegido.precio);
		cambiarEstado(modalCompra, true);
	});
});

// Agrega el producto seleccionado al carrito y actualiza sus importes.
buscar('#modalCompra .btn-agregar').addEventListener('click', function () {
	if (productoElegido === null) {
		return;
	}

	productosCarrito.push({
		nombre: productoElegido.nombre,
		precio: productoElegido.precio,
		imagen: productoElegido.imagen,
		cantidad: 1
	});

	actualizarCarrito();
	cerrarModalCompra();
});

// Cierra el comprobante desde sus botones de cierre.
document.querySelectorAll('.cerrar-modal, #modalCompra .btn-cerrar').forEach(function (boton) {
	boton.addEventListener('click', cerrarModalCompra);
});

// Cierra el comprobante al pulsar fuera de su contenido.
modalCompra.addEventListener('click', function (evento) {
	if (evento.target === modalCompra) {
		cerrarModalCompra();
	}
});

// Abre el panel del carrito y actualiza su contenido.
buscar('.carrito-boton').addEventListener('click', function () {
	cambiarEstado(porId('carritoPanel'), true);
	actualizarCarrito();
});

// Cierra el panel lateral del carrito.
buscar('.cerrar-carrito').addEventListener('click', function () {
	cambiarEstado(porId('carritoPanel'), false);
});

// Quita del carrito el producto cuyo botón de eliminación se pulsó.
listaCarrito.addEventListener('click', function (evento) {
	if (evento.target.classList.contains('quitar-item')) {
		const indice = Number(evento.target.dataset.indice);
		productosCarrito.splice(indice, 1);
		actualizarCarrito();
	}
});

// Comparte las funciones y los datos que necesita el módulo del formulario.
window.DulceSaborCarrito = {
	productos: productosCarrito,
	calcularResumen: calcularResumenCarrito,
	mostrarPrecio,
	actualizar: actualizarCarrito,
	cambiarEstado
};

actualizarCarrito();
