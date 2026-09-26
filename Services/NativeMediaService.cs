using Windows.Media;
using Windows.Media.Playback;
using Windows.Storage;

namespace vyv_player_desktop.Services;

public class NativeMediaService
{
    private MediaPlayer _dummyPlayer;
    private SystemMediaTransportControls _smtc;
    private Action? _onPlay;
    private Action? _onPause;
    private Action? _onNext;
    private Action? _onPrev;

    public NativeMediaService()
    {
        _dummyPlayer = new MediaPlayer();
        // We don't actually play anything with this, just use it for SMTC
        _dummyPlayer.CommandManager.IsEnabled = false;
        
        _smtc = _dummyPlayer.SystemMediaTransportControls;
        _smtc.IsPlayEnabled = true;
        _smtc.IsPauseEnabled = true;
        _smtc.IsNextEnabled = true;
        _smtc.IsPreviousEnabled = true;

        _smtc.ButtonPressed += Smtc_ButtonPressed;
    }

    public void RegisterCallbacks(Action onPlay, Action onPause, Action onNext, Action onPrev)
    {
        _onPlay = onPlay;
        _onPause = onPause;
        _onNext = onNext;
        _onPrev = onPrev;
    }

    private void Smtc_ButtonPressed(SystemMediaTransportControls sender, SystemMediaTransportControlsButtonPressedEventArgs args)
    {
        switch (args.Button)
        {
            case SystemMediaTransportControlsButton.Play:
                _onPlay?.Invoke();
                break;
            case SystemMediaTransportControlsButton.Pause:
                _onPause?.Invoke();
                break;
            case SystemMediaTransportControlsButton.Next:
                _onNext?.Invoke();
                break;
            case SystemMediaTransportControlsButton.Previous:
                _onPrev?.Invoke();
                break;
        }
    }

    public void UpdateState(bool isPlaying)
    {
        _smtc.PlaybackStatus = isPlaying ? MediaPlaybackStatus.Playing : MediaPlaybackStatus.Paused;
    }

    public void UpdateMetadata(string title, string artist)
    {
        var updater = _smtc.DisplayUpdater;
        updater.Type = MediaPlaybackType.Music;
        updater.MusicProperties.Title = title;
        updater.MusicProperties.Artist = artist;
        updater.Update();
    }
}
