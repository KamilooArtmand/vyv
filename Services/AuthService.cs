using vyv_player_desktop.Data;
using vyv_player_desktop.Models;

namespace vyv_player_desktop.Services;

public class AuthService
{
    public User? CurrentUser { get; private set; }
    public event Action? OnAuthStateChanged;

    public async Task<bool> LoginWithEmailAsync(string email, string password)
    {
        // Simple mock encryption/check for demonstration
        await Task.Delay(1000); // simulate network delay
        using var db = new AppDbContext();
        var user = db.Users.FirstOrDefault(u => u.Email == email && u.PasswordHash == password);
        
        if (user != null)
        {
            CurrentUser = user;
            OnAuthStateChanged?.Invoke();
            return true;
        }
        return false;
    }

    public async Task<bool> RegisterWithEmailAsync(string username, string email, string password)
    {
        await Task.Delay(1000);
        using var db = new AppDbContext();
        if (db.Users.Any(u => u.Email == email)) return false;

        var newUser = new User
        {
            Username = username,
            Handle = $"@{username.ToLower().Replace(" ", "")}",
            Email = email,
            PasswordHash = password, // In production, hash this!
            AvatarUrl = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(username)}&background=random",
            FollowersCount = new Random().Next(10, 500), // mock
            FollowingCount = new Random().Next(10, 500)
        };

        db.Users.Add(newUser);
        await db.SaveChangesAsync();

        CurrentUser = newUser;
        OnAuthStateChanged?.Invoke();
        return true;
    }

    public async Task<bool> UpdateUserProfileAsync(string username, string handle, string bio, string avatarUrl, string coverUrl)
    {
        if (CurrentUser == null) return false;
        
        using var db = new AppDbContext();
        var user = db.Users.Find(CurrentUser.Id);
        if (user == null) return false;

        user.Username = username;
        user.Handle = handle.StartsWith("@") ? handle : "@" + handle;
        user.Bio = bio;
        user.AvatarUrl = avatarUrl;
        user.CoverUrl = coverUrl;

        await db.SaveChangesAsync();
        
        // Update local memory reference
        CurrentUser = user;
        OnAuthStateChanged?.Invoke();
        return true;
    }

    public async Task<bool> LoginWithOAuthAsync(string provider)
    {
        // Mock Google/Facebook OAuth flow
        await Task.Delay(2000); // Simulate browser auth flow
        
        using var db = new AppDbContext();
        string mockEmail = $"user@{provider.ToLower()}.com";
        var user = db.Users.FirstOrDefault(u => u.Email == mockEmail);
        
        if (user == null)
        {
            user = new User
            {
                Username = $"{provider} User",
                Handle = $"@{provider.ToLower()}_user",
                Email = mockEmail,
                PasswordHash = "oauth",
                AvatarUrl = $"https://ui-avatars.com/api/?name={provider}&background=random",
                FollowersCount = new Random().Next(100, 10000),
                FollowingCount = new Random().Next(10, 500)
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }

        CurrentUser = user;
        OnAuthStateChanged?.Invoke();
        return true;
    }

    public void Logout()
    {
        CurrentUser = null;
        OnAuthStateChanged?.Invoke();
    }
}
