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
   console.log("entro al comando");
    if(interaction.commandName === "unirse") {
        var nickname = '';
        try {
        nickname =  await interaction.options.getString("nickname");
        } catch (error) {
            await interaction.reply(`Ha ocurrido un error: ${error} `);
        }
      
      // console.log("entro al comando");
      try {
        const apiAlbionResp = await axios.get(
          `https://gameinfo.albiononline.com/api/gameinfo/search?q=${nickname}`
        );

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
                await interaction.member.roles.add("955948751338471455");
                try {
                  await interaction.member.setNickname(nickname);
                  await interaction.reply(
                    `El usuario ${nickname}, se ha registrado en el servidor, Bienvenido! A partir de ahora tienes el rol de miembro :green_heart:  `
                  );
                } catch (error) {
                  await interaction.reply(`Ha ocurrido un error: ${error} `);
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
        }
      } catch (error) {
        await interaction.reply(`Ha ocurrido un error: ${error}`);
      }

      // const resp = await interaction.reply("prueba finalizada!");
      //console.log(resp);
    }
  });
};

cnn();

client.login(process.env.TOKEN_DISCORD);
