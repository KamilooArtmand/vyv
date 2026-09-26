using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using System.IO;
using SixLabors.ImageSharp.Processing;

namespace vyv_player_desktop.Services;

public class ArtworkService
{
    public class ArtworkData
    {
        public string Base64Image { get; set; } = string.Empty;
        public string DominantColorHex { get; set; } = "#a1a1aa";
    }

    public ArtworkData GetArtwork(string filePath)
    {
        var result = new ArtworkData();
        
        try
        {
            if (filePath.StartsWith("http://") || filePath.StartsWith("https://"))
            {
                result.Base64Image = ""; // Can use default radio image
                result.DominantColorHex = "#ff3366"; // Radio theme color
                return result;
            }

            using var fileTags = TagLib.File.Create(filePath);
            if (fileTags.Tag.Pictures.Length > 0)
            {
                var pic = fileTags.Tag.Pictures[0];
                var data = pic.Data.Data;
                
                // Convert to base64 for UI
                result.Base64Image = $"data:{pic.MimeType};base64,{Convert.ToBase64String(data)}";

                // Extract dominant color
                using var image = SixLabors.ImageSharp.Image.Load<Rgba32>(data);
                
                // Resize to 1x1 to get average color extremely fast
                image.Mutate(x => x.Resize(1, 1));
                
                var pixel = image[0, 0];
                result.DominantColorHex = $"#{pixel.R:X2}{pixel.G:X2}{pixel.B:X2}";
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error extracting artwork: {ex.Message}");
        }
        
        return result;
    }
}
