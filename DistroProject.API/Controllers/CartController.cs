using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using DistroProject.API.Data;
using DistroProject.API.Models;
using System.Security.Claims;

namespace DistroProject.API.Controllers;

// DTOs
public class AddToCartDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
}

public class UpdateCartDto
{
    public int Quantity { get; set; }
}

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst("userId")?.Value;
        return int.Parse(userIdClaim!);
    }

    // GET: api/Cart — Get current user's cart
    [HttpGet]
    public async Task<ActionResult> GetCart()
    {
        var userId = GetUserId();

        var cartItems = await _context.CartItems
            .Where(c => c.UserId == userId)
            .Include(c => c.Product)
                .ThenInclude(p => p.Categories)
            .ToListAsync();

        var result = cartItems.Select(c => new
        {
            productId = c.ProductId,
            quantity = c.Quantity,
            product = new
            {
                id = c.Product!.Id,
                name = c.Product.Name,
                price = c.Product.Price,
                unitType = c.Product.UnitType,
                stock = c.Product.Stock,
                image = c.Product.Image != null ? Convert.ToBase64String(c.Product.Image) : null,
                imageContentType = c.Product.ImageContentType,
                categories = c.Product.Categories.Select(cat => new { id = cat.Id, name = cat.Name })
            }
        });

        return Ok(result);
    }

    // POST: api/Cart — Add product to cart (or increase quantity)
    [HttpPost]
    public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
    {
        var userId = GetUserId();

        var existing = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId);

        if (existing != null)
        {
            existing.Quantity += dto.Quantity > 0 ? dto.Quantity : 1;
        }
        else
        {
            _context.CartItems.Add(new CartItem
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity > 0 ? dto.Quantity : 1
            });
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    // PUT: api/Cart/{productId} — Update quantity
    [HttpPut("{productId}")]
    public async Task<IActionResult> UpdateQuantity(int productId, [FromBody] UpdateCartDto dto)
    {
        var userId = GetUserId();

        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId);

        if (cartItem == null)
            return NotFound();

        if (dto.Quantity < 1)
        {
            _context.CartItems.Remove(cartItem);
        }
        else
        {
            cartItem.Quantity = dto.Quantity;
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    // DELETE: api/Cart/{productId} — Remove product from cart
    [HttpDelete("{productId}")]
    public async Task<IActionResult> RemoveFromCart(int productId)
    {
        var userId = GetUserId();

        var cartItem = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == productId);

        if (cartItem == null)
            return NotFound();

        _context.CartItems.Remove(cartItem);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // DELETE: api/Cart — Clear entire cart
    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();

        var items = await _context.CartItems
            .Where(c => c.UserId == userId)
            .ToListAsync();

        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();
        return Ok();
    }
}

