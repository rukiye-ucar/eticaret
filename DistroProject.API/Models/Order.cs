using System.ComponentModel.DataAnnotations;

namespace DistroProject.API.Models;

public class Order
{
    public int Id { get; set; }
    
    [Required]
    public int ProductId { get; set; } // Which product was ordered?
    public Product? Product { get; set; } // To access product details

    [Required]
    public int CustomerId { get; set; } // Which customer placed the order?
    public User? Customer { get; set; }

    public int Quantity { get; set; } // How many items?
    public decimal TotalPrice { get; set; } // Total amount
    
    public string Status { get; set; } = "Pending"; // Pending, Approved, Shipped, Delivered
    public DateTime OrderDate { get; set; } = DateTime.Now;

    // For Logistics part:
    public int? DriverId { get; set; } // Which driver will deliver this order?
    public User? Driver { get; set; }

    public int DeliveredQuantity { get; set; } // Quantity actually delivered by the driver

    // Delivery Address (for route optimization)
    public int? DeliveryAddressId { get; set; }
    public double? DeliveryLat { get; set; }
    public double? DeliveryLng { get; set; }
    public string? DeliveryAddress { get; set; }
}