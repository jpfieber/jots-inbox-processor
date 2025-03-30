
# Obsidian - Inbox Processor Plugin

Automate moving files from your Inbox

I have many ways of getting content into Obsidian, and the most basic is to dump it into my "Inbox". The Inbox is like a waiting room, files go there and are triaged.  If a file was expected, like a bank statement, it's hurried off to it's appointment. If a file is unexpected, like something I clipped from the internet, then it will need to wait until I can find out more about it.  **Inbox Processor** is like the receptionist in that waiting room, directing files to where they need to go, or making them wait.

The way it works is by setting up Rules based on patterns in your filenames. If a filename matches one of the rules, the file is sent to a specified folder, and organized there in a specified way.

```html
<script type="text/javascript" src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js" data-name="bmc-button" data-slug="n7Rd8LVmR9" data-color="#FFDD00" data-emoji=""  data-font="Cookie" data-text="Buy me a coffee" data-outline-color="#000000" data-font-color="#000000" data-coffee-color="#ffffff" ></script>
```

## Settings

Inbox Processor needs a few simple settings:
- **Inbox Folder**:  Where is your Inbox? You can pick any folder in your vault, I have one called '`_Inbox`' at the root of my vault.
- **Interval (seconds)**:  How often do you want to process your Inbox?  Type in a number, in seconds. I have mine set to `60`. If you leave this blank, it will only process when you run the **Process Inbox Manually** command.
- **Convert Extensions to Lowercase**:  Some features in Obsidian handle upper and lowercase extensions differently, so I like to force all of mine to lowercase, which you can do by enabling this option.

With the basics set, you can then define the **Rules** for each type of file you'd like Inbox Processor to automatically organize:
- **Location** is the root folder for the files to be moved to. I have a folder called `Chronological` that I user to hold content that I like to organize by date, so I have rules with locations like `Chronological/Documents` and `Chronological/Photos`.
- **Structure** is how the Location folder is organized.  You can leave this blank if you just want files moved to the Location folder, or you can add a structure using YMD notation.  The files name is parsed for a date, and then broken down into year, month and day.  You can then use the letters Y and M to specify a structure:
	- YY = 25
	- YYYY = 2025
	- M = 3
	- MM = 03
	- MMM = Mar
	- MMMM = March
	- I have all mine set to `YYYY/YYYY-MM` so a file like `20250331 - My Bank -- Statement.pdf` will end up in `Chronological/Documents/2025/2025-03`.  If you don't need any structure and just want your files moved to the root of the Location folder, you can leave Structure blank.
- **Extensions** refers to the file extensions you want to affect. Type one or more lowercase extensions separated by "|" and the rule will only apply to files that end with those extensions.  For example, I have a rule with `txt|htm|html|pdf` that moves applicable files with those extensions to my Documents folder.
- **Pattern** is a way of being more specific than just file extension. It uses a 'Regular Expression' (Regex) to specify the pattern of the filename, not including the extension, that you want to move. For example, I have a rule with `^\d{8}_\d{6}` that I use for files with extensions `jpg|png`.  Translated, that means "Starting from the beginning of the filename, look for a name that has 8 numbers followed by an underscore and then another 6 numbers (I use https://regex101.com/ to figure out the proper expressions).  If you just want every file with a particular extension moved, you can leave this blank.
- **Controls**: is where you can delete an unneeded rule, or re-order the existing rules.  The rules are process from top to bottom, so if a file fits the first rule, it will be processed, and the rest of the rules will not apply to it.  This implies that more specific rules likely should be at the top, and more general rules at the bottom.
- You can use the **Add Rule** button at the bottom to add an additional rule.

There are three ways files are handled:
1. Known files:  I use a specific format for the PDF documents I save (receipts, bank statements, mail, etc) that looks like this:  YYYYMMDD - <Important> -- <Extra>.  So as an example, If I'm saving a bank statement and want it in my vault, I'll title the file "20250331 - My Bank -- Statement.pdf".
