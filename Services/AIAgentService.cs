namespace vyv_player_desktop.Services;

public class AIAgentService
{
    private readonly LibraryService _library;

    public AIAgentService(LibraryService library)
    {
        _library = library;
    }

    public class AIResult
    {
        public string Action { get; set; } = "None"; // Play, Pause, Next, Search
        public Models.Track? TargetTrack { get; set; }
        public List<Models.Track>? FilteredTracks { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    // A mock local AI parser for offline use
    public AIResult ProcessCommand(string command)
    {
        var result = new AIResult();
        command = command.ToLower().Trim();

        var allTracks = _library.GetAllTracks();

        if (command.Contains("پلی کن") || command.Contains("پخش کن") || command.Contains("play"))
        {
            // Find track name
            var target = allTracks.FirstOrDefault(t => command.Contains(t.Title.ToLower()) || command.Contains(t.Artist.ToLower()));
            if (target != null)
            {
                result.Action = "Play";
                result.TargetTrack = target;
                result.Message = $"در حال پخش: {target.Title}";
            }
            else
            {
                // Play first available or resume
                result.Action = "Play";
                result.Message = "در حال ادامه پخش...";
            }
        }
        else if (command.Contains("توقف") || command.Contains("پاز") || command.Contains("pause"))
        {
            result.Action = "Pause";
            result.Message = "متوقف شد.";
        }
        else if (command.Contains("بعدی") || command.Contains("آهنگ بعد") || command.Contains("next"))
        {
            result.Action = "Next";
            result.Message = "آهنگ بعدی.";
        }
        else if (command.Contains("همه") || command.Contains("all") || command.Contains("برگرد") || command == "")
        {
            result.Action = "Search";
            result.FilteredTracks = allTracks;
            result.Message = "تمام آهنگ‌ها نمایش داده شد.";
        }
        else
        {
            // Assume it's a search
            var searchResults = allTracks.Where(t => 
                t.Title.ToLower().Contains(command) || 
                t.Artist.ToLower().Contains(command) || 
                t.Album.ToLower().Contains(command)).ToList();
                
            result.Action = "Search";
            result.FilteredTracks = searchResults;
            result.Message = $"{searchResults.Count} آهنگ پیدا شد.";
        }

        return result;
    }
}
