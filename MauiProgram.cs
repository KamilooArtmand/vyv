using Microsoft.Extensions.Logging;

namespace vyv_player_desktop;

public static class MauiProgram
{
	public static MauiApp CreateMauiApp()
	{
		var builder = MauiApp.CreateBuilder();
		builder
			.UseMauiApp<App>()
			.ConfigureFonts(fonts =>
			{
				fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
			});

		builder.Services.AddMauiBlazorWebView();
builder.Services.AddDbContext<vyv_player_desktop.Data.AppDbContext>();
builder.Services.AddScoped<vyv_player_desktop.Services.LibraryService>();
builder.Services.AddSingleton<vyv_player_desktop.Services.ArtworkService>();
builder.Services.AddScoped<vyv_player_desktop.Services.AIAgentService>();
builder.Services.AddSingleton<vyv_player_desktop.Services.NativeMediaService>();
builder.Services.AddScoped<vyv_player_desktop.Services.FolderPickerService>();
builder.Services.AddScoped<vyv_player_desktop.Services.LyricsService>();
builder.Services.AddSingleton<vyv_player_desktop.Services.PlayerStateService>();
builder.Services.AddScoped<vyv_player_desktop.Services.RadioService>();
builder.Services.AddSingleton<vyv_player_desktop.Services.AuthService>();
builder.Services.AddSingleton<vyv_player_desktop.Services.NotificationService>();
builder.Services.AddSingleton<vyv_player_desktop.Services.IAudioService, vyv_player_desktop.Services.AudioService>();
#if WINDOWS
builder.Services.AddSingleton<IWindowService, Platforms.Windows.WindowsWindowService>();
#endif

#if DEBUG
		builder.Services.AddBlazorWebViewDeveloperTools();
		builder.Logging.AddDebug();
#endif

		return builder.Build();
	}
}
