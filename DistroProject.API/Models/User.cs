namespace DistroProject.API.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty; // We won't store the password in plain text!
    public string Role { get; set; } = "Customer"; // Admin, Customer, Driver
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsPremium { get; set; } = false;
    public decimal Balance { get; set; } = 0; // Negative = debt
}