const { io } = require('../server');
const {Usuarios} = require('../classes/usuarios');
const {crearMnesaje} =  require('../utilidades/utilidades');

const usuarios = new Usuarios();


io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {

        if (!data.nombre) {
            return callback({
                error: true,
                mensaje: 'El nombre es nesesario'
            });
        }

        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMnesaje('Administrador', `${data.nombre} se unió`));

        callback(usuarios.getPersonasPorSala(data.sala));
    })

    client.on('crearMensaje', (data, callback)=>{
        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMnesaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

        callback(mensaje);
    });

    client.on('disconnect', ()=>{

       let personaBorrada = usuarios.borrarPersona(client.id);
       client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMnesaje('Administrador', `${personaBorrada.nombre} salió`));
       client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));
    });


    // Mensajes privados
    client.on('mensajePrivado', data =>{
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMnesaje(persona.nombre, data.mensaje))
    })
});

