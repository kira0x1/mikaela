import { ICommand } from '../../classes/Command';
import { translateLanguage } from '../../util/Api';
import { QuickEmbed } from '../../util/Style';

const LANGUAGE_CODES = [
   { name: 'Afrikaans', code: 'af' },
   { name: 'Irish', code: 'ga' },
   { name: 'Albanian', code: 'sq' },
   { name: 'Italian', code: 'it' },
   { name: 'Arabic', code: 'ar' },
   { name: 'Japanese', code: 'ja' },
   { name: 'Azerbaijani', code: 'az' },
   { name: 'Kannada', code: 'kn' },
   { name: 'Basque', code: 'eu' },
   { name: 'Korean', code: 'ko' },
   { name: 'Bengali', code: 'bn' },
   { name: 'Latin', code: 'la' },
   { name: 'Belarusian', code: 'be' },
   { name: 'Latvian', code: 'lv' },
   { name: 'Bulgarian', code: 'bg' },
   { name: 'Lithuanian', code: 'lt' },
   { name: 'Catalan', code: 'ca' },
   { name: 'Macedonian', code: 'mk' },
   { name: 'Chinese Simplified', code: 'zh-CN' },
   { name: 'Malay', code: 'ms' },
   { name: 'Chinese Traditional', code: 'zh-TW' },
   { name: 'Maltese', code: 'mt' },
   { name: 'Croatian', code: 'hr' },
   { name: 'Norwegian', code: 'no' },
   { name: 'Czech', code: 'cs' },
   { name: 'Persian', code: 'fa' },
   { name: 'Danish', code: 'da' },
   { name: 'Polish', code: 'pl' },
   { name: 'Dutch', code: 'nl' },
   { name: 'Portuguese', code: 'pt' },
   { name: 'English', code: 'en' },
   { name: 'Romanian', code: 'ro' },
   { name: 'Esperanto', code: 'eo' },
   { name: 'Russian', code: 'ru' },
   { name: 'Estonian', code: 'et' },
   { name: 'Serbian', code: 'sr' },
   { name: 'Filipino', code: 'tl' },
   { name: 'Slovak', code: 'sk' },
   { name: 'Finnish', code: 'fi' },
   { name: 'Slovenian', code: 'sl' },
   { name: 'French', code: 'fr' },
   { name: 'Spanish', code: 'es' },
   { name: 'Galician', code: 'gl' },
   { name: 'Swahili', code: 'sw' },
   { name: 'Georgian', code: 'ka' },
   { name: 'Swedish', code: 'sv' },
   { name: 'German', code: 'de' },
   { name: 'Tamil', code: 'ta' },
   { name: 'Greek', code: 'el' },
   { name: 'Telugu', code: 'te' },
   { name: 'Gujarati', code: 'gu' },
   { name: 'Thai', code: 'th' },
   { name: 'Haitian Creole', code: 'ht' },
   { name: 'Turkish', code: 'tr' },
   { name: 'Hebrew', code: 'iw' },
   { name: 'Ukrainian', code: 'uk' },
   { name: 'Hindi', code: 'hi' },
   { name: 'Urdu', code: 'ur' },
   { name: 'Hungarian', code: 'hu' },
   { name: 'Vietnamese', code: 'vi' },
   { name: 'Icelandic', code: 'is' },
   { name: 'Welsh', code: 'cy' },
   { name: 'Indonesian', code: 'id' },
   { name: 'Yiddish', code: 'yi' },
];

export const command: ICommand = {
   name: 'Translate',
   description: 'Translates words to the specified language',
   aliases: ['read', 'tl', 't'],
   args: true,
   usage: '-target [language name | language code], -source: optional [language name | language code]',

   async execute(message, args) {
      const argumentsFound: Array<string> = [];

      let source: string | undefined = undefined;
      let target: string | undefined = undefined;

      //Check for any arguments
      args.find((arg, i) => {
         if (arg !== undefined && arg.startsWith('-') && arg.length > 1 && arg[1] !== '-') {
            argumentsFound.push(arg);
            // console.log(chalk.bgRed.bold(`Argument Found: ${arg}`));

            if (arg == '-source') source = args[i + 1];
            else if (arg === '-target') {
               target = args[i + 1];
            }

            args.splice(i, 2);
         }
      });

      let result: { name: string; code: string } | undefined;

      if (target !== undefined) {
         result = LANGUAGE_CODES.find(lang => lang.name.toLowerCase() === target?.toLowerCase());
         if (result) target = result.code;
      }

      //Get the rest of the string after removing arguments
      const query = args.join(' ');

      //Send to API and display result
      translateLanguage(query, target)
         .then(body => {
            //Parse into an Object
            let data = JSON.parse(body).data;

            //Make sure its not an error
            if (!body || !data || !data.translations) return QuickEmbed(message, `Error: Incorrect Target Language Code`);

            //Get Results
            const translations = data.translations[0];
            let sourceLang = translations.detectedSourceLanguage;
            sourceLang = LANGUAGE_CODES.find(lang => lang.code === sourceLang);

            //Create the message
            let content = `\`\`\`yaml
source_language: ${sourceLang.name},
translated_text: ${translations.translatedText}`;
            if (target) content += `\ntarget_language: ${result?.name}\`\`\``;
            else content += `\`\`\``;

            //Send to discord channel
            message.channel.send(content);
         })
         .catch(err => {
            QuickEmbed(message, `Error: ${err.message}`);
         });
   },
};
