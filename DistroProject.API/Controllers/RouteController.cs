using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using DistroProject.API.Data;
using System.Security.Claims;
using System.Text.Json;

namespace DistroProject.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Driver")]
public class RouteController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly HttpClient _httpClient;

    public RouteController(AppDbContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClient = httpClientFactory.CreateClient();
    }

    // GET /api/route/optimize?driverLat=xx&driverLng=xx
    [HttpGet("optimize")]
    public async Task<IActionResult> OptimizeRoute([FromQuery] double driverLat, [FromQuery] double driverLng)
    {
        var driverId = User.FindFirst("userId")?.Value;
        if (driverId == null) return Unauthorized();

        // Fetch driver's shipped orders with coordinates
        var orders = await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Product)
            .Where(o => o.DriverId == int.Parse(driverId)
                     && o.Status == "Shipped"
                     && o.DeliveryLat != null
                     && o.DeliveryLng != null)
            .ToListAsync();

        if (!orders.Any())
            return Ok(new { message = "No orders with location data found.", optimizedRoute = new List<object>() });

        // Build waypoints: driver start + all delivery points
        var points = new List<(double Lat, double Lng)> { (driverLat, driverLng) };
        points.AddRange(orders.Select(o => (o.DeliveryLat!.Value, o.DeliveryLng!.Value)));

        // Build OSRM Table API URL
        // Format: {lng},{lat};{lng},{lat};...
        var coordsStr = string.Join(";", points.Select(p => $"{p.Lng},{p.Lat}"));
        var osrmUrl = $"http://router.project-osrm.org/table/v1/driving/{coordsStr}?annotations=distance";

        double[][] distanceMatrix;
        try
        {
            var response = await _httpClient.GetAsync(osrmUrl);
            if (!response.IsSuccessStatusCode)
            {
                // Fallback: Haversine formula
                distanceMatrix = BuildHaversineMatrix(points);
            }
            else
            {
                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);
                var durationsRoot = doc.RootElement.GetProperty("distances");
                distanceMatrix = durationsRoot.EnumerateArray()
                    .Select(row => row.EnumerateArray().Select(v => v.GetDouble()).ToArray())
                    .ToArray();
            }
        }
        catch
        {
            // Fallback: Haversine
            distanceMatrix = BuildHaversineMatrix(points);
        }

        // Nearest Neighbor algorithm
        int n = orders.Count;
        var visited = new bool[n];
        var sequence = new List<int>(); // indices into orders list
        int current = 0; // Start from driver position (index 0 in distanceMatrix)

        for (int step = 0; step < n; step++)
        {
            double minDist = double.MaxValue;
            int nearest = -1;

            for (int i = 0; i < n; i++)
            {
                if (!visited[i])
                {
                    double dist = distanceMatrix[current][i + 1]; // +1 because index 0 = driver
                    if (dist < minDist)
                    {
                        minDist = dist;
                        nearest = i;
                    }
                }
            }

            if (nearest == -1) break;
            visited[nearest] = true;
            sequence.Add(nearest);
            current = nearest + 1;
        }

        // Build response
        var result = sequence.Select((orderIdx, seqNum) =>
        {
            var order = orders[orderIdx];
            return new
            {
                sequence = seqNum + 1,
                orderId = order.Id,
                lat = order.DeliveryLat,
                lng = order.DeliveryLng,
                address = order.DeliveryAddress ?? "Adres bilgisi yok",
                customerName = order.Customer?.Name ?? $"Müşteri #{order.CustomerId}",
                productName = order.Product?.Name ?? $"Ürün #{order.ProductId}",
                quantity = order.Quantity,
                totalPrice = order.TotalPrice
            };
        }).ToList();

        return Ok(new
        {
            driverLat,
            driverLng,
            optimizedRoute = result,
            totalStops = result.Count
        });
    }

    // Haversine fallback (Earth's radius in meters)
    private static double[][] BuildHaversineMatrix(List<(double Lat, double Lng)> points)
    {
        int n = points.Count;
        var matrix = new double[n][];
        for (int i = 0; i < n; i++)
        {
            matrix[i] = new double[n];
            for (int j = 0; j < n; j++)
            {
                matrix[i][j] = Haversine(points[i].Lat, points[i].Lng,
                                          points[j].Lat, points[j].Lng);
            }
        }
        return matrix;
    }

    private static double Haversine(double lat1, double lng1, double lat2, double lng2)
    {
        const double R = 6371000; // meters
        var dLat = ToRad(lat2 - lat1);
        var dLng = ToRad(lng2 - lng1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }

    private static double ToRad(double deg) => deg * Math.PI / 180.0;
}
