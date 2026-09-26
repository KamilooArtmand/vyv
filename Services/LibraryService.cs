using System.IO;
using vyv_player_desktop.Data;
using vyv_player_desktop.Models;

namespace vyv_player_desktop.Services;

public class LibraryService
{
    private readonly AppDbContext _db;

    public LibraryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task ScanFolderAsync(string folderPath)
    {
        if (!Directory.Exists(folderPath)) return;

        await Task.Run(async () => 
        {
            var files = Directory.GetFiles(folderPath, "*.*", SearchOption.AllDirectories)
                                 .Where(f => f.EndsWith(".mp3") || f.EndsWith(".flac") || f.EndsWith(".wav"))
                                 .ToList();

            int batchCount = 0;
            foreach (var file in files)
            {
                // Skip if already in DB
                if (_db.Tracks.Any(t => t.FilePath == file)) continue;

                try
                {
                    using var fileTags = TagLib.File.Create(file);
                    
                    var track = new Track
                    {
                        FilePath = file,
                        Title = string.IsNullOrEmpty(fileTags.Tag.Title) ? Path.GetFileNameWithoutExtension(file) : fileTags.Tag.Title,
                        Artist = string.IsNullOrEmpty(fileTags.Tag.FirstPerformer) ? "Unknown Artist" : fileTags.Tag.FirstPerformer,
                        Album = string.IsNullOrEmpty(fileTags.Tag.Album) ? "Unknown Album" : fileTags.Tag.Album,
                        DurationSeconds = fileTags.Properties.Duration.TotalSeconds
                    };

                    _db.Tracks.Add(track);
                    batchCount++;

                    // Save in batches to prevent massive memory usage and UI lock
                    if (batchCount > 50)
                    {
                        await _db.SaveChangesAsync();
                        batchCount = 0;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error reading tags for {file}: {ex.Message}");
                }
            }

            if (batchCount > 0)
            {
                await _db.SaveChangesAsync();
            }
        });
    }

    public List<Track> GetAllTracks()
    {
        return _db.Tracks.OrderByDescending(t => t.AddedAt).ToList();
    }

    public void ToggleFavorite(int trackId)
    {
        var track = _db.Tracks.Find(trackId);
        if (track != null)
        {
            track.IsFavorite = !track.IsFavorite;
            _db.SaveChanges();
        }
    }

    public List<Track> GetFavorites() => _db.Tracks.Where(t => t.IsFavorite).ToList();

    public void AddToHistory(int trackId)
    {
        _db.PlayHistories.Add(new PlayHistory { TrackId = trackId, PlayedAt = DateTime.UtcNow });
        _db.SaveChanges();
    }

    public List<Track> GetHistory()
    {
        return _db.PlayHistories
            .OrderByDescending(h => h.PlayedAt)
            .Select(h => h.Track)
            .Distinct()
            .Take(50)
            .ToList();
    }
}
