using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using DistroProject.API.Data;
using System.Linq;

namespace DistroProject.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        // 1. Toplam Ciro & Toplam Kar
        var orders = await _context.Orders
            .Include(o => o.Product)
            .Where(o => o.Product != null)
            .ToListAsync();

        var totalRevenue = orders.Sum(o => o.TotalPrice);
        var totalProfit = orders.Sum(o => (o.Product!.Price - o.Product.Cost) * o.Quantity);

        // 2. Günlük Satış (Ciro)
        var today = DateTime.Today;
        var dailySales = orders
            .Where(o => o.OrderDate.Date == today)
            .Sum(o => o.TotalPrice);

        // 3. Ödenmemiş sipariş sayısı (Pending orders)
        var pendingOrdersCount = orders.Count(o => o.Status == "Pending");

        // 4. Günlük satış grafiği (Son 7 gün ciro bazında gruplama)
        var sevenDaysAgo = today.AddDays(-6);
        var recentOrders = orders.Where(o => o.OrderDate.Date >= sevenDaysAgo).ToList();
        
        var dailySalesChart = Enumerable.Range(0, 7)
            .Select(d => sevenDaysAgo.AddDays(d))
            .Select(date => new 
            {
                date = date.ToString("dd MMM yyyy"),
                revenue = recentOrders.Where(o => o.OrderDate.Date == date).Sum(o => o.TotalPrice)
            })
            .ToList();

        // 5. En çok satılan ürünler
        var topProducts = orders
            .GroupBy(o => o.Product!.Name)
            .Select(g => new
            {
                productName = g.Key,
                totalSold = g.Sum(o => o.Quantity)
            })
            .OrderByDescending(x => x.totalSold)
            .Take(5)
            .ToList();

        // 6. En çok satılan kategoriler
        // To get categories per product efficiently:
        var ordersWithCategories = await _context.Orders
            .Include(o => o.Product)
                .ThenInclude(p => p.Categories)
            .Where(o => o.Product != null)
            .ToListAsync();

        var topCategories = ordersWithCategories
            .SelectMany(o => o.Product!.Categories, (o, cat) => new { o.Quantity, CategoryName = cat.Name })
            .GroupBy(x => x.CategoryName)
            .Select(g => new
            {
                categoryName = g.Key,
                totalSold = g.Sum(x => x.Quantity)
            })
            .OrderByDescending(x => x.totalSold)
            .Take(5)
            .ToList();

        // Combine Response
        return Ok(new
        {
            totalRevenue,
            totalProfit,
            dailySales,
            pendingOrdersCount,
            dailySalesChart,
            topProducts,
            topCategories
        });
    }
}
