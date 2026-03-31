using Microsoft.EntityFrameworkCore;
using DistroProject.API.Models;
using System.Collections.Generic;

namespace DistroProject.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Product> Products { get; set; }
    
    // THIS WAS THE MISSING LINE:
    public DbSet<User> Users { get; set; } 
    public DbSet<Order> Orders { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<CustomerAddress> CustomerAddresses { get; set; }
    public DbSet<CompanyInfo> CompanyInfos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>()
            .HasMany(p => p.Categories)
            .WithMany(c => c.Products)
            .UsingEntity(
                "ProductCategory",
                r => r.HasOne(typeof(Category)).WithMany().HasForeignKey("CategoryId"),
                l => l.HasOne(typeof(Product)).WithMany().HasForeignKey("ProductId"),
                j => 
                {
                    j.HasKey("ProductId", "CategoryId");
                });
    }
}