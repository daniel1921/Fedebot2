const { REST, Routes, Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const axios = require("axios");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  {
    name: "unirse",
    description:
      "Comando para hablitar el rol de miembro, debe usar su nick de albion",
    options: [
      {
        type: 3,
        name: "nickname",
        description: "Ingresar el Nick de albion",
        required: true,
      },
    ],
  // },
  // {
  //   name: "wobo",
  //   description: "¡Este comando te hace un alce mas fuerte!",
  //   options: [
  //     {
  //       type: 3,
  //       name: "contentwb",
  //       description: "¿cual oficial es el mas gay?",
  //       required: true,
  //     },
  //   ],
   },
];

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN_DISCORD);

const cnn = async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }

  client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  client.on("interactionCreate", async (interaction) => {
    // if (!interaction.isChatInputCommand()) return;
    console.log("entro aqui :D");
    if (interaction.commandName === "unirse") {
      console.log("entro al comando");
      var nickname = "";
      try {
        nickname = await interaction.options.getString("nickname");
        console.log("nickname");
      } catch (error) {
        await interaction.reply(`Ha ocurrido un error: ${error} `);
      }

      console.log("Validado el nickname listo para llamar a la api del albion");
      try {
        const apiAlbionResp = await axios.get(
          `https://gameinfo.albiononline.com/api/gameinfo/search?q=${nickname}`,
          { timeout: 100000 }
        );
        console.log("entro al comando parte 3");
        if (apiAlbionResp.status === 200) {
          if (apiAlbionResp.data.players.length > 0) {
            // Pertenece a la federacion Y?
            const esMiembro = apiAlbionResp.data.players.some(
              (miembro) =>
                miembro.GuildName === "La Federacion Y" &&
                miembro.Name.toLowerCase() === nickname.toLowerCase()
            );

            if (esMiembro) {        
               
                try {
                  const userId = interaction.user.id;
                  // const respuesta = await interaction.reply(
                  //   ` Procesando registro de usuario... `
                  // );
                  if (userId) {
                    // Enviar una respuesta provisional al usuario
                    await interaction.reply(
                      `Procesando registro de usuario...`
                    );
                    try {
                      const createPlayerInApp = await axios.post(
                        //  CAMBIAR LA url POR PRODUCCIÓN
                        
                        `https://www.lafederaciony.online/api/jugadores`,
                        [
                          {
                            nickname: nickname.toLowerCase(),
                            idCargo: 3,
                            idRol: 5,
                            idUserDiscord: userId,
                          },
                        ],
                        { timeout: 100000 }
                      );
                      console.log('respuesta de la api de la fede: ', createPlayerInApp)
                      if (createPlayerInApp.data.ok) {

                        await interaction.member.setNickname(nickname.toLowerCase());
                        await interaction.member.roles.add("955948751338471455");

                        await interaction.followUp(
                          `El usuario ${nickname}, se ha registrado en el servidor, Bienvenido! A partir de ahora tienes el rol de miembro :green_heart:  `                          
                        );
                      } else {
                        await interaction.followUp(
                          `¡Bienvenido de vuelta a la federación! :green_heart:  `
                        );
                        await interaction.member.setNickname(nickname.toLowerCase());
                        await interaction.member.roles.add("955948751338471455");
                      }
                    
                    } catch (error) {
                      if (error.response && error.response.data.ok === false) {
                        console.log("Usuario ya registrado");
                       
                        await interaction.member.setNickname(nickname.toLowerCase());
                        await interaction.member.roles.add("955948751338471455");
                        await interaction.followUp(
                          `¡Bienvenido de vuelta a la federación! :green_heart:  `
                        );
                     
                        
                      } else {
                        console.error("Error al registrar usuario: ", error);
                        await interaction.followUp(
                          `Hubo un problema al procesar tu solicitud. Por favor, intenta más tarde.`
                        );
                      }
                    }
                  }
                } catch (error) {
                  await interaction.reply(`Ha ocurrido un error: ${error} `);
                }
              
            } else {
              await interaction.reply(
                ` Hubo un problema al momento de registrarte con el Nickname de ${nickname}, probablemente no estes en el gremio, no esperes para ser parte nuestra comunidad  :beers: `
              );
            }
          } else {
            await interaction.reply(
              `No se encontró al jugador ${nickname} en la base de datos de albion online, porfavor ingresa el mismo nombre que tienes en el juego`
            );
          }
        } else {
          console.log("entro al comando parte 4");
        }
      } catch (error) {
        await interaction.reply(`Ha ocurrido un error: ${error}`);
      }

      // const resp = await interaction.reply("prueba finalizada!");
      //console.log(resp);
    }
    // if (interaction.commandName === "wobo") {
    //   var nickname = "";
    //   try {
    //     pwd = await interaction.options.getString("contentwb");
    //   } catch (error) {
    //     await interaction.reply({
    //       content: `Ha ocurrido un error: ${error}`,
    //       ephemeral: true,
    //     });
    //   }

    //   // console.log("entro al comando");
    //   try {
    //     if (pwd === "ismaestopo") {
    //       await interaction.member.roles.add("1231978864968863875");
    //       await interaction.reply({
    //         content: `El usuario es un :deer:`,
    //         ephemeral: true, // Solo el usuario que ejecutó el comando verá este mensaje
    //       });
    //     } else {
    //       await interaction.reply({
    //         content: `Es correcto este usuario ${pwd} efectivamente es gay! :man_tipping_hand:`, // Solo el usuario que ejecutó el comando verá este mensaje
    //       });
    //     }
    //   } catch (error) {
    //     await interaction.reply(`Ha ocurrido un error: ${error}`);
    //   }

    //   // const resp = await interaction.reply("prueba finalizada!");
    //   //console.log(resp);
    // }
  });
};

cnn();

client.login(process.env.TOKEN_DISCORD);
