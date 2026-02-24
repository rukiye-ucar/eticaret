using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DistroProject.API.Data;
using DistroProject.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

namespace DistroProject.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<ActionResult<User>> Register(RegisterDto request)
    {
        var user = new User 
        { 
            Name = request.Username, 
            Email = request.Email, 
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Customer"
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(user);
    }

    [HttpPost("create-driver")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<User>> CreateDriver(RegisterDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest("Email already exists.");
        }

        var user = new User 
        { 
            Name = request.Username, 
            Email = request.Email, 
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Driver"
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<string>> Login([FromBody] LoginDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)) 
        {
            return BadRequest("Invalid email or password!");
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes("B374A26A71448593AA2744749EF41EE3");
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[] 
            {
                new Claim("userId", user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return Ok(new { token = tokenHandler.WriteToken(token) });
    }



    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<object>> GetMe()
    {
        var userId = User.FindFirst("userId")?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var user = await _context.Users.FindAsync(int.Parse(userId!));
        if (user == null) return NotFound();
        return Ok(new { Id = user.Id, Role = role, Name = user.Name, Email = user.Email, IsPremium = user.IsPremium, Balance = user.Balance });
    }

    [HttpGet("drivers")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<User>>> GetDrivers()
    {
        return await _context.Users
            .Where(u => u.Role == "Driver")
            .ToListAsync();
    }

    [HttpPost("create-admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<User>> CreateAdmin(RegisterDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest("Email already exists.");
        }

        var user = new User 
        { 
            Name = request.Username, 
            Email = request.Email, 
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Admin"
        };
        
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(user);
    }

    [HttpGet("admins")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<User>>> GetAdmins()
    {
        return await _context.Users
            .Where(u => u.Role == "Admin")
            .ToListAsync();
    }

    [HttpGet("customers")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<User>>> GetCustomers()
    {
        return await _context.Users
            .Where(u => u.Role == "Customer")
            .ToListAsync();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound();
        }

        // Prevent deleting self (optional but recommended safety check)
        var currentUserId = User.FindFirst("userId")?.Value;
        if (currentUserId != null && int.Parse(currentUserId) == id)
        {
            return BadRequest("You cannot delete your own account.");
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // Set customer as premium by email (Admin only)
    [HttpPut("set-premium")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetPremium([FromBody] SetPremiumDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null) return NotFound("User not found with this email.");
        if (user.Role != "Customer") return BadRequest("Only customers can be set as premium.");

        user.IsPremium = dto.IsPremium;
        await _context.SaveChangesAsync();
        return Ok(new { message = $"User {user.Email} premium status: {user.IsPremium}" });
    }

    // Make payment (Premium customers only)
    [HttpPost("make-payment")]
    [Authorize]
    public async Task<IActionResult> MakePayment([FromBody] PaymentDto dto)
    {
        var userId = User.FindFirst("userId")?.Value;
        if (userId == null) return Unauthorized();

        var user = await _context.Users.FindAsync(int.Parse(userId));
        if (user == null) return NotFound();
        if (!user.IsPremium) return BadRequest("Only premium users can make payments.");
        if (dto.Amount <= 0) return BadRequest("Amount must be positive.");
        
        if (user.Balance >= 0) return BadRequest("You have no debt to pay.");
        if (user.Balance + dto.Amount > 0) 
        {
            return BadRequest($"You can only pay up to {Math.Abs(user.Balance)} to clear your debt.");
        }

        user.Balance += dto.Amount;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Payment successful!", balance = user.Balance });
    }
}

public class SetPremiumDto
{
    public string Email { get; set; } = string.Empty;
    public bool IsPremium { get; set; } = true;
}

public class PaymentDto
{
    public decimal Amount { get; set; }
}