document.addEventListener('DOMContentLoaded', () => {
	// ALMACENAMIENTO Y UTILIDADES COMPARTIDAS
	const claveAlmacenSolicitudes = 'templo-coba-solicitudes';
	const cargarSolicitudes = () => {
		try {
			return JSON.parse(window.localStorage.getItem(claveAlmacenSolicitudes)) || [];
		} catch (error) {
			return [];
		}
	};
	const guardarSolicitudes = (solicitudes) => {
		window.localStorage.setItem(claveAlmacenSolicitudes, JSON.stringify(solicitudes));
	};
	const establecerBotonActivo = (botones, botonActivo) => {
		botones.forEach((boton) => {
			const estaActivo = boton === botonActivo;
			boton.classList.toggle('activo', estaActivo);
			boton.setAttribute('aria-selected', String(estaActivo));
		});
	};
	// CARRUSEL DE ACTIVIDADES
	const carrusel = document.querySelector('.ventana-actividades');
	if (carrusel) {
		const diapositivas = [...carrusel.querySelectorAll('.tarjeta-actividad')];
		const botonAnterior = carrusel.querySelector('.flecha-carrusel-anterior');
		const botonSiguiente = carrusel.querySelector('.flecha-carrusel-siguiente');
		let diapositivaActual = 0;
		let temporizador;
		const mostrarDiapositiva = (indiceDiapositiva) => {
			diapositivaActual = (indiceDiapositiva + diapositivas.length) % diapositivas.length;
			diapositivas.forEach((diapositiva, indice) => {
				diapositiva.classList.toggle('activo', indice === diapositivaActual);
			});
		};
		const reiniciarTemporizador = () => {
			window.clearInterval(temporizador);
			temporizador = window.setInterval(() => mostrarDiapositiva(diapositivaActual + 1), 4000);
		};
		botonAnterior.addEventListener('click', () => {
			mostrarDiapositiva(diapositivaActual - 1);
			reiniciarTemporizador();
		});
		botonSiguiente.addEventListener('click', () => {
			mostrarDiapositiva(diapositivaActual + 1);
			reiniciarTemporizador();
		});
		reiniciarTemporizador();
	}
	// SOLICITUDES Y CONTACTO
	const formularioMantenimiento = document.querySelector('#formulario-mantenimiento');
	const listaSolicitudes = document.querySelector('#lista-buzon');
	if (formularioMantenimiento && listaSolicitudes) {
		const renderizarSolicitudes = () => {
			const solicitudes = cargarSolicitudes();
			listaSolicitudes.replaceChildren();
			if (solicitudes.length === 0) {
				const mensajeVacio = document.createElement('p');
				mensajeVacio.className = 'buzon-vacio';
				mensajeVacio.textContent = 'No hay solicitudes pendientes.';
				listaSolicitudes.append(mensajeVacio);
				return;
			}
			solicitudes.forEach((solicitud) => {
				const elemento = document.createElement('div');
				elemento.className = `solicitud-item${solicitud.status === 'terminada' ? ' terminada' : ''}`;
				elemento.dataset.idSolicitud = solicitud.id;
				const contenido = document.createElement('div');
				const titulo = document.createElement('strong');
				titulo.textContent = `${solicitud.name}: ${solicitud.message}`;
				const detalles = document.createElement('small');
				detalles.textContent = `${solicitud.email} · ${solicitud.status === 'terminada' ? 'Terminada' : 'Pendiente'}`;
				contenido.append(titulo, detalles);
				const boton = document.createElement('button');
				boton.className = 'estado-solicitud';
				boton.type = 'button';
				boton.textContent = solicitud.status === 'terminada' ? 'Terminada' : 'Marcar terminado';
				elemento.append(contenido, boton);
				listaSolicitudes.append(elemento);
			});
		};
		formularioMantenimiento.addEventListener('submit', (evento) => {
			evento.preventDefault();
			const areaTexto = formularioMantenimiento.querySelector('textarea');
			const solicitud = areaTexto.value.trim();
			if (!solicitud) {
				return;
			}
			const solicitudes = cargarSolicitudes();
			solicitudes.unshift({ id: Date.now(), name: 'Mantenimiento', email: 'Buzón interno', message: solicitud, status: 'pendiente' });
			guardarSolicitudes(solicitudes);
			renderizarSolicitudes();
			areaTexto.value = '';
		});
		listaSolicitudes.addEventListener('click', (evento) => {
			if (!evento.target.matches('.estado-solicitud')) {
				return;
			}
			const elementoSolicitud = evento.target.closest('.solicitud-item');
			const solicitudes = cargarSolicitudes();
			const solicitud = solicitudes.find((elemento) => String(elemento.id) === elementoSolicitud.dataset.idSolicitud);
			if (solicitud) {
				solicitud.status = solicitud.status === 'terminada' ? 'pendiente' : 'terminada';
				guardarSolicitudes(solicitudes);
				renderizarSolicitudes();
			}
		});
		renderizarSolicitudes();
	}
	const formularioContacto = document.querySelector('#formulario-contacto');
	const estadoContacto = document.querySelector('#estado-contacto');
	if (formularioContacto && estadoContacto) {
		formularioContacto.addEventListener('submit', (evento) => {
			evento.preventDefault();
			const datosFormulario = new FormData(formularioContacto);
			const solicitudes = cargarSolicitudes();
			solicitudes.unshift({
				id: Date.now(),
				name: datosFormulario.get('nombre').trim(),
				email: datosFormulario.get('email').trim(),
				message: datosFormulario.get('mensaje').trim(),
				status: 'pendiente'
			});
			guardarSolicitudes(solicitudes);
			formularioContacto.reset();
			estadoContacto.textContent = 'Mensaje enviado. Mantenimiento lo revisará desde su bandeja.';
		});
	}
	// NAVEGACION DE PERFILES
	const panelesPerfil = document.querySelectorAll('.perfil-panel');
	const selectoresRol = document.querySelectorAll('.selector-rol');
	const selectorPersonas = document.querySelector('#selector-personas');
	const personasPorRol = {
		'panel-usuarios': [{ id: 'usuario-principal', nombre: 'Ana Torres' }],
		'panel-nutricionistas': [{ id: 'laura', nombre: 'Laura Sánchez', sexo: 'mujer' }, { id: 'pablo', nombre: 'Pablo Martín', sexo: 'hombre' }, { id: 'carla', nombre: 'Carla Romero', sexo: 'mujer' }],
		'panel-entrenadores': [{ id: 'marco', nombre: 'Marco Polo', sexo: 'hombre' }, { id: 'ana', nombre: 'Ana Gómez', sexo: 'mujer' }, { id: 'diego', nombre: 'Diego Ramos', sexo: 'hombre' }],
		'panel-mantenimiento': [{ id: 'mantenimiento', nombre: 'Equipo de mantenimiento' }],
		'panel-empleados': [{ id: 'nadia', nombre: 'Nadia López' }, { id: 'carlos', nombre: 'Carlos Méndez' }, { id: 'eva', nombre: 'Eva Martín' }]
	};
	const filtrarPersonas = (idPanel, idPersona) => {
		const panel = document.querySelector(`#${idPanel}`);
		if (!panel) {
			return;
		}
		if (idPanel === 'panel-nutricionistas' || idPanel === 'panel-entrenadores') {
			const tipoBloque = idPanel === 'panel-nutricionistas' ? '.bloque-profesional' : '.tabla-profesional';
			panel.querySelectorAll(tipoBloque).forEach((bloque) => {
				const nombre = bloque.querySelector('.cabecera-profesional strong')?.textContent;
				const persona = personasPorRol[idPanel].find((item) => item.id === idPersona);
				bloque.hidden = !persona || nombre !== persona.nombre;
			});
		}
		if (idPanel === 'panel-empleados') {
			panel.querySelectorAll('.empleado-persona').forEach((empleado) => {
				empleado.hidden = empleado.dataset.persona !== idPersona;
			});
		}
	};
	const actualizarMenuPersonas = (idPanel) => {
		if (!selectorPersonas) {
			return;
		}
		const personas = personasPorRol[idPanel] || [];
		selectorPersonas.innerHTML = personas.map((persona, indice) => `<button class="selector-persona${indice === 0 ? ' activo' : ''}" type="button" role="tab" aria-selected="${indice === 0}" data-persona-rol="${persona.id}">${persona.nombre}</button>`).join('');
		filtrarPersonas(idPanel, personas[0]?.id);
		selectorPersonas.querySelectorAll('.selector-persona').forEach((boton) => {
			boton.addEventListener('click', () => {
				establecerBotonActivo(selectorPersonas.querySelectorAll('.selector-persona'), boton);
				filtrarPersonas(idPanel, boton.dataset.personaRol);
				if (idPanel === 'panel-entrenadores') {
					renderizarSesionesEntrenador();
					renderizarClientesEntrenador();
					crearListaUsuarios(document.querySelector('#lista-usuarios-entrenador'), 'entrenador');
				}
			});
		});
	};
	const mostrarPanelPerfil = (idPanel) => {
		panelesPerfil.forEach((panel) => {
			panel.hidden = panel.id !== idPanel;
			panel.classList.toggle('activo', panel.id === idPanel);
		});
	};
	selectoresRol.forEach((selector) => {
		selector.addEventListener('click', () => {
			const idPanel = selector.dataset.panelRol;
			establecerBotonActivo(selectoresRol, selector);
			mostrarPanelPerfil(idPanel);
			actualizarMenuPersonas(idPanel);
			if (idPanel === 'panel-entrenadores') {
				crearListaUsuarios(document.querySelector('#lista-usuarios-entrenador'), 'entrenador');
			}
		});
	});
	actualizarMenuPersonas('panel-usuarios');
	const detalles = document.querySelectorAll('.detalle-oculto');
	detalles.forEach((detalle) => {
		detalle.hidden = true;
	});
	document.addEventListener('click', (evento) => {
		const boton = evento.target.closest('.boton-detalles');
		if (!boton) {
			return;
		}
		const detalle = document.querySelector(`#${boton.dataset.detalles}`);
		if (!detalle) {
			return;
		}
		const estaVisible = !detalle.hidden;
		detalle.hidden = estaVisible;
		boton.textContent = estaVisible ? 'Detalles' : 'Ocultar detalles';
	});
	const selectorFotoPerfil = document.querySelector('#foto-perfil');
	const avatarPerfil = document.querySelector('#avatar-perfil');
	if (selectorFotoPerfil && avatarPerfil) {
		selectorFotoPerfil.addEventListener('change', () => {
			const archivo = selectorFotoPerfil.files[0];
			if (!archivo) {
				return;
			}
			const lector = new FileReader();
			lector.addEventListener('load', () => {
				avatarPerfil.textContent = '';
				avatarPerfil.style.backgroundImage = `url("${lector.result}")`;
				avatarPerfil.style.backgroundPosition = 'center';
				avatarPerfil.style.backgroundSize = 'cover';
				avatarPerfil.classList.add('foto-perfil-cargada');
			});
			lector.readAsDataURL(archivo);
		});
	}
	// DATOS Y RENDERIZADO DE PERFILES
	const usuariosCentro = [
		{ nombre: 'Ana Torres', iniciales: 'AT', sexo: 'mujer', nutricionista: 'Laura Sánchez', entrenador: 'Marco Polo', peso: 62.4, talla: 165, objetivo: 'Definición', telefono: '600 123 001', correo: 'ana.torres@example.com' },
		{ nombre: 'Diego Ruiz', iniciales: 'DR', sexo: 'hombre', nutricionista: 'Laura Sánchez', entrenador: 'Ana Gómez', peso: 78.2, talla: 180, objetivo: 'Ganancia muscular', telefono: '600 123 002', correo: 'diego.ruiz@example.com' },
		{ nombre: 'Claudia León', iniciales: 'CL', sexo: 'mujer', nutricionista: 'Laura Sánchez', entrenador: 'Diego Ramos', peso: 68, talla: 168, objetivo: 'Pérdida de peso', telefono: '600 123 003', correo: 'claudia.leon@example.com' },
		{ nombre: 'Mario Gil', iniciales: 'MG', sexo: 'hombre', nutricionista: 'Pablo Martín', entrenador: 'Marco Polo', peso: 74.1, talla: 176, objetivo: 'Rendimiento deportivo', telefono: '600 123 004', correo: 'mario.gil@example.com' },
		{ nombre: 'Elena Vega', iniciales: 'EV', sexo: 'mujer', nutricionista: 'Pablo Martín', entrenador: 'Ana Gómez', peso: 59.8, talla: 164, objetivo: 'Recomposición corporal', telefono: '600 123 005', correo: 'elena.vega@example.com' },
		{ nombre: 'Hugo Nadal', iniciales: 'HN', sexo: 'hombre', nutricionista: 'Pablo Martín', entrenador: 'Diego Ramos', peso: 81, talla: 182, objetivo: 'Mantenimiento', telefono: '600 123 006', correo: 'hugo.nadal@example.com' },
		{ nombre: 'Lucía Márquez', iniciales: 'LM', sexo: 'mujer', nutricionista: 'Carla Romero', entrenador: 'Marco Polo', peso: 57.2, talla: 162, objetivo: 'Pérdida de peso', telefono: '600 123 007', correo: 'lucia.marquez@example.com' },
		{ nombre: 'Iván Castro', iniciales: 'IC', sexo: 'hombre', nutricionista: 'Carla Romero', entrenador: 'Ana Gómez', peso: 83.5, talla: 179, objetivo: 'Ganancia muscular', telefono: '600 123 008', correo: 'ivan.castro@example.com' },
		{ nombre: 'Paula Soler', iniciales: 'PS', sexo: 'mujer', nutricionista: 'Carla Romero', entrenador: 'Diego Ramos', peso: 64.3, talla: 167, objetivo: 'Definición', telefono: '600 123 009', correo: 'paula.soler@example.com' },
		{ nombre: 'Sergio Campos', iniciales: 'SC', sexo: 'hombre', nutricionista: '', entrenador: '', peso: null, talla: null, objetivo: '', telefono: '600 123 010', correo: 'sergio.campos@example.com' }
	];
	const categoriasObjetivo = ['Definición', 'Ganancia muscular', 'Pérdida de peso', 'Mantenimiento', 'Recomposición corporal', 'Rendimiento deportivo'];
	const sesionesEntrenamiento = [
		{ id: 'marco-grupo-1', entrenador: 'Marco Polo', tipo: 'grupal', dia: 'Lunes', hora: '17:00', actividad: 'Musculación', clientes: ['Ana Torres'] },
		{ id: 'marco-grupo-2', entrenador: 'Marco Polo', tipo: 'grupal', dia: 'Sábado', hora: '10:00', actividad: 'Fuerza y acondicionamiento', clientes: ['Mario Gil'] },
		{ id: 'marco-individual-1', entrenador: 'Marco Polo', tipo: 'individual', dia: 'Jueves', hora: '08:00', actividad: 'Movilidad', clientes: [] },
		{ id: 'ana-grupo-1', entrenador: 'Ana Gómez', tipo: 'grupal', dia: 'Lunes', hora: '08:00', actividad: 'Cardio', clientes: ['Diego Ruiz'] },
		{ id: 'ana-grupo-2', entrenador: 'Ana Gómez', tipo: 'grupal', dia: 'Viernes', hora: '08:00', actividad: 'HIIT', clientes: ['Iván Castro'] },
		{ id: 'ana-individual-1', entrenador: 'Ana Gómez', tipo: 'individual', dia: 'Miércoles', hora: '09:00', actividad: 'Resistencia', clientes: [] },
		{ id: 'diego-grupo-1', entrenador: 'Diego Ramos', tipo: 'grupal', dia: 'Martes', hora: '08:00', actividad: 'Movilidad', clientes: ['Claudia León'] },
		{ id: 'diego-grupo-2', entrenador: 'Diego Ramos', tipo: 'grupal', dia: 'Sábado', hora: '09:00', actividad: 'Entrenamiento funcional', clientes: ['Paula Soler'] },
		{ id: 'diego-individual-1', entrenador: 'Diego Ramos', tipo: 'individual', dia: 'Jueves', hora: '10:00', actividad: 'Estiramientos', clientes: [] }
	];
	const nombreUsuarioActivo = 'Ana Torres';
	const aplicarFotoAvatar = (avatar, archivo) => {
		if (!avatar || avatar.querySelector('img')) {
			return;
		}
		avatar.classList.add('avatar-con-foto');
		const imagen = document.createElement('img');
		imagen.alt = '';
		imagen.src = `../img/${archivo}`;
		imagen.addEventListener('error', () => {
			imagen.remove();
			avatar.classList.remove('avatar-con-foto');
		});
		avatar.append(imagen);
	};
	const ponerFotoCliente = (avatar, usuario) => aplicarFotoAvatar(avatar, `${usuario.sexo}_cliente.png`);
	const profesionalSeleccionado = () => selectorPersonas?.querySelector('.selector-persona.activo')?.textContent;
	document.querySelectorAll('#panel-nutricionistas .cabecera-profesional').forEach((cabecera) => {
		const persona = personasPorRol['panel-nutricionistas'].find((item) => item.nombre === cabecera.querySelector('strong')?.textContent);
		if (persona) aplicarFotoAvatar(cabecera.querySelector('.perfil-avatar'), persona.sexo === 'mujer' ? 'entrenadora.png' : 'entrenador.png');
	});
	document.querySelectorAll('#panel-entrenadores .cabecera-profesional').forEach((cabecera) => {
		const persona = personasPorRol['panel-entrenadores'].find((item) => item.nombre === cabecera.querySelector('strong')?.textContent);
		if (persona) aplicarFotoAvatar(cabecera.querySelector('.perfil-avatar'), persona.sexo === 'mujer' ? 'entrenadora.png' : 'entrenador.png');
	});
	document.querySelectorAll('.perfil-equipo-persona').forEach((tarjeta) => {
		const persona = [...personasPorRol['panel-nutricionistas'], ...personasPorRol['panel-entrenadores']].find((item) => item.nombre === tarjeta.dataset.profesional);
		if (persona) aplicarFotoAvatar(tarjeta.querySelector('.perfil-avatar'), persona.sexo === 'mujer' ? 'entrenadora.png' : 'entrenador.png');
	});
	// CLIENTES Y PROFESIONALES
	const actualizarDetalleContacto = (contenedor, usuario) => {
		let detalle = contenedor.querySelector('.detalle-oculto');
		if (!detalle) {
			detalle = document.createElement('p');
			detalle.className = 'detalle-oculto';
			detalle.id = `detalle-${contenedor.dataset.detalleId || `${usuario.iniciales.toLowerCase()}-cliente`}`;
			detalle.hidden = true;
			contenedor.append(detalle);
		}
		detalle.textContent = `Teléfono: ${usuario.telefono} · Correo: ${usuario.correo}`;
		let boton = contenedor.querySelector('.boton-detalles');
		if (!boton) {
			boton = document.createElement('button');
			boton.className = 'boton-detalles';
			boton.type = 'button';
			boton.dataset.detalles = detalle.id;
			boton.textContent = 'Detalles';
			contenedor.append(boton);
		}
	};
	const renderizarClientesNutricionista = () => {
		document.querySelectorAll('#panel-nutricionistas .bloque-profesional').forEach((bloque) => {
			const cabecera = bloque.querySelector('.cabecera-profesional');
			const nombreNutricionista = cabecera.querySelector('strong').textContent;
			cabecera.querySelector('small')?.remove();
			const clientes = usuariosCentro.filter((usuario) => usuario.nutricionista === nombreNutricionista);
			cabecera.querySelector('.insignia-panel').textContent = `${clientes.length} clientes`;
			const lista = bloque.querySelector('.clientes-lista');
			lista.replaceChildren();
			clientes.forEach((usuario) => {
				const fila = document.createElement('div');
				fila.dataset.detalleId = `nutricionista-${usuario.iniciales.toLowerCase()}`;
				const avatar = document.createElement('span');
				avatar.className = 'perfil-avatar cliente-avatar';
				avatar.textContent = usuario.iniciales;
				ponerFotoCliente(avatar, usuario);
				const nombre = document.createElement('strong');
				nombre.textContent = usuario.nombre;
				const medidas = document.createElement('small');
				medidas.textContent = usuario.peso === null
					? 'Peso y talla pendientes'
					: `${usuario.peso} kg · ${usuario.talla} cm · ${usuario.objetivo}`;
				fila.append(avatar, nombre, medidas);
				actualizarDetalleContacto(fila, usuario);
				lista.append(fila);
			});
		});
	};
	const renderizarDirectorio = () => {
		document.querySelectorAll('.directorio-usuario').forEach((elemento) => {
			const nombre = elemento.querySelector('strong')?.textContent;
			const usuario = usuariosCentro.find((item) => item.nombre === nombre);
			if (!usuario) {
				return;
			}
			let etiquetas = elemento.querySelector('.etiquetas-usuario');
			if (!etiquetas) {
				etiquetas = document.createElement('div');
				etiquetas.className = 'etiquetas-usuario';
				const descripcion = elemento.querySelector('small');
				descripcion?.replaceWith(etiquetas);
			}
			etiquetas.innerHTML = `<span class="etiqueta-usuario">Nutricionista: ${usuario.nutricionista || 'Sin asignar'}</span><span class="etiqueta-usuario">Entrenador: ${usuario.entrenador || 'Sin asignar'}</span>`;
			elemento.classList.toggle('sin-asignar', !usuario.nutricionista && !usuario.entrenador);
			elemento.querySelector('.insignia-panel')?.remove();
			if (usuario.nombre !== nombreUsuarioActivo) ponerFotoCliente(elemento.querySelector('.perfil-avatar'), usuario);
			actualizarDetalleContacto(elemento, usuario);
		});
	};
	renderizarClientesNutricionista();
	renderizarDirectorio();
	// RESERVAS Y AGENDA
	const renderizarSesionesEntrenador = () => {
		const entrenador = document.querySelector('#panel-entrenadores .tabla-profesional:not([hidden]) .cabecera-profesional strong')?.textContent || 'Marco Polo';
		const sesiones = sesionesEntrenamiento.filter((sesion) => sesion.entrenador === entrenador);
		const renderizarTipo = (tipo, idLista) => {
			const lista = document.querySelector(`#${idLista}`);
			lista.replaceChildren();
			sesiones.filter((sesion) => sesion.tipo === tipo).forEach((sesion) => {
				const fila = document.createElement('div');
				fila.className = 'sesion-entrenador-fila';
				const hora = document.createElement('strong');
				hora.textContent = `${sesion.dia} · ${sesion.hora}`;
				const clientes = document.createElement('span');
				clientes.textContent = sesion.clientes.length ? sesion.clientes.join(', ') : 'Disponible';
				fila.append(hora, clientes);
				lista.append(fila);
			});
		};
		renderizarTipo('grupal', 'entrenamientos-grupales');
		renderizarTipo('individual', 'entrenamientos-individuales');
	};
	const renderizarClientesEntrenador = () => {
		const lista = document.querySelector('#clientes-entrenador');
		if (!lista) return;
		const entrenador = document.querySelector('#panel-entrenadores .tabla-profesional:not([hidden]) .cabecera-profesional strong')?.textContent || 'Marco Polo';
		lista.replaceChildren();
		usuariosCentro.filter((usuario) => usuario.entrenador === entrenador).forEach((usuario) => {
			const fila = document.createElement('div');
			fila.dataset.detalleId = `entrenador-${usuario.iniciales.toLowerCase()}`;
			const avatar = document.createElement('span');
			avatar.className = 'perfil-avatar cliente-avatar';
			avatar.textContent = usuario.iniciales;
			ponerFotoCliente(avatar, usuario);
			const nombre = document.createElement('strong');
			nombre.textContent = usuario.nombre;
			const contacto = document.createElement('small');
			contacto.textContent = `${usuario.peso ?? 'Pendiente'}${usuario.peso === null ? '' : ' kg'} · ${usuario.talla ?? 'Pendiente'}${usuario.talla === null ? '' : ' cm'} · ${usuario.objetivo || 'Objetivo pendiente'}`;
			fila.append(avatar, nombre, contacto);
			actualizarDetalleContacto(fila, usuario);
			lista.append(fila);
		});
	};
	const renderizarActividadesUsuario = () => {
		const lista = document.querySelector('#actividades-apuntarse');
		if (!lista) return;
		lista.replaceChildren();
		sesionesEntrenamiento.forEach((sesion) => {
			const fila = document.createElement('article');
			fila.className = 'actividad-reservable';
			const detalle = document.createElement('div');
			const nombre = document.createElement('strong');
			nombre.textContent = sesion.actividad;
			const datos = document.createElement('small');
			datos.textContent = `${sesion.tipo === 'grupal' ? 'Grupal' : 'Individual'} · ${sesion.dia} ${sesion.hora} · ${sesion.entrenador}`;
			detalle.append(nombre, datos);
			const boton = document.createElement('button');
			boton.type = 'button';
			boton.dataset.reservarSesion = sesion.id;
			const estaApuntado = sesion.clientes.includes(nombreUsuarioActivo);
			const individualOcupado = sesion.tipo === 'individual' && sesion.clientes.length > 0 && !estaApuntado;
			boton.disabled = estaApuntado || individualOcupado;
			boton.textContent = estaApuntado ? 'Apuntado' : individualOcupado ? 'Ocupada' : 'Apuntarme';
			fila.append(detalle, boton);
			lista.append(fila);
		});
	};
	renderizarSesionesEntrenador();
	renderizarClientesEntrenador();
	renderizarActividadesUsuario();
	document.querySelector('#actividades-apuntarse')?.addEventListener('click', (evento) => {
		const boton = evento.target.closest('[data-reservar-sesion]');
		if (!boton) return;
		const sesion = sesionesEntrenamiento.find((item) => item.id === boton.dataset.reservarSesion);
		if (!sesion || sesion.clientes.includes(nombreUsuarioActivo) || (sesion.tipo === 'individual' && sesion.clientes.length)) return;
		sesion.clientes.push(nombreUsuarioActivo);
		renderizarActividadesUsuario();
		renderizarSesionesEntrenador();
		renderizarClientesEntrenador();
	});
	document.querySelector('#boton-horario-completo')?.addEventListener('click', (evento) => {
		const boton = evento.currentTarget;
		const horario = document.querySelector('.horario-completo');
		horario.hidden = !horario.hidden;
		boton.setAttribute('aria-expanded', String(!horario.hidden));
		boton.textContent = horario.hidden ? 'Ver mi horario completo' : 'Ocultar horario completo';
	});
	// ASIGNACION DE CLIENTES
	const crearListaUsuarios = (lista, rol) => {
		lista.innerHTML = usuariosCentro.map((usuario) => {
			const profesional = usuario[rol];
			const tieneProfesional = Boolean(profesional);
			const etiqueta = tieneProfesional ? `${rol === 'entrenador' ? 'Entrenador' : 'Nutricionista'} · ${profesional}` : 'Disponible';
			const claseEstado = tieneProfesional ? 'asignado' : 'disponible';
			const sesionesDisponibles = sesionesEntrenamiento.filter((sesion) => sesion.entrenador === profesionalSeleccionado() && (sesion.tipo === 'grupal' || !sesion.clientes.length));
			const opcionesEntrenamiento = rol === 'entrenador'
				? `<label>Entrenamiento<select name="sesion" required><option value="" selected disabled>Elige grupal o individual</option>${sesionesDisponibles.map((sesion) => `<option value="${sesion.id}">${sesion.tipo === 'grupal' ? 'Grupal' : 'Individual'} · ${sesion.dia} ${sesion.hora} · ${sesion.actividad}</option>`).join('')}</select></label>`
				: '';
			return `<div class="usuario-rol-fila"><span class="perfil-avatar">${usuario.iniciales}</span><div><strong>${usuario.nombre}</strong><span class="etiqueta-estado ${claseEstado}">${etiqueta}</span></div><button type="button" data-asignar-usuario="${usuario.nombre}" ${tieneProfesional ? 'disabled' : ''}>${tieneProfesional ? 'En equipo' : 'Añadir'}</button><form class="formulario-asignacion-cliente" hidden><label>Peso (kg)<input name="peso" type="number" min="1" max="500" step="0.1" required></label><label>Talla (cm)<input name="talla" type="number" min="50" max="260" step="1" required></label><label>Categoría<select name="objetivo" required><option value="" selected disabled>Selecciona objetivo</option>${categoriasObjetivo.map((categoria) => `<option value="${categoria}">${categoria}</option>`).join('')}</select></label>${opcionesEntrenamiento}<button type="submit">Guardar asignación</button></form></div>`;
		}).join('');
		lista.querySelectorAll('.usuario-rol-fila').forEach((fila) => {
			const usuario = usuariosCentro.find((item) => item.nombre === fila.querySelector('strong').textContent);
			if (usuario && usuario.nombre !== nombreUsuarioActivo) ponerFotoCliente(fila.querySelector('.perfil-avatar'), usuario);
		});
	};
	document.querySelectorAll('.boton-mostrar-usuarios').forEach((boton) => {
		const lista = document.querySelector(`#${boton.dataset.listaUsuarios}`);
		const rol = boton.dataset.listaUsuarios.includes('nutricionista') ? 'nutricionista' : 'entrenador';
		if (!lista) {
			return;
		}
		crearListaUsuarios(lista, rol);
		boton.addEventListener('click', () => {
			const estaVisible = !lista.hidden;
			lista.hidden = estaVisible;
			boton.setAttribute('aria-expanded', String(!estaVisible));
			boton.textContent = estaVisible ? '+ Añadir cliente' : 'Ocultar usuarios';
		});
		lista.addEventListener('click', (evento) => {
			const botonAsignar = evento.target.closest('[data-asignar-usuario]');
			if (!botonAsignar) {
				return;
			}
			const formulario = botonAsignar.parentElement.querySelector('.formulario-asignacion-cliente');
			formulario.hidden = false;
			formulario.querySelector('[name="peso"]').focus();
		});
		lista.addEventListener('submit', (evento) => {
			const formulario = evento.target.closest('.formulario-asignacion-cliente');
			if (!formulario) {
				return;
			}
			evento.preventDefault();
			const fila = formulario.closest('.usuario-rol-fila');
			const usuario = usuariosCentro.find((item) => item.nombre === fila.querySelector('[data-asignar-usuario]').dataset.asignarUsuario);
			const panel = lista.id.includes('nutricionista') ? 'panel-nutricionistas' : 'panel-entrenadores';
			const bloqueActivo = document.querySelector(`#${panel} .${panel === 'panel-nutricionistas' ? 'bloque-profesional' : 'tabla-profesional'}:not([hidden])`);
			const profesionalActivo = bloqueActivo?.querySelector('.cabecera-profesional strong')?.textContent;
			if (!usuario || !profesionalActivo) {
				return;
			}
			const datos = new FormData(formulario);
			if (rol === 'entrenador') {
				const sesion = sesionesEntrenamiento.find((item) => item.id === datos.get('sesion'));
				if (!sesion || (sesion.tipo === 'individual' && sesion.clientes.length)) return;
				sesion.clientes.push(usuario.nombre);
			}
			usuario[rol] = profesionalActivo;
			usuario.peso = Number(datos.get('peso'));
			usuario.talla = Number(datos.get('talla'));
			usuario.objetivo = datos.get('objetivo');
			renderizarClientesNutricionista();
			renderizarSesionesEntrenador();
			renderizarClientesEntrenador();
			renderizarActividadesUsuario();
			renderizarDirectorio();
			crearListaUsuarios(lista, rol);
		});
	});
	// BUSQUEDA DE USUARIOS Y RECLAMACIONES
	const buscadorUsuarios = document.querySelector('#buscar-usuarios');
	const usuariosDirectorio = document.querySelectorAll('.directorio-usuario');
	if (buscadorUsuarios) {
		buscadorUsuarios.addEventListener('input', () => {
			const textoBuscado = buscadorUsuarios.value.trim().toLowerCase();
			usuariosDirectorio.forEach((usuario) => {
				usuario.hidden = !usuario.textContent.toLowerCase().includes(textoBuscado);
			});
		});
	}
	const formularioReclamacion = document.querySelector('#formulario-reclamacion');
	const estadoReclamacion = document.querySelector('#estado-reclamacion');
	if (formularioReclamacion && estadoReclamacion) {
		formularioReclamacion.addEventListener('submit', (evento) => {
			evento.preventDefault();
			formularioReclamacion.reset();
			estadoReclamacion.textContent = 'Reclamación preparada. Mantenimiento la revisará desde su panel.';
		});
	}
	// CATALOGO DE PRODUCTOS
	const botonesCategoria = document.querySelectorAll('.categoria-filtro');
	const tarjetasProducto = document.querySelectorAll('.tarjeta-producto');
	botonesCategoria.forEach((boton) => {
		boton.addEventListener('click', () => {
			const categoria = boton.dataset.categoria;
			establecerBotonActivo(botonesCategoria, boton);
			tarjetasProducto.forEach((tarjeta) => {
				const esVisible = categoria === 'todos' || tarjeta.dataset.categoria === categoria;
				tarjeta.hidden = !esVisible;
			});
		});
	});
	// ACCESO Y REGISTRO
	const pestanasAcceso = document.querySelectorAll('.acceso-pestana');
	const panelesAcceso = document.querySelectorAll('.acceso-panel');
	pestanasAcceso.forEach((pestana) => {
		pestana.addEventListener('click', () => {
			const idPanel = pestana.dataset.panelAcceso;
			establecerBotonActivo(pestanasAcceso, pestana);
			panelesAcceso.forEach((panel) => {
				panel.hidden = panel.id !== idPanel;
				panel.classList.toggle('activo', panel.id === idPanel);
			});
		});
	});
	const formularioRegistro = document.querySelector('#formulario-registro');
	const tipoUsuario = document.querySelector('#tipo-usuario');
	const grupoCodigoPersonal = document.querySelector('#grupo-codigo-personal');
	const codigoPersonal = document.querySelector('#codigo-personal');
	const ayudaCodigoPersonal = document.querySelector('#ayuda-codigo-personal');
	if (tipoUsuario && grupoCodigoPersonal && codigoPersonal && ayudaCodigoPersonal) {
		const actualizarCampoCodigo = () => {
			const nombresRoles = {
				nutricionista: 'nutricionista',
				entrenador: 'entrenador personal',
				mantenimiento: 'personal de mantenimiento',
				gimnasio: 'personal del gimnasio'
			};
			const rol = nombresRoles[tipoUsuario.value];
			const necesitaCodigo = Boolean(rol);
			grupoCodigoPersonal.hidden = !necesitaCodigo;
			codigoPersonal.required = necesitaCodigo;
			ayudaCodigoPersonal.textContent = necesitaCodigo
				? `Introduce el código asignado al ${rol}.`
				: 'Este código confirma tu tipo de cuenta.';
		};
		tipoUsuario.addEventListener('change', actualizarCampoCodigo);
		actualizarCampoCodigo();
	}
	const formularioInicio = document.querySelector('#formulario-inicio');
	const estadoInicio = document.querySelector('#estado-inicio');
	if (formularioInicio && estadoInicio) {
		formularioInicio.addEventListener('submit', (evento) => {
			evento.preventDefault();
			estadoInicio.textContent = 'Formulario preparado. La conexión con la base de datos se añadirá más adelante.';
		});
	}
	const estadoRegistro = document.querySelector('#estado-registro');
	if (formularioRegistro && estadoRegistro) {
		formularioRegistro.addEventListener('submit', (evento) => {
			evento.preventDefault();
			const contrasena = formularioRegistro.querySelector('[name="contrasena"]');
			const confirmarContrasena = formularioRegistro.querySelector('[name="confirmar-contrasena"]');
			if (contrasena.value !== confirmarContrasena.value) {
				confirmarContrasena.setCustomValidity('Las contraseñas no coinciden.');
				confirmarContrasena.reportValidity();
				return;
			}
			confirmarContrasena.setCustomValidity('');
			estadoRegistro.textContent = 'Formulario preparado. El registro se conectará a la base de datos más adelante.';
		});
	}
	// CARRITO DE COMPRA
	const listaCarrito = document.querySelector('#carrito-lista');
	const contadorCarrito = document.querySelector('#carrito-contador');
	const totalCarrito = document.querySelector('#carrito-total');
	const botonVaciarCarrito = document.querySelector('#vaciar-carrito');
	const botonFinalizarCompra = document.querySelector('#finalizar-compra');
	const carrito = new Map();
	if (!listaCarrito || !contadorCarrito || !totalCarrito || !botonVaciarCarrito || !botonFinalizarCompra) {
		return;
	}
	const formatearPrecio = (precio) => `${precio.toFixed(2).replace('.', ',')} $`;
	const renderizarCarrito = () => {
		const elementos = [...carrito.values()];
		const cantidad = elementos.reduce((total, elemento) => total + elemento.quantity, 0);
		const subtotal = elementos.reduce((total, elemento) => total + elemento.price * elemento.quantity, 0);
		contadorCarrito.textContent = cantidad;
		totalCarrito.textContent = formatearPrecio(subtotal);
		botonVaciarCarrito.disabled = elementos.length === 0;
		botonFinalizarCompra.disabled = elementos.length === 0;
		if (elementos.length === 0) {
			listaCarrito.innerHTML = '<p class="carrito-vacio">Todavía no has añadido productos.</p>';
			return;
		}
		listaCarrito.innerHTML = elementos.map((elemento) => `
			<div class="elemento-carrito" data-producto="${elemento.id}">
				<div><strong>${elemento.name}</strong><small>${formatearPrecio(elemento.price)} por unidad</small></div>
				<div class="controles-elemento-carrito"><button type="button" data-accion="restar" aria-label="Quitar una unidad">−</button><span>${elemento.quantity}</span><button type="button" data-accion="sumar" aria-label="Añadir una unidad">+</button></div>
				<button class="carrito-eliminar" type="button" data-accion="eliminar" aria-label="Eliminar ${elemento.name}">×</button>
			</div>
		`).join('');
	};
	document.querySelectorAll('.anadir-carrito').forEach((boton) => {
		boton.addEventListener('click', () => {
			const tarjeta = boton.closest('.tarjeta-producto');
			const id = tarjeta.dataset.producto;
			const elementoActual = carrito.get(id);
			if (elementoActual) {
				elementoActual.quantity += 1;
			} else {
				carrito.set(id, {
					id,
					name: id,
					price: Number(tarjeta.dataset.precio),
					quantity: 1
				});
			}
			boton.textContent = 'Añadido';
			boton.classList.add('producto-anadido');
			window.setTimeout(() => {
				boton.textContent = 'Añadir';
				boton.classList.remove('producto-anadido');
			}, 900);
			renderizarCarrito();
		});
	});
	listaCarrito.addEventListener('click', (evento) => {
		const botonAccion = evento.target.closest('[data-accion]');
		if (!botonAccion) {
			return;
		}
		const elementoCarrito = botonAccion.closest('.elemento-carrito');
		const elemento = carrito.get(elementoCarrito.dataset.producto);
		if (!elemento) {
			return;
		}
		if (botonAccion.dataset.accion === 'sumar') {
			elemento.quantity += 1;
		} else if (botonAccion.dataset.accion === 'restar') {
			elemento.quantity -= 1;
			if (elemento.quantity <= 0) {
				carrito.delete(elemento.id);
			}
		} else {
			carrito.delete(elemento.id);
		}
		renderizarCarrito();
	});
	botonVaciarCarrito.addEventListener('click', () => {
		carrito.clear();
		renderizarCarrito();
	});
	botonFinalizarCompra.addEventListener('click', () => {
		window.alert('El código de compra está incompleto. La solicitud no puede finalizarse todavía.');
		botonFinalizarCompra.textContent = 'Solicitud preparada';
		botonFinalizarCompra.disabled = true;
	});
	renderizarCarrito();
});
