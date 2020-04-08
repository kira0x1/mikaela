import { ICommand } from "../../classes/Command";
import chalk from "chalk";
import { detectLanguage, translateLanguage } from "../../util/Api";
import { QuickEmbed } from "../../util/Style";

export const command: ICommand = {
   name: "Translate",
   description: "Translates words to the specified language",
   aliases: ["read"],
   args: true,

   async execute(message, args) {
      const argumentsFound: Array<string> = [];

      let source: string | undefined = undefined;
      let target: string | undefined = undefined;

      //Check for any arguments
      args.find((arg, i) => {
         if (arg !== undefined && arg.startsWith("-") && arg.length > 1 && arg[1] !== "-") {
            argumentsFound.push(arg);
            // console.log(chalk.bgRed.bold(`Argument Found: ${arg}`));

            if (arg == "-source") source = args[i + 1];
            else if (arg === "-target") {
               target = args[i + 1];
            }

            args.splice(i, 2);
         }
      });

      //Get the rest of the string after removing arguments
      const query = args.join(" ");

      //Send to API and display result
      translateLanguage(query, target)
         .then((body) => {
            let content = `\`\`\`yaml
source language: ${body.detectedSourceLanguage},
translated text: ${body.translatedText}\`\`\``;
            message.channel.send(content);
         })
         .catch((err) => {
            QuickEmbed(message, `Error: ${err.message}`);
         });
   },
};
