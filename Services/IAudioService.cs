namespace vyv_player_desktop.Services;

public interface IAudioService
{
    void Initialize();
    void Play(string filePath);
    void Pause();
    void Resume();
    void Stop();
    void SetVolume(double volume);
    double GetDuration();
    double GetPosition();
    void SetPosition(double position);
    
    List<(int id, string name)> GetAudioDevices();
    void SetAudioDevice(int deviceId);
    
    void SetEqualizer(double low, double mid, double high);
    float[] GetFFT();
    
    bool IsPlaying { get; }
    
    event Action? OnPlaybackEnded;
}
