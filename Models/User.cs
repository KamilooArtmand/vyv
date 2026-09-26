using System.ComponentModel.DataAnnotations;

namespace vyv_player_desktop.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    
    [MaxLength(50)]
    public string Handle { get; set; } = string.Empty; // e.g. @kamiii
    
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = "https://ui-avatars.com/api/?name=User&background=random";
    public string CoverUrl { get; set; } = "https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=800&q=80";
    
    [MaxLength(160)]
    public string Bio { get; set; } = "عاشق موسیقی و دنیای تکنولوژی...";
    
    public int FollowersCount { get; set; } = 0;
    public int FollowingCount { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
