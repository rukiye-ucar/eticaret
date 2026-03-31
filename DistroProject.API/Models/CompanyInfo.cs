namespace DistroProject.API.Models;

public class CompanyInfo
{
    public int Id { get; set; }
    public string Key { get; set; } = string.Empty;   // e.g. "hero_title", "mission", "vision"
    public string Value { get; set; } = string.Empty;
    public int SortOrder { get; set; } = 0;
}
