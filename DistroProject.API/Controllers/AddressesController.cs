using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using DistroProject.API.Data;
using DistroProject.API.Models;
using System.Security.Claims;

namespace DistroProject.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AddressesController : ControllerBase
{
    private readonly AppDbContext _context;

    public AddressesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/addresses/my-addresses
    [HttpGet("my-addresses")]
    public async Task<ActionResult<IEnumerable<CustomerAddress>>> GetMyAddresses()
    {
        var userId = User.FindFirst("userId")?.Value;
        if (userId == null) return Unauthorized();

        return await _context.CustomerAddresses
            .Where(a => a.UserId == int.Parse(userId))
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    // POST: api/addresses
    [HttpPost]
    public async Task<ActionResult<CustomerAddress>> CreateAddress([FromBody] CustomerAddress address)
    {
        var userId = User.FindFirst("userId")?.Value;
        if (userId == null) return Unauthorized();

        address.UserId = int.Parse(userId);
        address.CreatedAt = DateTime.Now;

        // If this is set as default, remove default from others
        if (address.IsDefault)
        {
            var existingDefaults = await _context.CustomerAddresses
                .Where(a => a.UserId == address.UserId && a.IsDefault)
                .ToListAsync();
            existingDefaults.ForEach(a => a.IsDefault = false);
        }

        // If this is first address, make it default
        var count = await _context.CustomerAddresses.CountAsync(a => a.UserId == address.UserId);
        if (count == 0) address.IsDefault = true;

        _context.CustomerAddresses.Add(address);
        await _context.SaveChangesAsync();

        return Ok(address);
    }

    // PUT: api/addresses/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAddress(int id, [FromBody] CustomerAddress updated)
    {
        var userId = User.FindFirst("userId")?.Value;
        if (userId == null) return Unauthorized();

        var address = await _context.CustomerAddresses.FindAsync(id);
        if (address == null || address.UserId != int.Parse(userId))
            return NotFound();

        address.Title = updated.Title;
        address.FullAddress = updated.FullAddress;
        address.Lat = updated.Lat;
        address.Lng = updated.Lng;

        await _context.SaveChangesAsync();
        return Ok(address);
    }

    // PUT: api/addresses/{id}/set-default
    [HttpPut("{id}/set-default")]
    public async Task<IActionResult> SetDefault(int id)
    {
        var userId = User.FindFirst("userId")?.Value;
        if (userId == null) return Unauthorized();

        var uid = int.Parse(userId);

        // Remove default from all
        var all = await _context.CustomerAddresses
            .Where(a => a.UserId == uid)
            .ToListAsync();
        all.ForEach(a => a.IsDefault = false);

        // Set selected as default
        var address = all.FirstOrDefault(a => a.Id == id);
        if (address == null) return NotFound();
        address.IsDefault = true;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Default address updated." });
    }

    // DELETE: api/addresses/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAddress(int id)
    {
        var userId = User.FindFirst("userId")?.Value;
        if (userId == null) return Unauthorized();

        var address = await _context.CustomerAddresses.FindAsync(id);
        if (address == null || address.UserId != int.Parse(userId))
            return NotFound();

        _context.CustomerAddresses.Remove(address);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Address deleted." });
    }
}
