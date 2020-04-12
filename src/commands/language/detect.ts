import { ICommand } from '../../classes/Command';
import { detectLanguage } from '../../util/Api';
import { QuickEmbed } from '../../util/Style';

export const command: ICommand = {
   name: 'Detect',
   description: 'Detects the language of the given string',
   aliases: ['dt'],
   args: true,

   async execute(message, args) {
      //Get query
      const query = args.join(' ');

      //Send to API and display result
      detectLanguage(query)
         .then(body => {
            const result = body[0];

            const confidence = result.confidence;
            const isReliable = result.isReliable;
            const language = result.language;

            let content = `\`\`\`yaml
Language: ${language},
Confidence: ${confidence},
Is_Reliable: ${isReliable}\`\`\``;

            message.channel.send(content);
         })
         .catch(err => {
            QuickEmbed(message, `Error: ${err.message}`);
         });
   },
};
