using System.ComponentModel.DataAnnotations;

namespace vyv_player_desktop.Models;

public class Track
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public string FilePath { get; set; } = string.Empty;
    
    public string Title { get; set; } = "Unknown Title";
    public string Artist { get; set; } = "Unknown Artist";
    public string Album { get; set; } = "Unknown Album";
    public double DurationSeconds { get; set; }
    
    // Extracted Hex color from album art
    public string DominantColorHex { get; set; } = "#ffffff"; 
    
    public bool IsFavorite { get; set; } = false;
    
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
