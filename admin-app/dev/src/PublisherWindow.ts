import { BrowserWindow } from 'electron'

export class PublisherWindow {
    private _window: BrowserWindow;
    public get Window() : BrowserWindow {
        return this._window;
    }
    
    constructor(scalable: boolean, file: string, width: number, height: number) {
        this._window = new BrowserWindow({
            width: width,
            height: height,
            resizable: scalable,
            icon: "./icon.png",
            webPreferences: {
                nodeIntegration: true,
                plugins: true
            }
            
        })

        this._window.loadFile(file)
        //this.Window.setMenu(null);
    }

    public Close(): void {
        this.Window.close();
    }
}