using Microsoft.Maui.Platform;
using Microsoft.UI.Windowing;
using Microsoft.UI;
using WinRT.Interop;
using System.Runtime.InteropServices;

namespace vyv_player_desktop.Platforms.Windows;

public class WindowsWindowService : IWindowService
{
    [DllImport("user32.dll")]
    private static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    private static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
    private static readonly IntPtr HWND_NOTOPMOST = new IntPtr(-2);
    private const uint SWP_NOMOVE = 0x0002;
    private const uint SWP_NOSIZE = 0x0001;

    public void SetMode(string mode)
    {
        var window = App.Current?.Windows.FirstOrDefault();
        if (window == null) return;

        var nativeWindow = window.Handler?.PlatformView as MauiWinUIWindow;
        if (nativeWindow == null) return;
        
        // Add Mica Backdrop for Windows 11
        nativeWindow.SystemBackdrop = new Microsoft.UI.Xaml.Media.MicaBackdrop();

        IntPtr windowHandle = WindowNative.GetWindowHandle(nativeWindow);
        WindowId windowId = Win32Interop.GetWindowIdFromWindow(windowHandle);
        AppWindow appWindow = AppWindow.GetFromWindowId(windowId);
        var presenter = appWindow.Presenter as OverlappedPresenter;

        if (presenter == null) return;

        // Reset to default first
        presenter.SetBorderAndTitleBar(true, true);
        presenter.IsResizable = true;
        SetWindowPos(windowHandle, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);

        if (mode == "Full")
        {
            appWindow.Resize(new global::Windows.Graphics.SizeInt32(900, 600));
        }
        else if (mode == "Cover")
        {
            presenter.SetBorderAndTitleBar(false, false);
            presenter.IsResizable = false;
            appWindow.Resize(new global::Windows.Graphics.SizeInt32(400, 400));
        }
        else if (mode == "Micro")
        {
            presenter.SetBorderAndTitleBar(false, false);
            presenter.IsResizable = false;
            appWindow.Resize(new global::Windows.Graphics.SizeInt32(600, 70));
            // Make TopMost
            SetWindowPos(windowHandle, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
        }
        else if (mode == "Nano")
        {
            presenter.SetBorderAndTitleBar(false, false);
            presenter.IsResizable = false;
            appWindow.Resize(new global::Windows.Graphics.SizeInt32(120, 120));
            SetWindowPos(windowHandle, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
        }
    }
}
