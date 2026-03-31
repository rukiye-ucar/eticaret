using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DistroProject.API.Data;

namespace DistroProject.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CompanyController : ControllerBase
{
    private readonly AppDbContext _context;
    public CompanyController(AppDbContext context) => _context = context;

    // GET api/company — returns all content blocks sorted by SortOrder
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _context.CompanyInfos
            .OrderBy(c => c.SortOrder)
            .ToListAsync();
        return Ok(items);
    }
}
