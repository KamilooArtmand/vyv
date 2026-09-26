using vyv_player_desktop.Models;

namespace vyv_player_desktop.Services;

public class RadioService
{
    public List<Track> GetRadioStations()
    {
        return new List<Track>
        {
            new Track { Title = "Lofi Hip Hop Radio", Artist = "Lofi Girl", FilePath = "http://stream.zeno.fm/f3wvbbqmdg8uv", Album = "Live Radio" },
            new Track { Title = "Synthwave / Cyberpunk", Artist = "Nightride FM", FilePath = "http://stream.nightride.fm/nightride.m4a", Album = "Live Radio" },
            new Track { Title = "Classical Masterpieces", Artist = "Venice Classic", FilePath = "http://174.36.206.197:8000/stream", Album = "Live Radio" },
            new Track { Title = "Deep House Lounge", Artist = "Deep House", FilePath = "http://icecast.thisisamped.com/deephouse", Album = "Live Radio" },
            new Track { Title = "Jazz 24", Artist = "Seattle Jazz", FilePath = "https://live.wostreaming.net/direct/ppm-jazz24aac256-ibc1", Album = "Live Radio" }
        };
    }
}
