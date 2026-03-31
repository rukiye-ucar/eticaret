using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using DistroProject.API.Data;
using System.Linq;

namespace DistroProject.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class FinanceController : ControllerBase
{
    private readonly AppDbContext _context;

    public FinanceController(AppDbContext context)
    {
        _context = context;
    }

    // A. Toplam Kar (Total Profit)
    [HttpGet("total-profit")]
    public async Task<IActionResult> GetTotalProfit()
    {
        var totalProfit = await _context.Orders
            .Include(o => o.Product)
            .Where(o => o.Product != null)
            .SumAsync(o => (o.Product!.Price - o.Product.Cost) * o.Quantity);

        return Ok(new { TotalProfit = totalProfit });
    }

    // B. Sipariş Bazlı Kar (Order-Based Profit)
    [HttpGet("order-profit")]
    public async Task<IActionResult> GetOrderProfit()
    {
        var orders = await _context.Orders
            .Include(o => o.Product)
            .Include(o => o.Customer)
            .Where(o => o.Product != null)
            .OrderByDescending(o => o.Id)
            .Select(o => new
            {
                OrderId = o.Id,
                CustomerName = o.Customer != null ? o.Customer.Name : "Bilinmiyor",
                ProductName = o.Product!.Name,
                Quantity = o.Quantity,
                Profit = (o.Product.Price - o.Product.Cost) * o.Quantity,
                OrderDate = o.OrderDate
            })
            .ToListAsync();

        return Ok(orders);
    }

    // C. Ürün Bazlı Kar (Product-Based Profit)
    [HttpGet("product-profit")]
    public async Task<IActionResult> GetProductProfit()
    {
        var groupedProducts = await _context.Orders
            .Include(o => o.Product)
            .Where(o => o.Product != null)
            .GroupBy(o => new { o.ProductId, o.Product!.Name })
            .Select(g => new
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                TotalProfit = g.Sum(o => (o.Product!.Price - o.Product.Cost) * o.Quantity),
                TotalSoldQuantity = g.Sum(o => o.Quantity)
            })
            .OrderByDescending(p => p.TotalProfit)
            .ToListAsync();

        return Ok(groupedProducts);
    }

    // D. Premium Borç Analizi (Debts for Premium Users)
    [HttpGet("debts")]
    public async Task<IActionResult> GetDebts()
    {
        var usersWithDebt = await _context.Users
            .Where(u => u.IsPremium && u.Balance < 0)
            .ToListAsync();

        var result = new List<object>();

        foreach(var user in usersWithDebt)
        {
            var unpaidOrders = await _context.Orders
                .Include(o => o.Product)
                .Where(o => o.CustomerId == user.Id)
                .Select(o => new
                {
                    o.Id,
                    ProductName = o.Product != null ? o.Product.Name : "Bilinmiyor",
                    o.Quantity,
                    o.TotalPrice,
                    OrderDate = o.OrderDate.ToString("dd MMM yyyy HH:mm")
                })
                .ToListAsync();

            result.Add(new
            {
                user.Id,
                user.Name,
                user.Email,
                DebtAmount = Math.Abs(user.Balance),
                UnpaidOrders = unpaidOrders
            });
        }

        return Ok(result);
    }
}
