using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using DistroProject.API.Data;
using DistroProject.API.Models;
using DistroProject.API.DTOs;
using System.Security.Claims;

namespace DistroProject.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Only authenticated users can access the order system!
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    // 1. Create Order (Everyone - Customers)
    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(Order order)
    {
        // Get the user ID from the token
        var userId = User.FindFirst("userId")?.Value;
        if (userId != null) order.CustomerId = int.Parse(userId);

        // Get product price and calculate total amount
        var product = await _context.Products.FindAsync(order.ProductId);
        if (product == null) return BadRequest("Product not found!");

        order.TotalPrice = product.Price * order.Quantity;
        order.OrderDate = DateTime.Now;
        order.Status = "Pending"; // Waiting for approval

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return Ok(order);
    }

    // Get current customer's orders
    [HttpGet("my-orders")]
    public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
    {
        var userId = User.FindFirst("userId")?.Value;
        if (userId == null) return Unauthorized();

        return await _context.Orders
            .Include(o => o.Product)
            .Where(o => o.CustomerId == int.Parse(userId))
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    // Checkout: Convert all cart items to orders and clear cart
    [HttpPost("checkout")]
    public async Task<ActionResult> Checkout([FromBody] DeliveryCheckoutDto? dto = null)
    {
        var userId = User.FindFirst("userId")?.Value;
        if (userId == null) return Unauthorized();

        var uid = int.Parse(userId);

        var cartItems = await _context.CartItems
            .Where(c => c.UserId == uid)
            .Include(c => c.Product)
            .ToListAsync();

        if (!cartItems.Any())
            return BadRequest("Cart is empty!");

        var orders = new List<Order>();

        foreach (var item in cartItems)
        {
            if (item.Product == null) continue;

            var order = new Order
            {
                ProductId = item.ProductId,
                CustomerId = uid,
                Quantity = item.Quantity,
                TotalPrice = item.Product.Price * item.Quantity,
                OrderDate = DateTime.Now,
                Status = "Pending",
                DeliveryLat = dto?.DeliveryLat,
                DeliveryLng = dto?.DeliveryLng,
                DeliveryAddress = dto?.DeliveryAddress,
                DeliveryAddressId = dto?.DeliveryAddressId
            };

            _context.Orders.Add(order);
            orders.Add(order);
        }

        // Clear the cart
        _context.CartItems.RemoveRange(cartItems);

        await _context.SaveChangesAsync();

        return Ok(orders);
    }

    // Pay Later checkout for premium customers
    [HttpPost("checkout-pay-later")]
    public async Task<ActionResult> CheckoutPayLater([FromBody] DeliveryCheckoutDto? dto = null)
    {
        var userId = User.FindFirst("userId")?.Value;
        if (userId == null) return Unauthorized();

        var uid = int.Parse(userId);
        var user = await _context.Users.FindAsync(uid);
        if (user == null) return NotFound();
        if (!user.IsPremium) return BadRequest("Only premium customers can use pay later.");

        var cartItems = await _context.CartItems
            .Where(c => c.UserId == uid)
            .Include(c => c.Product)
            .ToListAsync();

        if (!cartItems.Any())
            return BadRequest("Cart is empty!");

        var orders = new List<Order>();
        decimal totalAmount = 0;

        foreach (var item in cartItems)
        {
            if (item.Product == null) continue;

            var orderTotal = item.Product.Price * item.Quantity;
            totalAmount += orderTotal;

            var order = new Order
            {
                ProductId = item.ProductId,
                CustomerId = uid,
                Quantity = item.Quantity,
                TotalPrice = orderTotal,
                OrderDate = DateTime.Now,
                Status = "Pending",
                DeliveryLat = dto?.DeliveryLat,
                DeliveryLng = dto?.DeliveryLng,
                DeliveryAddress = dto?.DeliveryAddress,
                DeliveryAddressId = dto?.DeliveryAddressId
            };

            _context.Orders.Add(order);
            orders.Add(order);
        }

        // Deduct from balance (goes negative = debt)
        user.Balance -= totalAmount;

        // Clear the cart
        _context.CartItems.RemoveRange(cartItems);

        await _context.SaveChangesAsync();

        return Ok(new { orders, balance = user.Balance });
    }

    // Get all orders (Admin Only)
    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<Order>>> GetAllOrders()
    {
        return await _context.Orders
            .Include(o => o.Product)
            .Include(o => o.Customer)
            .Include(o => o.Driver)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    // 2. See Pending Orders (Admin Only)
    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<Order>>> GetPendingOrders()
    {
        return await _context.Orders
            .Include(o => o.Product)
            .Include(o => o.Customer)
            .Where(o => o.Status == "Pending")
            .ToListAsync();
    }

    // 3. Assign Order to Driver (Admin Only)
    [HttpPut("assign-driver/{orderId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignDriver(int orderId, int driverId)
    {
        var order = await _context.Orders.FindAsync(orderId);
        if (order == null) return NotFound();

        order.DriverId = driverId;
        order.Status = "Shipped"; // Shipped

        await _context.SaveChangesAsync();
        return Ok(new { message = "Order assigned to driver and shipped!" });
    }

    // 3b. Assign Driver to multiple orders at once (Admin Only)
    [HttpPut("assign-driver-bulk")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignDriverBulk([FromQuery] int driverId, [FromBody] List<int> orderIds)
    {
        var orders = await _context.Orders
            .Where(o => orderIds.Contains(o.Id))
            .ToListAsync();

        if (!orders.Any()) return NotFound("No orders found!");

        foreach (var order in orders)
        {
            order.DriverId = driverId;
            order.Status = "Shipped";
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = $"{orders.Count} orders assigned to driver and shipped!" });
    }

    // 4. Driver's Own Delivery List (Driver Only)
    [HttpGet("my-deliveries")]
    [Authorize(Roles = "Driver")]
    public async Task<ActionResult<IEnumerable<Order>>> GetMyDeliveries()
    {
        var driverId = User.FindFirst("userId")?.Value;
        return await _context.Orders
            .Include(o => o.Product)
            .Include(o => o.Customer)
            .Where(o => o.DriverId == int.Parse(driverId!) && o.Status == "Shipped")
            .ToListAsync();
    }

    // 4b. Driver's Completed Deliveries (Driver Only)
    [HttpGet("my-delivered")]
    [Authorize(Roles = "Driver")]
    public async Task<ActionResult<IEnumerable<Order>>> GetMyDelivered()
    {
        var driverId = User.FindFirst("userId")?.Value;
        return await _context.Orders
            .Include(o => o.Product)
            .Include(o => o.Customer)
            .Where(o => o.DriverId == int.Parse(driverId!) && 
                       (o.Status == "Delivered" || o.Status == "PartialDelivered"))
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    // 5. Deliver Order and Deduct from Stock (Driver Only)
[HttpPut("deliver-order/{orderId}")]
[Authorize(Roles = "Driver")]
public async Task<IActionResult> DeliverOrder(int orderId, [FromQuery] int actualDeliveredQuantity)
{
    // 1. Find Order and Product
    var order = await _context.Orders.Include(o => o.Product).FirstOrDefaultAsync(o => o.Id == orderId);
    
    if (order == null) return NotFound("Order not found!");
    if (order.Status != "Shipped") return BadRequest("Order is not in shipping stage!");

    // 2. Quantity Check
    if (actualDeliveredQuantity > order.Quantity)
        return BadRequest("Cannot deliver more items than ordered!");

    // 3. Save Delivered Quantity
    order.DeliveredQuantity = actualDeliveredQuantity;

    // 4. Deduct Actual Delivered Quantity from Stock
    if (order.Product != null)
    {
        if (order.Product.Stock < actualDeliveredQuantity)
            return BadRequest("Insufficient stock!");
            
        order.Product.Stock -= actualDeliveredQuantity;
    }

    // 5. Determine Status (Partial if difference exists, otherwise Delivered)
    if (actualDeliveredQuantity < order.Quantity)
    {
        order.Status = "PartialDelivered"; // Partial Delivery
    }
    else
    {
        order.Status = "Delivered"; // Full Delivery
    }

    await _context.SaveChangesAsync();

    return Ok(new { 
        message = order.Status == "PartialDelivered" 
            ? $"Partial delivery made: {order.Quantity - actualDeliveredQuantity} items missing." 
            : "Order delivered successfully.",
        status = order.Status,
        kalanStok = order.Product?.Stock 
    });
}
}