namespace DistroProject.API.DTOs;

public class DeliveryCheckoutDto
{
    public double? DeliveryLat { get; set; }
    public double? DeliveryLng { get; set; }
    public string? DeliveryAddress { get; set; }
    public int? DeliveryAddressId { get; set; }
}
