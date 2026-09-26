using Microsoft.Maui.Platform;
using WinRT.Interop;
using Windows.Storage.Pickers;

namespace vyv_player_desktop.Services;

public class FolderPickerService
{
    public async Task<string?> PickFolderAsync()
    {
        try
        {
            var window = App.Current?.Windows.FirstOrDefault();
            if (window == null) return null;

            var nativeWindow = window.Handler?.PlatformView as MauiWinUIWindow;
            if (nativeWindow == null) return null;

            IntPtr windowHandle = WindowNative.GetWindowHandle(nativeWindow);

            var folderPicker = new FolderPicker();
            folderPicker.SuggestedStartLocation = PickerLocationId.MusicLibrary;
            folderPicker.FileTypeFilter.Add("*");

            WinRT.Interop.InitializeWithWindow.Initialize(folderPicker, windowHandle);

            var result = await folderPicker.PickSingleFolderAsync();
            if (result != null)
            {
                return result.Path;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"FolderPicker Error: {ex.Message}");
        }

        return null;
    }
}
