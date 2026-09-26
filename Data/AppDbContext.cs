using Microsoft.EntityFrameworkCore;
using vyv_player_desktop.Models;
using System.IO;

namespace vyv_player_desktop.Data;

public class AppDbContext : DbContext
{
    public DbSet<Track> Tracks { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Playlist> Playlists { get; set; } = null!;
    public DbSet<PlaylistTrack> PlaylistTracks { get; set; } = null!;
    public DbSet<PlayHistory> PlayHistories { get; set; } = null!;

    public AppDbContext()
    {
        // Ensure database is created
        Database.EnsureCreated();
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        string dbPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "vyvplayer.db");
        optionsBuilder.UseSqlite($"Data Source={dbPath}");
    }
}
