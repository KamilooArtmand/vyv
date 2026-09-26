using System.Text.RegularExpressions;

namespace vyv_player_desktop.Services;

public class LyricLine
{
    public TimeSpan Time { get; set; }
    public string Text { get; set; } = "";
}

public class LyricsService
{
    public List<LyricLine> ParseLrc(string mp3FilePath)
    {
        var lyrics = new List<LyricLine>();
        try
        {
            if (mp3FilePath.StartsWith("http://") || mp3FilePath.StartsWith("https://")) return lyrics;

            var lrcPath = Path.ChangeExtension(mp3FilePath, ".lrc");
            if (!File.Exists(lrcPath)) return lyrics;

            var lines = File.ReadAllLines(lrcPath);
            var regex = new Regex(@"\[(\d+):(\d+\.\d+)\](.*)");

            foreach (var line in lines)
            {
                var match = regex.Match(line);
                if (match.Success)
                {
                    int minutes = int.Parse(match.Groups[1].Value);
                    double seconds = double.Parse(match.Groups[2].Value);
                    string text = match.Groups[3].Value.Trim();

                    lyrics.Add(new LyricLine
                    {
                        Time = TimeSpan.FromMinutes(minutes) + TimeSpan.FromSeconds(seconds),
                        Text = text
                    });
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Lyrics Error: {ex.Message}");
        }

        return lyrics.OrderBy(l => l.Time).ToList();
    }
}
