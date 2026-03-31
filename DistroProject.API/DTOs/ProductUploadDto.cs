using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace DistroProject.API.DTOs;

public class ProductUploadDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public decimal Price { get; set; }

    public decimal Cost { get; set; } = 0;

    public string UnitType { get; set; } = "Piece";

    public int Stock { get; set; }

    public IFormFile? ImageFile { get; set; }

    public List<int> CategoryIds { get; set; } = new();
}
