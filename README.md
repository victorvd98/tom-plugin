# Volume Cutter (CEP Panel for Adobe Premiere Pro)

A minimal Adobe CEP extension that adds a dockable panel to Premiere Pro.  
Currently, it displays a threshold input and button that triggers a placeholder script in Premiere.  
This is the starting point for building an automated "cut audio below X dB" tool.

## Features
- Loads as a dockable panel in Premiere Pro.
- Sends user input from HTML/JS UI to ExtendScript (`.jsx`) inside Premiere.
- Easy to extend with audio export and analysis logic.

## Installation
1. Copy the `MyVolumeCutter` folder into your Adobe CEP extensions folder:

   **Windows**  
   `C:\Users\<YourUser>\AppData\Roaming\Adobe\CEP\extensions\`

   **macOS**  
   `~/Library/Application Support/Adobe/CEP/extensions/`

2. Enable unsigned extensions:

   **Windows**  
   ```sh
   reg add HKCU\Software\Adobe\CSXS.9 /v PlayerDebugMode /t REG_SZ /d 1 /f

   **macOS** 
   defaults write com.adobe.CSXS.9 PlayerDebugMode 1