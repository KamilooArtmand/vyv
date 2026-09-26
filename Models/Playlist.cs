using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace vyv_player_desktop.Models;

public class Playlist
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public List<PlaylistTrack> PlaylistTracks { get; set; } = new();
}

public class PlaylistTrack
{
    [Key]
    public int Id { get; set; }
    
    public int PlaylistId { get; set; }
    [ForeignKey("PlaylistId")]
    public Playlist Playlist { get; set; } = null!;
    
    public int TrackId { get; set; }
    [ForeignKey("TrackId")]
    public Track Track { get; set; } = null!;
    
    public int OrderIndex { get; set; }
}

public class PlayHistory
{
    [Key]
    public int Id { get; set; }
    
    public int TrackId { get; set; }
    [ForeignKey("TrackId")]
    public Track Track { get; set; } = null!;
    
    public DateTime PlayedAt { get; set; } = DateTime.UtcNow;
}
