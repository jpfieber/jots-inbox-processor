# Inbox Processor Plugin

Automate moving files from your Inbox

I have many ways of getting content into my Obsidian vault, and the most basic is to dump it into my "Inbox". My Inbox is a temporary holding space where I put content that needs to be evaluated before it moves on to it's eventual home.  **Inbox Processor** is a tool to help automate some of that evaluation.  By providing configurable Rules, you can have some files automatially moved elsewhere based on naming patterns and file types.

<a href="https://www.buymeacoffee.com/jpfieber" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60"></a>

## Settings

Inbox Processor needs a few simple settings:
- **Inbox Folder**:  Where is your Inbox? You can pick any folder in your vault, I have one called '`_Inbox`' at the root of my vault.
- **Interval (seconds)**:  How often do you want to process your Inbox?  Type in a number, in seconds. I have mine set to `60`. If you leave this blank, it will only process when you run the **Process Inbox Manually** command.
- **Convert Extensions to Lowercase**:  Some features in Obsidian handle upper and lowercase extensions differently, so I like to force all of mine to lowercase, which you can do by enabling this option.

With the basics set, you can then define the **Rules** for each type of file you'd like Inbox Processor to automatically organize:
- **Location** is the root folder for the files to be moved to. I have a folder called `Chrono` (short for 'Chronological') that I use to hold content that I like to organize by date, so I have rules with locations like `Chrono/Documents` and `Chrono/Photos`.
- **Structure** is how the Location folder is organized.  You can leave this blank if you just want files moved to the Location folder, or you can add a structure using 'YMD' notation.  The files name is parsed for a date, and then broken down into year, month and day.  You can then use the letters Y and M to specify a structure:
	- YY = 25
	- YYYY = 2025
	- M = 3
	- MM = 03
	- MMM = Mar
	- MMMM = March
	- I have all mine set to `YYYY/YYYY-MM` so a file like `20250331 - Chemical Bank -- Statement.pdf` will end up in `Chrono/Documents/2025/2025-03`.  If you don't need any structure and just want your files moved to the root of the Location folder, you can leave Structure blank.
- **Extensions** refers to the file extensions you want to affect. Type one or more lowercase extensions separated by "|" and the rule will only apply to files that end with those extensions.  For example, I have a rule with `txt|htm|html|pdf` that moves applicable files with those extensions to my Documents folder.
- **Pattern** is a way of being more specific than just file extension. It uses a 'Regular Expression' (Regex) to specify the pattern of the filename, not including the extension, that you want to move. For example, I have a rule with `^\d{8}_\d{6}` that I use for files with extensions `jpg|png`.  Translated, that means "Starting from the beginning of the filename, look for a name that has 8 numbers followed by an underscore and then another 6 numbers (I use https://regex101.com/ to figure out the proper expressions).  If you just want every file with a particular extension moved, you can leave this blank.
- **Controls**: is where you can delete an unneeded rule, or re-order the existing rules.  The rules are process from top to bottom, so if a file fits the first rule, it will be processed, and the rest of the rules will not apply to it.  This implies that more specific rules likely should be at the top, and more general rules at the bottom.
- You can use the **Add Rule** button at the bottom to add an additional rule.

## Support

- If you want to report a bug, it would be best to start an **Issue** on the [GitHub page](https://github.com/jpfieber/jots-inbox-processor/issues).
- If you'd like to discuss how the plugin works, the best place would be the [JOTS SubReddit](https://www.reddit.com/r/Jots/)

## JOTS

While this plugin works on it's own in most any vault, it is part of a larger system called <a href="https://jots.life">JOTS: Joe's Obsidian Tracking System</a>. Learn more about it <a href="https://jots.life">here</a>.

![JOTS-Logo-64](https://github.com/user-attachments/assets/e29ba5d7-8bdd-4cd9-8336-5fa35b7b593e)

## Support My Work

If this plugin helped you and you wish to contribute:

<a href="https://www.buymeacoffee.com/jpfieber" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="60"></a>

- <a href="https://github.com/sponsors/jpfieber">GitHub Sponsor</a>
- <a href="https://www.paypal.com/paypalme/jpfieber">PayPal</a>

Your support helps maintain and improve this project. Thank you!
