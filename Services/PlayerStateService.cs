using vyv_player_desktop.Models;

namespace vyv_player_desktop.Services;

public class PlayerStateService
{
    public Track? CurrentTrack { get; private set; }
    public bool IsPlaying { get; private set; }
    public List<LyricLine> CurrentLyrics { get; private set; } = new();
    public int CurrentLyricIndex { get; private set; } = -1;
    public string CurrentCoverUrl { get; private set; } = "https://picsum.photos/400/400?grayscale";
    public string CurrentDominantColor { get; private set; } = "#a1a1aa";
    public string AiMessage { get; private set; } = "";

    public event Action? OnStateChanged;

    public void UpdateTrack(Track? track, string coverUrl, string dominantColor, List<LyricLine> lyrics)
    {
        CurrentTrack = track;
        CurrentCoverUrl = coverUrl;
        CurrentDominantColor = dominantColor;
        CurrentLyrics = lyrics;
        CurrentLyricIndex = -1;
        NotifyStateChanged();
    }

    public void SetPlayingState(bool isPlaying)
    {
        IsPlaying = isPlaying;
        NotifyStateChanged();
    }

    public void UpdateLyricIndex(int index)
    {
        if (CurrentLyricIndex != index)
        {
            CurrentLyricIndex = index;
            NotifyStateChanged();
        }
    }

    public void SetAiMessage(string message)
    {
        AiMessage = message;
        NotifyStateChanged();
    }

    private void NotifyStateChanged() => OnStateChanged?.Invoke();
}
