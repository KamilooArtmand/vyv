using CommunityToolkit.WinUI.Notifications;

namespace vyv_player_desktop.Services;

public class NotificationService
{
    public void ShowToast(string title, string content, string imageUrl = "")
    {
        try
        {
            var builder = new ToastContentBuilder()
                .AddText(title)
                .AddText(content);
                
            if (!string.IsNullOrEmpty(imageUrl))
            {
                // Note: UWP Toast prefers local ms-appx:/// images or HTTP URLs.
                // We'll use a generic URL for mock releases.
                builder.AddHeroImage(new Uri(imageUrl));
            }
            
            builder.Show();
        }
        catch (Exception ex)
        {
            Console.WriteLine("Failed to show toast notification: " + ex.Message);
        }
    }

    public void CheckForNewsAndUpdates()
    {
        // Mocking a fetch for new releases/updates
        var news = new List<(string Title, string Content, string ImageUrl)>
        {
            ("آلبوم جدید منتشر شد! 🎵", "آلبوم جدید The Weeknd به نام Dawn FM روی کلاد قرار گرفت.", "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80"),
            ("پادکست جدید 🎙️", "اپیزود 42 پادکست Tech Talk هم‌اکنون قابل گوش دادن است.", "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80"),
            ("بروزرسانی سیستم عامل ⚙️", "نسخه 1.2 نرم‌افزار با قابلیت‌های هوش مصنوعی پیشرفته آماده نصب است.", "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&q=80")
        };

        // Pick a random news item to simulate live updates
        var randomNews = news[new Random().Next(news.Count)];
        
        ShowToast(randomNews.Title, randomNews.Content, randomNews.ImageUrl);
    }
}
