using System.ComponentModel.DataAnnotations;

namespace DistroProject.API.Models;

public class CustomerAddress
{
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }
    public User? User { get; set; }

    public string Title { get; set; } = "Adresim"; // "Ev", "İş", etc.

    [Required]
    public string FullAddress { get; set; } = string.Empty;

    public double Lat { get; set; }
    public double Lng { get; set; }

    public bool IsDefault { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
