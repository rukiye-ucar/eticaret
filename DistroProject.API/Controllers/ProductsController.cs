using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization; // 1. Added this library
using DistroProject.API.Data;
using DistroProject.API.Models;
using DistroProject.API.DTOs;

namespace DistroProject.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    // Everyone can see products (Customers, Drivers, etc.)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        return await _context.Products.Include(p => p.Categories).ToListAsync();
    }

    // Get single product by ID
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products.Include(p => p.Categories).FirstOrDefaultAsync(p => p.Id == id);
        if (product == null) return NotFound();
        return product;
    }

    // ONLY ADMINS CAN ADD PRODUCTS
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Product>> PostProduct([FromForm] DTOs.ProductUploadDto productDto)
    {
        var product = new Product
        {
            Name = productDto.Name,
            Price = productDto.Price,
            Cost = productDto.Cost,
            UnitType = productDto.UnitType,
            Stock = productDto.Stock,
            IsActive = true,
            CreatedAt = DateTime.Now
        };

        if (productDto.CategoryIds != null && productDto.CategoryIds.Count > 0)
        {
            var categories = await _context.Categories
                .Where(c => productDto.CategoryIds.Contains(c.Id))
                .ToListAsync();

            foreach (var category in categories)
            {
                product.Categories.Add(category);
            }
        }

        if (productDto.ImageFile != null && productDto.ImageFile.Length > 0)
        {
            using (var memoryStream = new MemoryStream())
            {
                await productDto.ImageFile.CopyToAsync(memoryStream);
                product.Image = memoryStream.ToArray();
                product.ImageContentType = productDto.ImageFile.ContentType;
            }
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return Ok(product);
    }

    // UPDATE PRODUCT
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> PutProduct(int id, [FromForm] ProductUploadDto productDto)
    {
        var product = await _context.Products.Include(p => p.Categories).FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound();
        }

        product.Name = productDto.Name;
        product.Price = productDto.Price;
        product.Cost = productDto.Cost;
        product.UnitType = productDto.UnitType;
        product.Stock = productDto.Stock;

        // Update Categories
        if (productDto.CategoryIds != null)
        {
            product.Categories.Clear(); // Remove existing relations
            if (productDto.CategoryIds.Count > 0)
            {
                var categories = await _context.Categories
                    .Where(c => productDto.CategoryIds.Contains(c.Id))
                    .ToListAsync();

                foreach (var category in categories)
                {
                    product.Categories.Add(category);
                }
            }
        }

        // Update Image if provided
        if (productDto.ImageFile != null && productDto.ImageFile.Length > 0)
        {
            using (var memoryStream = new MemoryStream())
            {
                await productDto.ImageFile.CopyToAsync(memoryStream);
                product.Image = memoryStream.ToArray();
                product.ImageContentType = productDto.ImageFile.ContentType;
            }
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ProductExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // DELETE PRODUCT
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Categories)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound();
        }

        try
        {
            // 1. Clear ProductCategory join table
            product.Categories.Clear();

            // 2. Delete related orders
            var associatedOrders = await _context.Orders.Where(o => o.ProductId == id).ToListAsync();
            if (associatedOrders.Any())
            {
                _context.Orders.RemoveRange(associatedOrders);
            }

            // 3. Delete the product
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            var innerMsg = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
            return BadRequest($"Silme işlemi sırasında hata: {innerMsg}");
        }

        return NoContent();
    }

    private bool ProductExists(int id)
    {
        return _context.Products.Any(e => e.Id == id);
    }
}