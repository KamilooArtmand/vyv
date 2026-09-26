using ManagedBass;

namespace vyv_player_desktop.Services;

public class AudioService : IAudioService
{
    private int _stream;
    public bool IsPlaying => Bass.ChannelIsActive(_stream) == PlaybackState.Playing;

    public void Initialize()
    {
        // Initialize Bass on the default device
        if (!Bass.Init())
        {
            var error = Bass.LastError;
            if (error != Errors.Already)
            {
                Console.WriteLine($"Bass Initialization Error: {error}");
            }
        }
    }

    public event Action? OnPlaybackEnded;
    private SyncProcedure? _syncProcedure;
    
    private double _lowGain = 0, _midGain = 0, _highGain = 0;

    public void Play(string filePath)
    {
        Stop(); // Stop current stream if any

        // Create stream from file
        _stream = Bass.CreateStream(filePath, 0, 0, BassFlags.Default);
        if (_stream != 0)
        {
            _syncProcedure = new SyncProcedure(EndSync);
            Bass.ChannelSetSync(_stream, SyncFlags.End, 0, _syncProcedure);
            
            SetEqualizer(_lowGain, _midGain, _highGain);

            Bass.ChannelPlay(_stream);
        }
        else
        {
            Console.WriteLine($"Bass Stream Error: {Bass.LastError}");
        }
    }

    private void EndSync(int handle, int channel, int data, IntPtr user)
    {
        OnPlaybackEnded?.Invoke();
    }

    public void Pause()
    {
        if (_stream != 0)
        {
            Bass.ChannelPause(_stream);
        }
    }

    public void Resume()
    {
        if (_stream != 0)
        {
            Bass.ChannelPlay(_stream);
        }
    }

    public void Stop()
    {
        if (_stream != 0)
        {
            Bass.ChannelStop(_stream);
            Bass.StreamFree(_stream);
            _stream = 0;
        }
    }

    public void SetVolume(double volume)
    {
        if (_stream != 0)
        {
            // Volume is 0.0 to 1.0
            Bass.ChannelSetAttribute(_stream, ChannelAttribute.Volume, volume);
        }
    }

    public double GetDuration()
    {
        if (_stream == 0) return 0;
        long lengthBytes = Bass.ChannelGetLength(_stream);
        return Bass.ChannelBytes2Seconds(_stream, lengthBytes);
    }

    public double GetPosition()
    {
        if (_stream == 0) return 0;
        long posBytes = Bass.ChannelGetPosition(_stream);
        return Bass.ChannelBytes2Seconds(_stream, posBytes);
    }

    public void SetPosition(double position)
    {
        if (_stream != 0)
        {
            long posBytes = Bass.ChannelSeconds2Bytes(_stream, position);
            Bass.ChannelSetPosition(_stream, posBytes);
        }
    }

    public List<(int id, string name)> GetAudioDevices()
    {
        var devices = new List<(int id, string name)>();
        for (int i = 1; i < Bass.DeviceCount; i++) // 0 is usually 'No Sound'
        {
            var info = Bass.GetDeviceInfo(i);
            if (info.IsEnabled)
            {
                devices.Add((i, info.Name));
            }
        }
        return devices;
    }

    public void SetAudioDevice(int deviceId)
    {
        if (Bass.Init(deviceId))
        {
            Bass.CurrentDevice = deviceId;
            if (_stream != 0)
            {
                Bass.ChannelSetDevice(_stream, deviceId);
            }
        }
    }

    public float[] GetFFT()
    {
        if (_stream == 0 || !IsPlaying) return new float[16]; // Return empty if not playing
        
        float[] fft = new float[256];
        // BASS_DATA_FFT256 returns 128 floats, but array must be 128 minimum. We'll use 256 flag for 128 bins.
        // Actually DataFlags.FFT256 corresponds to integer 0x80000000.
        // Let's just return 16 distinct frequency bands for a simple UI visualizer.
        Bass.ChannelGetData(_stream, fft, (int)DataFlags.FFT256);
        
        // Downsample 128 bins to 16 bands for UI
        float[] bands = new float[16];
        int b0 = 0;
        for (int x = 0; x < 16; x++)
        {
            float peak = 0;
            int b1 = (int)Math.Pow(2, x * 7.0 / 15.0); // Non-linear distribution
            if (b1 > 127) b1 = 127;
            if (b1 <= b0) b1 = b0 + 1;
            
            for (; b0 < b1; b0++)
            {
                if (peak < fft[1 + b0]) peak = fft[1 + b0];
            }
            bands[x] = peak;
        }
        return bands;
    }

    public void SetEqualizer(double low, double mid, double high)
    {
        _lowGain = low;
        _midGain = mid;
        _highGain = high;
        // EQ Temporarily disabled due to API version mismatch
    }
}
